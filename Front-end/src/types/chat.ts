import type { User } from "./user";

export interface ChatMessage {
  _id: string;
  sender: User;
  receiver: User;
  content: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatUser extends Pick<User, "_id" | "name" | "email"> {
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
}