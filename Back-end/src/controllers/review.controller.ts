import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Order from '../models/Order';
import Product from '../models/Product';

const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

const recalculateProductRating = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$productId',
        ratingAverage: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const ratingAverage = stats[0]?.ratingAverage || 0;
  const ratingCount = stats[0]?.ratingCount || 0;

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Number(ratingAverage.toFixed(1)),
    ratingCount,
  });
};

export const addReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const orderId = req.params.orderId || req.body.orderId;
    const { productId, rating, comment } = req.body;

    if (!productId || !orderId || !rating) {
      return res.status(400).json({ message: 'productId, orderId and rating are required' });
    }

    if (!isValidObjectId(productId) || !isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'Invalid productId or orderId' });
    }

    const normalizedRating = Number(rating);

    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (String(order.userId) !== userId) {
      return res.status(403).json({ message: 'You can only review your own purchased products' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed orders can be reviewed' });
    }

    const purchasedProduct = order.products.some((item: any) => String(item.productId) === String(productId));

    if (!purchasedProduct) {
      return res.status(400).json({ message: 'Product not found in this order' });
    }

    const review = await Review.findOneAndUpdate(
      { userId, productId, orderId },
      {
        userId,
        productId,
        orderId,
        rating: normalizedRating,
        comment: comment?.trim() || '',
      },
      { new: true, upsert: true },
    ).populate('userId', 'name email');

    await recalculateProductRating(productId);

    return res.json(review);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit review' });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId || '');

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid productId' });
    }

    const reviews = await Review.find({ productId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(reviews);
  } catch {
    return res.status(500).json({ message: 'Failed to load product reviews' });
  }
};

export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('productId', 'name images')
      .populate('orderId', '_id status')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(reviews);
  } catch {
    return res.status(500).json({ message: 'Failed to load reviews' });
  }
};