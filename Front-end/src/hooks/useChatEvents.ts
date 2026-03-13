import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export const useChatEvents = (onMessage: () => void) => {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      return;
    }

    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
    const source = new EventSource(`${baseUrl}/chat/stream?token=${token}`);

    source.addEventListener("chat:new_message", () => {
      onMessage();
    });

    return () => {
      source.close();
    };
  }, [onMessage, token]);
};
