import { database } from "../database/Database.js";
import { redis } from "../redis/redis.js";

export class HealthService {

    async checkDatabase(): Promise<boolean> {
        try {
            await database.query('SELECT 1');
            return true;
        } catch (error) {
            console.error("Database connection failed:", error);
            return false;
        }
    }


    async checkRedis(): Promise<boolean> {
        try {
            if (!redis.isOpen) {
                return false;
            }

            await redis.ping();
            return true;

        } catch (error) {
            console.error("Redis health check failed:", error);
            return false;
        }
    }

}