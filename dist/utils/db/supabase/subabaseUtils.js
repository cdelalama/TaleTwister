"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.fetchUser = exports.fetchAdmins = exports.addUserToDatabase = void 0;
const config_1 = require("../../../config/config");
async function addUserToDatabase(supabase, telegram_id, username, role) {
    try {
        const { error } = await supabase.from(config_1.supabaseUsersTable).insert([
            {
                telegram_id,
                telegram_username: username,
                role,
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
async function fetchAdmins(supabase) {
    const { data: admins, error } = await supabase
        .from(config_1.supabaseUsersTable)
        .select("telegram_id")
        .eq("role", "admin");
    if (error) {
        console.error("Error fetching admin users from database:", error);
        return null;
    }
    return admins;
}
exports.fetchAdmins = fetchAdmins;
async function fetchUser(supabase, usernameOrId, fields) {
    const fieldsStr = fields.join(", ");
    let query = supabase.from(config_1.supabaseUsersTable).select(fieldsStr);
    // Try to parse usernameOrId as a number
    const parsedId = Number(usernameOrId);
    // If parsing succeeded (parsedId is not NaN), use telegram_id
    // Otherwise, use telegram_username
    if (!isNaN(parsedId)) {
        query = query.eq("telegram_id", parsedId);
    }
    else {
        query = query.eq("telegram_username", usernameOrId);
    }
    const { data: users, error } = await query.limit(1);
    if (error) {
        console.error("Error fetching user from database:", error);
        return { error: true };
    }
    return users.length > 0 ? users[0] : null;
}
exports.fetchUser = fetchUser;
async function updateUser(supabase, telegram_id, data) {
    const { data: updateData, error } = await supabase
        .from(config_1.supabaseUsersTable)
        .update(data)
        .eq("telegram_id", telegram_id);
    if (error) {
        console.error("Error updating user:", error);
        return false;
    }
    return true;
}
exports.updateUser = updateUser;
