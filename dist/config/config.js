"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseConfigTable = exports.supabaseUsersTable = exports.supabase = exports.SUPABASE_KEY = exports.SUPABASE_URL = exports.TELEGRAM_BOT_TOKEN = void 0;
const dotenv_1 = require("dotenv");
const supabase_js_1 = require("@supabase/supabase-js");
(0, dotenv_1.config)();
exports.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
exports.SUPABASE_URL = process.env.SUPABASE_URL;
exports.SUPABASE_KEY = process.env.SUPABASE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(exports.SUPABASE_URL, exports.SUPABASE_KEY);
exports.supabaseUsersTable = process.env.SUPABASE_USERS_TABLE_NAME || "users";
exports.supabaseConfigTable = process.env.SUPABASE_USERS_CONFIG_NAME || "configurations";
