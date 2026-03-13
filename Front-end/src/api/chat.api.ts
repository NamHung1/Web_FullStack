import api from "./axios";
import type { ChatMessage, ChatUser } from "../types/chat";

export const chatApi = {
  getUnreadCount: async () => {
    const { data } = await api.get<{ unreadCount: number }>("/chat/unread-count");
    return data;
  },

  getConversation: async (userId: string) => {
    const { data } = await api.get<{ messages: ChatMessage[] }>(`/chat/conversation/${userId}`);
    return data;
  },

  sendMessage: async (payload: { content: string; receiverId?: string }) => {
    const { data } = await api.post<{ message: ChatMessage }>("/chat/messages", payload);
    return data;
  },

  getChatUsers: async () => {
    const { data } = await api.get<{ users: ChatUser[] }>("/chat/users");
    return data;
  }
};