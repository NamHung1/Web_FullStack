import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ChatMessage from '../models/ChatMessage';
import User from '../models/User';
import {
  emitToUser,
  registerSseClient,
  removeSseClient,
} from '../config/socket';

const getAdmin = async () => {
  return User.findOne({ role: 'admin', isDeleted: false }).select('_id name');
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const senderId = authUser.id;
    const senderRole = authUser.role;
    const { content, receiverId } = req.body;

    if (!content || !String(content).trim()) {
      return res
        .status(400)
        .json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    let targetReceiverId = receiverId;

    if (senderRole === 'user') {
      const admin = await getAdmin();

      if (!admin) {
        return res.status(404).json({ message: 'Không tìm thấy admin' });
      }

      targetReceiverId = String(admin._id);
    }

    if (
      !targetReceiverId ||
      !mongoose.Types.ObjectId.isValid(String(targetReceiverId))
    ) {
      return res.status(400).json({ message: 'receiverId không hợp lệ' });
    }

    const message = await ChatMessage.create({
      sender: senderId,
      receiver: targetReceiverId,
      content: String(content).trim(),
    });

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('sender', '_id name email role')
      .populate('receiver', '_id name email role');

    const payload = {
      message: populatedMessage,
    };

    emitToUser(String(targetReceiverId), 'chat:new_message', payload);
    emitToUser(String(senderId), 'chat:new_message', payload);

    return res.json(payload);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const currentUserId = String(authUser.id);
    const currentUserRole = authUser.role;
    const withUserId = req.params.userId;

    let targetUserId = withUserId;

    if (currentUserRole === 'user') {
      const admin = await getAdmin();

      if (!admin) {
        return res.status(404).json({ message: 'Không tìm thấy admin' });
      }

      targetUserId = String(admin._id);
    }

    const messages = await ChatMessage.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', '_id name email role')
      .populate('receiver', '_id name email role');

    await ChatMessage.updateMany(
      {
        sender: targetUserId,
        receiver: currentUserId,
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      },
    );

    return res.json({ messages });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getChatUsers = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;

    if (authUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await User.find({ role: 'user', isDeleted: false }).select(
      '_id name email',
    );

    const usersWithMeta = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await ChatMessage.countDocuments({
          sender: user._id,
          receiver: authUser.id,
          readAt: null,
        });

        const lastMessage = await ChatMessage.findOne({
          $or: [
            { sender: user._id, receiver: authUser.id },
            { sender: authUser.id, receiver: user._id },
          ],
        }).sort({ createdAt: -1 });

        return {
          ...user.toObject(),
          unreadCount,
          lastMessage,
        };
      }),
    );

    usersWithMeta.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    return res.json({ users: usersWithMeta });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const streamEvents = async (req: Request, res: Response) => {
  const authUser = (req as any).user;
  const userId = String(authUser.id);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  registerSseClient(userId, res);
  res.write(
    `event: connected\ndata: ${JSON.stringify({ connected: true })}\n\n`,
  );

  req.on('close', () => {
    removeSseClient(userId, res);
  });
};
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;

    const unreadCount = await ChatMessage.countDocuments({
      receiver: authUser.id,
      readAt: null,
    });

    return res.json({ unreadCount });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
