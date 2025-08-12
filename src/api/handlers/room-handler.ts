import { GameDataSchema, PlayerDataSchema } from "@/lib/types.ts";
import { initializeRedisClient } from "@/utils/redis-client.ts";
import type { Server, Socket } from "socket.io";
import type z from "zod";

export default function roomHandlers(io: Server, socket: Socket) {
  socket.on("joinRoom", async (roomId: string, username: string, callback) => {
    // Set the username in socket data
    socket.data.username = username;

    socket.join(roomId);
    const redis = await initializeRedisClient();
    const key = `room:${roomId}:game`;
    const gameData = await redis.get(key);
    if (gameData) {
      const parsedGameData = JSON.parse(gameData);
      const validGameData = GameDataSchema.safeParse(parsedGameData);
      if (!validGameData.success) {
        callback({
          success: false,
          error: "Invalid game data format:" + validGameData.error,
        });
        return;
      }

      // Check if this player is already in the game
      const existingPlayer = validGameData.data.players.find(
        (p) => p.username === username,
      );

      if (!existingPlayer) {
        // New player joining existing game - add them to the player list
        const socketList = io.sockets.adapter.rooms.get(roomId);
        if (socketList) {
          const playerDataList = Array.from(socketList)
            .map((socketId, index) => {
              const socket = io.sockets.sockets.get(socketId);
              if (!socket) {
                return null;
              }
              return {
                id: index,
                username: socket!.data.username || `Player${index + 1}`,
                position: 0,
                money: 2500,
                properties: [] as number[],
                inJail: false,
                jailTurnsLeft: 0,
                getOutOfJailFreeCards: 0,
                roomOwner: index === 0,
                isBankrupt: false,
              } as z.infer<typeof PlayerDataSchema>;
            })
            .filter(Boolean);

          const updatedGameData = {
            ...validGameData.data,
            players: playerDataList,
          };

          await redis.set(key, JSON.stringify(updatedGameData));

          // Broadcast updated game data to ALL players in the room
          io.to(roomId).emit("getGameData", updatedGameData);
        }
      } else {
        // Existing player rejoining - just send current game data to them
        socket.emit("getGameData", validGameData.data);
      }

      callback({ success: true });
    } else {
      const socketList = io.sockets.adapter.rooms.get(roomId);
      if (socketList) {
        const playerDataList = Array.from(socketList)
          .map((socketId, index) => {
            const socket = io.sockets.sockets.get(socketId);
            if (!socket) {
              callback({
                success: false,
                error: "Socket Error ",
              });
              return null;
            }
            return {
              id: index,
              username: socket!.data.username || `Player${index + 1}`,
              position: 0,
              money: 2500,
              properties: [] as number[],
              inJail: false,
              jailTurnsLeft: 0,
              getOutOfJailFreeCards: 0,
              roomOwner: index === 0,
              isBankrupt: false,
            } as z.infer<typeof PlayerDataSchema>;
          })
          .filter(Boolean);

        const gameData = {
          players: playerDataList,
          roomOwnerName: playerDataList[0]?.username || "Unknown",
          roomId: roomId,
          turnIndex: 0,
        } as z.infer<typeof GameDataSchema>;

        await redis.set(key, JSON.stringify(gameData));

        io.to(roomId).emit("getGameData", gameData);
        callback({ success: true });
      } else {
        callback({
          success: false,
          error: "Room not found or empty",
        });
      }
    }
  });

  socket.on("leaveRoom", async (roomId: string) => {
    socket.leave(roomId);

    // Update the game data to remove the leaving player
    const redis = await initializeRedisClient();
    const key = `room:${roomId}:game`;
    const gameData = await redis.get(key);

    if (gameData) {
      const parsedGameData = JSON.parse(gameData);
      const validGameData = GameDataSchema.safeParse(parsedGameData);

      if (validGameData.success) {
        // Remove the leaving player from the players list
        const updatedPlayers = validGameData.data.players.filter(
          (player) => player.username !== socket.data.username,
        );

        // Reassign IDs and room ownership
        const reindexedPlayers = updatedPlayers.map((player, index) => ({
          ...player,
          id: index,
          roomOwner: index === 0,
        }));

        const updatedGameData = {
          ...validGameData.data,
          players: reindexedPlayers,
          roomOwnerName: reindexedPlayers[0]?.username || "Unknown",
        };

        if (reindexedPlayers.length > 0) {
          await redis.set(key, JSON.stringify(updatedGameData));
          // Broadcast updated game data to remaining players
          io.to(roomId).emit("getGameData", updatedGameData);
        } else {
          // No players left, delete the game data
          await redis.del(key);
        }
      }
    }
  });

  socket.on("findPlayersFromRoom", (roomId: string) => {
    const socketList = io.sockets.adapter.rooms.get(roomId);
    if (socketList) {
      const usernameList: string[] = Array.from(socketList).map((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        return socket?.data.username;
      });
      socket.emit("getPlayersFromRoom", usernameList);
    }
  });
}
