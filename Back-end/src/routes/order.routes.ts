import { Router } from "express";
import { getOrders, createOrder, cancelOrder, updateOrderStatus } from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.get("/", authMiddleware, getOrders);
router.post("/", authMiddleware, createOrder);
router.patch("/:id/cancel", authMiddleware, cancelOrder);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;