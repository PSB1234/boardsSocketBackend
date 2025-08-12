import { Server as SocketIOServer } from "socket.io";
import "dotenv/config";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@/lib/types.ts";
import express from "express";
import http from "http";
import { mainControllers } from "@/api/controllers/main-controller.ts";
import Middleware from "@/middleware/auth-middleware.ts";
import { initializeRedisClient } from "@/utils/redis-client.ts";
const app = express();
const server = http.createServer(app);
const port = process.env.PORT;

const io = new SocketIOServer<
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
initializeRedisClient().then(() => console.log("Redis client initialized"));
Middleware(io);
mainControllers(io);

server.listen(port, () => {
  console.log("listening ");
});
