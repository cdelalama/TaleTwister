import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
export const SUPABASE_URL = process.env.SUPABASE_URL!;
export const SUPABASE_KEY = process.env.SUPABASE_KEY!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export const supabaseUsersTable = process.env.SUPABASE_USERS_TABLE_NAME || "users";
export const supabaseConfigTable =process.env.SUPABASE_USERS_CONFIG_NAME || "configurations";


