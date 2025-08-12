import type { Server, Socket } from "socket.io";
import type { ChatMessageSchema } from "@/lib/types.ts";
import type z from "zod";
import { initializeRedisClient } from "@/utils/redis-client.ts";
export function messageHandlers(io: Server, socket: Socket) {
  socket.on(
    "sendMessage",
    async (roomId: string, messageData: z.infer<typeof ChatMessageSchema>) => {
      const client = await initializeRedisClient();
      const key = `chat:${roomId}`;
      const messageStr = JSON.stringify(messageData);

      await client.lPush(key, messageStr);

      await client.expire(key, 3600); //sets for one hour

      io.to(roomId).emit("receiveMessage", messageData);
    },
  );
  socket.on("getChatHistory", async (roomId: string, callback) => {
    const client = await initializeRedisClient();
    const key = `chat:${roomId}`;

    const messages = await client.lRange(key, 0, -1);
    const parsedMessages = messages.map((m) => JSON.parse(m));

    callback(parsedMessages);
  });
}
