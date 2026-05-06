import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';

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
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Admin accounts cannot be deleted' });
  }

  await user.deleteOne();

  res.json({ message: 'User deleted' });
};
