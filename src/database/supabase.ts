import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url) {
    throw new Error("SUPABASE_URL is not defined.");
}

if (!key) {
    throw new Error("SUPABASE_SECRET_KEY is not defined.");
}

export const supabase = createClient(
    url,
    key,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);