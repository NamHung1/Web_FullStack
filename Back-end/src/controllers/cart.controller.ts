import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import mongoose from 'mongoose';

const cleanAndPopulateCart = async (cartId: string) => {
  const populatedCart = await Cart.findById(cartId).populate('items.productId');

  if (!populatedCart) {
    return null;
  }

  const originalLength = (populatedCart.items as any[]).length;

  (populatedCart.items as any[]) = (populatedCart.items as any[]).filter(
    (item) => item.productId,
  );

  if ((populatedCart.items as any[]).length !== originalLength) {
    await populatedCart.save();
  }

  return populatedCart;
};

export const getCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const cleanedCart = await cleanAndPopulateCart(String(cart._id));

  res.json(cleanedCart);
};

export const addToCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const { productId, quantity = 1 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid productId' });
  }

  const normalizedQuantity = Number(quantity);

  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
    return res.status(400).json({ message: 'Quantity must be a positive integer' });
  }

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const availableStock = Number(product.stock);

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const existingItem = (cart.items as any[]).find(
    (item) => item.productId?.toString() === productId,
  );

  const currentQuantity = existingItem ? Number(existingItem.quantity) || 0 : 0;
  const nextQuantity = currentQuantity + normalizedQuantity;

  if (nextQuantity > availableStock) {
    return res.status(400).json({
      message: `Only ${availableStock} item(s) of "${product.name}" are available in stock`,
      productName: product.name,
      availableStock,
      requestedQuantity: nextQuantity,
    });
  }

  if (existingItem) {
    existingItem.quantity = nextQuantity;
  } else {
    (cart.items as any[]).push({
      productId: new mongoose.Types.ObjectId(productId),
      quantity: normalizedQuantity,
    });
  }

  await cart.save();

  const updatedCart = await cleanAndPopulateCart(String(cart._id));

  res.json(updatedCart);
};

export const removeFromCart = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const productId = String(req.params.productId);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid productId' });
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  (cart.items as any[]) = (cart.items as any[]).filter(
    (item) => item.productId?.toString() !== productId,
  );

  await cart.save();

  const updatedCart = await cleanAndPopulateCart(String(cart._id));

  res.json(updatedCart);
};

export const updateCartQuantity = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const productId = String(req.params.productId);
  const quantity = Number(req.body.quantity);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid productId' });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ message: 'The quantity must be a positive integer' });
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const item = (cart.items as any[]).find(
    (cartItem) => cartItem.productId?.toString() === productId,
  );

  if (!item) {
    return res.status(404).json({ message: 'No product found in the cart' });
  }

  const product = await Product.findById(productId);

  if (!product) {
    (cart.items as any[]) = (cart.items as any[]).filter(
      (cartItem) => cartItem.productId?.toString() !== productId,
    );
    await cart.save();

    return res.status(404).json({ message: 'Product no longer exists and was removed from cart' });
  }

  const availableStock = Number(product.stock) || 0;

  if (quantity > availableStock) {
    return res.status(400).json({
      message: `Only ${availableStock} item(s) of "${product.name}" are available in stock`,
      productName: product.name,
      availableStock,
      requestedQuantity: quantity,
    });
  }

  item.quantity = quantity;
  await cart.save();

  const updatedCart = await cleanAndPopulateCart(String(cart._id));

  res.json(updatedCart);
};
