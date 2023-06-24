"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserToDatabase = void 0;
const config_1 = require("../../../config");
async function addUserToDatabase(supabase, telegram_id, username, role) {
    try {
        const { error } = await supabase.from(config_1.supabaseUsersTable).insert([
            {
                telegram_id,
                telegram_username: username,
                role,
                last_credit_given_at: new Date().toISOString(), // include last_credit_given_at field
            },
        ]);
        if (error) {
            console.error("Error adding user to database:", error);
            return { error: true, code: error.code };
        }
    }
    catch (error) {
        console.error("Error in addUserToDatabase:", error);
        return { error: true };
    }
    return null;
}
exports.addUserToDatabase = addUserToDatabase;
