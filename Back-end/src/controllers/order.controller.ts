import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import Review from '../models/Review';

const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

const restoreOrderStock = async (products: any[]) => {
  await Promise.all(
    products.map((item) => {
      const productId = item.productId?._id || item.productId;
      const quantity = Number(item.quantity) || 0;

      if (!productId || quantity <= 0) {
        return Promise.resolve();
      }

      return Product.findByIdAndUpdate(productId, {
        $inc: { stock: quantity },
      });
    }),
  );
};

const attachReviewsForUserOrders = async (orders: any[], userId: string) => {
  const conditions: Array<{
    userId: string;
    productId: string;
    orderId: string;
  }> = [];

  orders.forEach((order) => {
    const orderId = order._id?.toString?.();

    (order.products || []).forEach((item: any) => {
      const productId = item.productId?._id?.toString?.();

      if (productId && orderId) {
        conditions.push({ userId, productId, orderId });
      }
    });
  });

  if (!conditions.length) {
    return orders;
  }

  const reviews = await Review.find({ $or: conditions })
    .sort({ createdAt: -1 })
    .lean();

  const reviewMap = new Map(
    reviews.map((review: any) => [
      `${String(review.orderId)}:${String(review.productId)}`,
      review,
    ]),
  );

  return orders.map((order) => {
    const orderId = order._id?.toString?.();

    return {
      ...order,
      products: (order.products || []).map((item: any) => {
        const productId = item.productId?._id?.toString?.();
        const key = orderId && productId ? `${orderId}:${productId}` : '';

        return {
          ...item,
          review: key ? reviewMap.get(key) || null : null,
        };
      }),
    };
  });
};

const attachReviewsForAdminOrders = async (orders: any[]) => {
  const conditions: Array<{
    userId: string;
    productId: string;
    orderId: string;
  }> = [];

  orders.forEach((order) => {
    const userId = order.userId?._id?.toString?.();
    const orderId = order._id?.toString?.();

    (order.products || []).forEach((item: any) => {
      const productId = item.productId?._id?.toString?.();

      if (userId && productId && orderId) {
        conditions.push({ userId, productId, orderId });
      }
    });
  });

  if (!conditions.length) {
    return orders;
  }

  const reviews = await Review.find({
    $or: conditions,
  })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const reviewMap = new Map(
    reviews.map((review: any) => [
      `${String(review.userId?._id || review.userId)}:${String(review.orderId)}:${String(review.productId)}`,
      review,
    ]),
  );

  return orders.map((order) => {
    const userId = order.userId?._id?.toString?.();
    const orderId = order._id?.toString?.();

    return {
      ...order,
      products: (order.products || []).map((item: any) => {
        const productId = item.productId?._id?.toString?.();
        const key =
          userId && orderId && productId
            ? `${userId}:${orderId}:${productId}`
            : '';

        return {
          ...item,
          review: key ? reviewMap.get(key) || null : null,
        };
      }),
    };
  });
};

// Lấy thông tin của các orders
export const getOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const orders = await Order.find({ userId })
    .populate('products.productId')
    .sort({ createdAt: -1 })
    .lean();

  const ordersWithReviews = await attachReviewsForUserOrders(orders, userId);

  res.json(ordersWithReviews);
};

export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
    .populate('products.productId')
    .sort({ createdAt: -1 })
    .lean();

  const ordersWithReviews = await attachReviewsForAdminOrders(orders);
  res.json(ordersWithReviews);
};

// Tạo order mới
export const createOrder = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { address, phone, paymentMethod } = req.body;

  if (!address || !phone || !paymentMethod) {
    return res
      .status(400)
      .json({ message: 'Address, phone and payment method are required' });
  }

  if (!['cod', 'bank_transfer', 'momo'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  const cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart || !(cart.items as any[]).length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const validCartItems = (cart.items as any[]).filter((item) => item.productId);

  if (validCartItems.length !== (cart.items as any[]).length) {
    (cart.items as any[]) = validCartItems;
    await cart.save();
  }

  if (!validCartItems.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const decrementedProducts: Array<{ productId: string; quantity: number }> =
    [];

  for (const item of validCartItems) {
    const quantity = Number(item.quantity) || 0;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity in cart' });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: item.productId._id,
        stock: { $gte: quantity },
      },
      {
        $inc: { stock: -quantity },
      },
      {
        new: true,
      },
    );

    if (!updatedProduct) {
      if (decrementedProducts.length) {
        await Promise.all(
          decrementedProducts.map((product) =>
            Product.findByIdAndUpdate(product.productId, {
              $inc: { stock: product.quantity },
            }),
          ),
        );
      }

      const currentProduct = await Product.findById(item.productId._id).lean();
      const availableStock = Number(currentProduct?.stock) || 0;

      return res.status(400).json({
        message: `Product "${item.productId.name}" is out of stock or does not have enough quantity`,
        unavailableProducts: [
          {
            productId: String(item.productId._id),
            productName: item.productId.name,
            requestedQuantity: quantity,
            availableStock,
          },
        ],
      });
    }

    decrementedProducts.push({
      productId: String(item.productId._id),
      quantity,
    });
  }

  const products = validCartItems.map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
    price: item.productId.price,
  }));

  const totalPrice = products.reduce(
    (sum: number, item: { quantity: number; price: number }) =>
      sum + item.quantity * item.price,
    0,
  );

  const order = await Order.create({
    userId,
    products,
    totalPrice,
    shippingAddress: address,
    phone,
    paymentMethod,
  });

  (cart.items as any[]).splice(0, validCartItems.length);
  await cart.save();

  res.json(order);
};

// Huỷ đặt hàng
export const cancelOrder = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const orderId = String(req.params.id);

  if (!isValidObjectId(orderId)) {
    return res.status(400).json({ message: 'Invalid order id' });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (String(order.userId) !== userId) {
    return res
      .status(403)
      .json({ message: 'You can only cancel your own order' });
  }

  if (order.status !== 'pending') {
    return res
      .status(400)
      .json({ message: 'Only pending orders can be cancelled' });
  }

  const { reason } = req.body;

  await restoreOrderStock(order.products as any[]);

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      status: 'cancelled',
      cancelReason: reason,
    },
    { new: true },
  );

  res.json(updatedOrder);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const orderId = String(req.params.id);

  if (!isValidObjectId(orderId)) {
    return res.status(400).json({ message: 'Invalid order id' });
  }

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const currentOrder = await Order.findById(orderId);

  if (!currentOrder) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (currentOrder.status === 'cancelled' && status !== 'cancelled') {
    return res.status(400).json({
      message:
        'Cancelled orders cannot be reopened because stock was already restored',
    });
  }

  if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
    await restoreOrderStock(currentOrder.products as any[]);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true },
  );

  res.json(order);
};
