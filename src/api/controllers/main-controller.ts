import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from "@/lib/types.js";
import type { Server, Socket } from "socket.io";
import roomHandlers from "../handlers/room-handler.js";
import { messageHandlers } from "../handlers/message-handler.js";
import { gameHandler } from "../handlers/game-handler.js";

export function mainControllers(
  io: Server<ServerToClientEvents, ClientToServerEvents, SocketData>,
) {
  io.on(
    "connection",
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      console.log("a user connected");
      roomHandlers(io, socket);
      gameHandler(io, socket);
      messageHandlers(io, socket);
      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    },
  );
}
