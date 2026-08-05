import { createClient } from "redis";

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;
const password = process.env.REDIS_PASSWORD;

if (!host) {
    throw new Error("REDIS_HOST is not defined.");
}

if (!port) {
    throw new Error("REDIS_PORT is not defined.");
}

if (!password) {
    throw new Error("REDIS_PASSWORD is not defined.");
}

export const redis = createClient({

    socket: {

        host,

        port: Number(port)

    },

});

redis.on("error", console.error);

export async function connectRedis() {

    if (!redis.isOpen) {
        await redis.connect();
    }

}