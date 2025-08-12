import { createClient, type RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

let client: RedisClientType | null = null;
export async function initializeRedisClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => console.error("Redis Client Error", err));
    client.on("connect", () => console.log("Redis Client Connected"));
    await client.connect();
  }
  return client;
}
