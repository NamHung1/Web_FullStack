import { Router } from "express";
import { getCart, addToCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getCart);

router.post("/", authMiddleware, addToCart);

router.delete("/:productId", authMiddleware, removeFromCart);

router.patch("/:productId", authMiddleware, updateCartQuantity);

export default router;