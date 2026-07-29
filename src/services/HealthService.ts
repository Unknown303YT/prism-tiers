import { supabase } from "../database/supabase.js";
import { redis } from "../database/redis.js";

export class HealthService {

    async checkDatabase(): Promise<boolean> {
        try {
            const { error } = await supabase
                .from("settings")
                .select("id")
                .limit(1);

            return !error;

        } catch {
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

        } catch {
            return false;
        }
    }

}