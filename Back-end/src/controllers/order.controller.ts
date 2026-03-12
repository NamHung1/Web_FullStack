import { Request, Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';

// Lấy thông tin của các orders
export const getOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const orders = await Order.find({ userId })
    .populate('products.productId')
    .sort({ createdAt: -1 });

  res.json(orders);
};

export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
    .populate('products.productId')
    .sort({ createdAt: -1 });

  res.json(orders);
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

  const decrementedProducts: Array<{ productId: string; quantity: number }> =
    [];

  for (const item of cart.items as any[]) {
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

      return res.status(400).json({
        message: `Product \"${item.productId.name}\" is out of stock or does not have enough quantity`,
      });
    }

    decrementedProducts.push({
      productId: String(item.productId._id),
      quantity,
    });
  }

  const products = (cart.items as any[]).map((item) => ({
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

  (cart.items as any[]).splice(0, (cart.items as any[]).length);
  await cart.save();

  res.json(order);
};

// Huỷ đặt hàng
export const cancelOrder = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const order = await Order.findById(req.params.id);

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

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
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

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json(order);
};
