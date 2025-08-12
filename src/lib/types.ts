import { z } from "zod";

export interface ServerToClientEvents {
  receiveMessage: (messageData: z.infer<typeof ChatMessageSchema>) => void;
  getPlayersFromRoom: (usernameList: string[]) => void;
  getGameData: (gameData: z.infer<typeof GameDataSchema>[]) => void;
  diceRolled: (index: number) => void;
}
export interface ClientToServerEvents {
  sendMessage: (
    roomId: string,
    messageData: z.infer<typeof ChatMessageSchema>,
  ) => void;
  joinRoom: (
    roomId: string,
    username: string,
    callback: (response: { success: boolean; error?: string }) => void,
  ) => void;
  leaveRoom: (roomId: string) => void;
  findPlayersFromRoom: (roomId: string) => void;
  rollDice: (roomid: string) => void;
  getChatHistory: (
    roomid: string,
    callback: (parsedMessage: z.infer<typeof ChatMessageSchema>[]) => void,
  ) => void;
  getPlayerData: (
    roomid: string,
    callback: (playerData: z.infer<typeof PlayerDataSchema>[]) => void,
  ) => void;
  manageGameData: (
    roomId: string,
    data: z.infer<typeof PlayerPropertiesSchema>,
    callback?: (response: {
      success: boolean;
      playerData?: z.infer<typeof PlayerDataSchema>;
      error?: string;
    }) => void,
  ) => void;
  updatePlayerData: (
    roomId: string,
    data: z.infer<typeof PlayerPropertiesSchema>,
    callback: (response: {
      success: boolean;
      playerData?: z.infer<typeof PlayerDataSchema>[];
      error?: string;
    }) => void,
  ) => void;
}
export interface SocketData {
  username: string;
}

export const ChatMessageSchema = z.object({
  username: z.string(),
  message: z.string(),
});

export const PlayerDataSchema = z.object({
  id: z.number(),
  username: z.string(),
  position: z.number(),
  money: z.number(),
  properties: z.array(z.number()),
  inJail: z.boolean(),
  jailTurnsLeft: z.number(),
  getOutOfJailFreeCards: z.number(),
  roomOwner: z.boolean(),
  isBankrupt: z.boolean(),
});
export const PlayerPropertiesSchema = z.object({
  id: z.number(),
  roll: z.number().optional(),
  money: z.number().optional(),
  properties: z.array(z.number()).optional(),
  inJail: z.boolean().optional(),
  jailTurnsLeft: z.number().optional(),
  getOutOfJailFreeCards: z.number().optional(),
  roomOwner: z.boolean().optional(),
  isBankrupt: z.boolean().optional(),
});
export const TileDataSchema = z.object({
  name: z.string(),
  type: z.enum([
    "property",
    "Vacation",
    "go-to-jail",
    "jail",
    "freeParking",
    "start",
    "tax",
  ]),
  price: z.number().optional(),
  rent: z.array(z.number()).optional(),
  colorGroup: z.string().optional(),
  position: z.number().optional(),
  isOwned: z.boolean(),
});
export const GameDataSchema = z.object({
  players: z.array(PlayerDataSchema),
  roomOwnerName: z.string(),
  roomId: z.string(),
  turnIndex: z.number(),
});
