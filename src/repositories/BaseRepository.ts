import { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "../database/supabase.js";

export abstract class BaseRepository {

    protected readonly db: SupabaseClient = supabase;

}