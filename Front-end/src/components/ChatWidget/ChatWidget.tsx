import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, Empty, Input, List, Typography } from 'antd';
import {
  CloseOutlined,
  MessageOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { chatApi } from '../../api/chat.api';
import type { ChatMessage } from '../../types/chat';
import { useAuthStore } from '../../store/authStore';
import { useChatEvents } from '../../hooks/useChatEvents';
import styles from './ChatWidget.module.css';

const ChatWidget = () => {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [content, setContent] = useState('');

  const listRef = useRef<HTMLDivElement>(null);

  const adminId = useMemo(() => {
    const last = messages[messages.length - 1];

    if (!last) {
      return '';
    }

    return last.sender.role === 'admin' ? last.sender._id : last.receiver._id;
  }, [messages]);

  const loadUnread = useCallback(async () => {
    if (!user || user.role !== 'user') {
      return;
    }

    const data = await chatApi.getUnreadCount();
    setUnreadCount(data.unreadCount);
  }, [user]);

  const loadConversation = useCallback(async () => {
    if (!user || user.role !== 'user') {
      return;
    }

    const data = await chatApi.getConversation('admin');
    setMessages(data.messages);
    setUnreadCount(0);
  }, [user]);

  useChatEvents(
    useCallback(() => {
      loadUnread();
      if (open) {
        loadConversation();
      }
    }, [loadConversation, loadUnread, open]),
  );

  useEffect(() => {
    let ignore = false;

    const fetchUnread = async () => {
      if (!user || user.role !== 'user') {
        return;
      }

      const data = await chatApi.getUnreadCount();

      if (!ignore) {
        setUnreadCount(data.unreadCount);
      }
    };

    void fetchUnread();

    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    if (open) {
      let ignore = false;

      const fetchConversation = async () => {
        if (!user || user.role !== 'user') {
          return;
        }

        const data = await chatApi.getConversation('admin');

        if (!ignore) {
          setMessages(data.messages);
          setUnreadCount(0);
        }
      };

      void fetchConversation();

      return () => {
        ignore = true;
      };
    }
  }, [open, user]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) {
      return;
    }

    const data = await chatApi.sendMessage({
      content: content.trim(),
      receiverId: adminId || undefined,
    });

    setMessages((prev) => [...prev, data.message]);
    setContent('');
  };

  if (!user || user.role !== 'user') {
    return null;
  }

  return (
    <>
      <Badge count={unreadCount} size="small">
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          className={styles.floatingBtn}
          onClick={() => setOpen((prev) => !prev)}
        />
      </Badge>

      {open && (
        <Card
          className={styles.chatPanel}
          title="Message"
          extra={
            <Button
              size="small"
              onClick={() => setOpen(false)}
              className={styles.closeBtn}
            >
              <CloseOutlined />
            </Button>
          }
        >
          {messages.length === 0 ? (
            <Empty
              description="There is no message yet"
              className={styles.empty}
            />
          ) : (
            <List
              className={styles.messageList}
              dataSource={messages}
              renderItem={(item) => {
                const mine = item.sender._id === user._id;
                return (
                  <List.Item className={mine ? styles.mine : styles.their}>
                    <div className={styles.messageBubble}>
                      <Typography.Text>{item.content}</Typography.Text>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}

          <div className={styles.inputRow}>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Typing..."
              onPressEnter={handleSend}
              className={styles.inputField}
            />
            <Button type="primary" onClick={handleSend} className={styles.sendBtn}>
              <SendOutlined />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;
