import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const redis: RedisClientType = createClient({

    socket: {

        host: requireEnv("REDIS_HOST"),

        port: Number(requireEnv("REDIS_PORT"))

    },

    password: requireEnv("REDIS_PASSWORD")

});

redis.on("connect", () => {
    console.log("Connecting to Redis...");
});

redis.on("ready", () => {
    console.log("Connected to Redis.");
});

redis.on("reconnecting", () => {
    console.log("Reconnecting to Redis...");
});

redis.on("error", (error) => {
    console.error(error);
});

export async function verifyRedis(): Promise<void> {

    if (!redis.isOpen) {
        await redis.connect();
    }

    await redis.ping();

}