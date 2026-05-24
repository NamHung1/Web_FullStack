import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';

const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

export const getDashboard = async (_req: Request, res: Response) => {
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();

  const revenueResult = await Order.aggregate([
    {
      $match: {
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  const revenue = revenueResult[0]?.totalRevenue ?? 0;

  res.json({ totalUsers, totalOrders, totalProducts, revenue });
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await User.find();

  res.json(users);
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = String(req.params.id);

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Admin accounts cannot be deleted' });
  }

  await user.deleteOne();

  res.json({ message: 'User deleted' });
};
