import { Router } from "express";
import {
  getDashboard,
  getUsers,
  deleteUser
} from "../controllers/admin.controller";
import { getAllOrders, updateOrderStatus } from "../controllers/order.controller";

import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.get("/dashboard", authMiddleware, adminMiddleware, getDashboard);

router.get("/users", authMiddleware, adminMiddleware, getUsers);

router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

router.get("/orders", authMiddleware, adminMiddleware, getAllOrders);

router.patch("/orders/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;