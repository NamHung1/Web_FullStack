import { Request, Response } from "express";
import Review from "../models/Review";
import Order from '../models/Order';

export const addReview = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const orderId = req.params.orderId || req.body.orderId;
  const { productId, rating, comment } = req.body;

  if (!productId || !orderId || !rating) {
    return res
      .status(400)
      .json({ message: 'productId, orderId and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (String(order.userId) !== userId) {
    return res
      .status(403)
      .json({ message: 'You can only review your own purchased products' });
  }

  if (order.status !== 'completed') {
    return res
      .status(400)
      .json({ message: 'Only completed orders can be reviewed' });
  }

  const purchasedProduct = order.products.some(
    (item: any) => String(item.productId) === String(productId),
  );

  if (!purchasedProduct) {
    return res.status(400).json({ message: 'Product not found in this order' });
  }

  const review = await Review.findOneAndUpdate(
    {
      userId,
      productId,
      orderId,
    },
    {
      userId,
      productId,
      orderId,
      rating,
      comment,
    },
    { new: true, upsert: true },
  );

  res.json(review);
};

export const getProductReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({ productId: req.params.productId })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.json(reviews);
};