import { Response } from "express";

const userClients = new Map<string, Set<Response>>();

export const registerSseClient = (userId: string, res: Response) => {
  const clients = userClients.get(userId) || new Set<Response>();
  clients.add(res);
  userClients.set(userId, clients);
};

export const removeSseClient = (userId: string, res: Response) => {
  const clients = userClients.get(userId);

  if (!clients) {
    return;
  }

  clients.delete(res);

  if (clients.size === 0) {
    userClients.delete(userId);
  }
};

export const emitToUser = (userId: string, event: string, payload: any) => {
  const clients = userClients.get(userId);

  if (!clients) {
    return;
  }

  const content = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

  clients.forEach((res) => {
    res.write(content);
  });
};