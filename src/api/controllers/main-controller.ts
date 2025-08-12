import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
} from "@/lib/types";
import type { Server, Socket } from "socket.io";
import roomHandlers from "@/api/handlers/room-handler";
import { messageHandlers } from "@/api/handlers/message-handler";
import { gameHandler } from "@/api/handlers/game-handler";

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
