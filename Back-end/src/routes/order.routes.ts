import { Router } from "express";
import { getOrders, createOrder, cancelOrder, updateOrderStatus } from "../controllers/order.controller";
import { addReview } from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.get("/", authMiddleware, getOrders);
router.post("/", authMiddleware, createOrder);
router.patch("/:id/cancel", authMiddleware, cancelOrder);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.post("/:orderId/reviews", authMiddleware, addReview);

export default router;