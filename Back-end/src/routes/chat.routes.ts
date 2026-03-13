import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getChatUsers,
  getConversation,
  getUnreadCount,
  sendMessage,
  streamEvents
} from "../controllers/chat.controller";

const router = Router();

router.use(authMiddleware);

router.get("/stream", streamEvents);
router.get("/users", getChatUsers);
router.get("/unread-count", getUnreadCount);
router.get("/conversation/:userId", getConversation);
router.post("/messages", sendMessage);

export default router;