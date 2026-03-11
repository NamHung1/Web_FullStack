import { Router } from "express";
import { getOrders, createOrder, cancelOrder } from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getOrders);
router.post("/", authMiddleware, createOrder);
router.patch("/:id/cancel", authMiddleware, cancelOrder);

export default router;