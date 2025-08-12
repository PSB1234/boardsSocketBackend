import {
  GameDataSchema,
  PlayerDataSchema,
  PlayerPropertiesSchema,
} from "@/lib/types.ts";
import type { Server, Socket } from "socket.io";
import type z from "zod";
import { initializeRedisClient } from "@/utils/redis-client.ts";
export function gameHandler(io: Server, socket: Socket) {
  socket.on("initializeGameData", async (roomId: string) => {
    const socketList = io.sockets.adapter.rooms.get(roomId);
    if (socketList) {
      const playerDataList: z.infer<typeof PlayerDataSchema>[] = Array.from(
        socketList,
      ).map((socketId, index) => {
        const socket = io.sockets.sockets.get(socketId);
        return {
          id: index,
          username: socket?.data.username,
          position: 0,
          money: 2500,
          properties: [] as number[],
          inJail: false,
          jailTurnsLeft: 0,
          getOutOfJailFreeCards: 0,
          roomOwner: index === 0,
          isBankrupt: false,
        };
      });
      const redis = await initializeRedisClient();
      const key = `room:${roomId}:players`;
      await redis.set(key, JSON.stringify(playerDataList));
      socket.emit("getGameData", playerDataList);
    }
  });
  socket.on("getPlayerData", async (roomId: string, callback) => {
    const redis = await initializeRedisClient();
    const key = `room:${roomId}:players`;
    const raw = await redis.get(key);

    if (raw) {
      const playerData: z.infer<typeof PlayerDataSchema>[] = JSON.parse(raw);
      callback(playerData);
    } else {
      callback([]);
    }
  });
  socket.on(
    "updatePlayerData",
    async (
      roomId: string,
      data: z.infer<typeof PlayerPropertiesSchema>,
      callback,
    ) => {
      try {
        const redis = await initializeRedisClient();
        const key = `room:${roomId}:game`;
        const previousTurnData = await redis.get(key);

        if (previousTurnData) {
          const _data = JSON.parse(previousTurnData);
          const validGameData = GameDataSchema.safeParse(_data);
          if (!validGameData.success) {
            callback({
              success: false,
              error: "Invalid game data format.",
            });
            return;
          }
          const playerData = validGameData.data.players;
          const playerIndex = playerData.findIndex((p) => p.id === data.id);

          if (playerIndex === -1) {
            callback({
              success: false,
              error: "Player not found in room.",
            });
            return;
          }

          // Update player data
          const player = playerData[playerIndex];

          if (data.roll !== undefined) {
            player.position = (player.position + data.roll) % 31;
          }
          if (data.money !== undefined) {
            player.money = data.money;
          }
          if (data.properties !== undefined) {
            player.properties = data.properties;
          }
          if (data.inJail !== undefined) {
            player.inJail = data.inJail;
          }
          if (data.jailTurnsLeft !== undefined) {
            player.jailTurnsLeft = data.jailTurnsLeft;
          }
          if (data.getOutOfJailFreeCards !== undefined) {
            player.getOutOfJailFreeCards = data.getOutOfJailFreeCards;
          }
          if (data.roomOwner !== undefined) {
            player.roomOwner = data.roomOwner;
          }
          if (data.isBankrupt !== undefined) {
            player.isBankrupt = data.isBankrupt;
          }
          const updatedGameData = {
            ...validGameData.data,
            players: playerData,
          };
          // Save updated data back to Redis
          await redis.set(key, JSON.stringify(updatedGameData));

          // Broadcast update to all clients in the room
          io.to(roomId).emit("getGameData", updatedGameData);

          callback({ success: true, playerData });
        } else {
          callback({
            success: false,
            error: "No player data found for this room.",
          });
        }
      } catch (error) {
        console.error("Error updating player data:", error);
        callback({
          success: false,
          error: "Internal server error.",
        });
      }
    },
  );

  socket.on("rollDice", async (roomId: string) => {
    const redis = await initializeRedisClient();
    const key = `room:${roomId}:game`;
    const previousTurnData = await redis.get(key);
    if (!previousTurnData) {
      console.error("No game data found for room:", roomId);
      return;
    }
    const _data = JSON.parse(previousTurnData);
    const validGameData = GameDataSchema.safeParse(_data);
    if (!validGameData.success) {
      console.error("Invalid game data format:", validGameData.error);
      return;
    }
    const turn = validGameData.data.turnIndex;
    const totalPlayers = validGameData.data.players.length;
    const nextTurn = (turn + 1) % totalPlayers;
    const newGameData = {
      ...validGameData.data,
      turnIndex: nextTurn,
    } as z.infer<typeof GameDataSchema>;
    await redis.set(key, JSON.stringify(newGameData));
    io.to(roomId).emit("diceRolled", nextTurn);
  });
}
