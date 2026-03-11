import { Request, Response } from "express";
import Order from "../models/Order";

export const getOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const orders = await Order.find({ userId }).populate("products.productId");

  res.json(orders);
};

export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find().populate("userId", "name email").populate("products.productId");

  res.json(orders);
};

export const createOrder = async (req: Request, res: Response) => {

  const userId = (req as any).user.id;

  const order = await Order.create({
    userId,
    products: req.body.products,
    totalPrice: req.body.totalPrice
  });

  res.json(order);
};

export const cancelOrder = async (req: Request, res: Response) => {

  const { reason } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: "cancelled",
      cancelReason: reason
    },
    { new: true }
  );

  res.json(order);
};