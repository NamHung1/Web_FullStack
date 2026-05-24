import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input, List, Typography, message } from "antd";
import { chatApi } from "../../api/chat.api";
import type { ChatMessage, ChatUser } from "../../types/chat";
import { useAuthStore } from "../../store/authStore";
import { useChatEvents } from "../../hooks/useChatEvents";
import styles from "./Messenger.module.css";
import { SendOutlined } from "@ant-design/icons";

const getMessageUserId = (user: ChatMessage["sender"] | ChatMessage["receiver"] | string) => {
  if (!user) {
    return "";
  }

  return typeof user === "string" ? user : user._id;
}

const Messenger = () => {
  const admin = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");

  const activeUser = useMemo(
    () => users.find((item) => item._id === activeUserId),
    [activeUserId, users]
  );

  const loadUsers = useCallback(async () => {
    const data = await chatApi.getChatUsers();
    setUsers(data.users);
    if (!activeUserId && data.users[0]) {
      setActiveUserId(data.users[0]._id);
    }
  }, [activeUserId]);

  const loadConversation = useCallback(async () => {
    if (!activeUserId) {
      setMessages([]);
      return;
    }

    const data = await chatApi.getConversation(activeUserId);
    setMessages(data.messages);
  }, [activeUserId]);

  useChatEvents(
    useCallback(() => {
      loadUsers();
      loadConversation();
      message.info("You get new message");
    }, [loadConversation, loadUsers])
  );

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      const data = await chatApi.getChatUsers();

      if (ignore) {
        return;
      }

      setUsers(data.users)
      if (!activeUserId && data.users[0]) {
        setActiveUserId(data.users[0]._id);
      }
    };

    void fetchUsers();

    return () => {
      ignore = true;
    };
  }, [activeUserId]);

  useEffect(() => {
    let ignore = false;

    const fetchConversation = async () => {
      if (!activeUserId) {
        setMessages([]);
        return;
      }

      const data = await chatApi.getConversation(activeUserId);

      if (!ignore) {
        setMessages(data.messages);
      }
    };

    void fetchConversation();

    return () => {
      ignore = true;
    };
  }, [activeUserId]);

  const handleSend = async () => {
    if (!activeUserId || !content.trim()) {
      return;
    }

    const data = await chatApi.sendMessage({
      content: content.trim(),
      receiverId: activeUserId
    });

    setMessages((prev) => [...prev, data.message]);
    setContent("");
  };

  return (
    <div className={styles.wrap}>
      <Card className={styles.usersPanel} title="user">
        <List
          dataSource={users}
          renderItem={(item) => (
            <List.Item
              className={item._id === activeUserId ? styles.activeUser : styles.userItem}
              onClick={() => setActiveUserId(item._id)}
            >
              <div>
                <Typography.Text strong>{item.name}</Typography.Text>
                <div className={styles.userEmail}>{item.email}</div>
              </div>
              <Badge count={item.unreadCount} />
            </List.Item>
          )}
        />
      </Card>

      <Card className={styles.chatPanel} title={activeUser ? `Chat with ${activeUser.name}` : " "}>
        <div className={styles.messageList}>
          {messages.map((item) => {
            const senderId = getMessageUserId(item.sender);
            const receiverId = getMessageUserId(item.receiver);
            const mine = senderId === admin?._id || (item.sender.role === "admin" && receiverId === activeUserId);
            return (
              <div key={item._id} className={mine ? styles.mine : styles.their}>
                <span>{item.content}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.inputRow}>
          <Input
            value={content}
            placeholder="Typing..."
            onChange={(e) => setContent(e.target.value)}
            onPressEnter={handleSend}
            disabled={!activeUserId}
          />
          <Button type="primary" onClick={handleSend} disabled={!activeUserId} className={styles.adminSend}>
            <SendOutlined />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Messenger;
