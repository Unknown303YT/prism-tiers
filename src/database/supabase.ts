import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();


function env(name: string): string {

    const value = process.env[name];

    if (!value) {
        throw new Error(
            `Missing environment variable ${name}`
        );
    }

    return value;

}


export const supabase = createClient(

    env("SUPABASE_URL"),

    env("SUPABASE_SECRET_KEY"),

    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }

);