import { Request, Response } from "express";
import Cart from "../models/Cart";
import mongoose from "mongoose";

export const getCart = async (req: Request, res: Response) => {

  const userId = (req as any).user.id;

  const cart = await Cart.findOne({ userId }).populate("items.productId");

  res.json(cart);
};

export const addToCart = async (req: Request, res: Response) => {

  const userId = (req as any).user.id;

  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  (cart.items as any[]).push({ productId: new mongoose.Types.ObjectId(productId), quantity });

  await cart.save();

  res.json(cart);
};

export const removeFromCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  (cart.items as any[]) = (cart.items as any[]).filter(item => item.productId?.toString() !== productId);

  await cart.save();

  res.json(cart);
};