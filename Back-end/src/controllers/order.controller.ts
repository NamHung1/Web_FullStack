import { Request, Response } from "express";
import Order from "../models/Order";
import Cart from "../models/Cart";

// Lấy thông tin của các orders
export const getOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const orders = await Order.find({ userId }).populate("products.productId");

  res.json(orders);
};

export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await Order.find().populate("userId", "name email").populate("products.productId");

  res.json(orders);
};

// Tạo order mới
export const createOrder = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { address, phone } = req.body;

  if (!address || !phone) {
    return res.status(400).json({ message: "Address and phone are required" });
  }

  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart || !(cart.items as any[]).length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const products = (cart.items as any[]).map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
    price: item.productId.price
  }));

  const totalPrice = products.reduce(
    (sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price,
    0
  );

  const order = await Order.create({
    userId,
    products,
    totalPrice,
    shippingAddress: address,
    phone,
    paymentMethod: "cod"
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
    return res.status(404).json({ message: "Order not found" });
  }

  if (String(order.userId) !== userId) {
    return res.status(403).json({ message: "You can only cancel your own order" });
  }

  if (order.status !== "pending") {
    return res.status(400).json({ message: "Only pending orders can be cancelled" });
  }

  const { reason } = req.body;

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: "cancelled",
      cancelReason: reason
    },
    { new: true }
  );

  res.json(updatedOrder);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!["pending", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

};