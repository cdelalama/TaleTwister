"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../services/index");
class Database {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async addUser(telegram_id, username, role) {
        return await (0, index_1.addUserToDatabase)(this.supabase, telegram_id, username, role);
    }
    async updateUser(userId, data) {
        return await (0, index_1.updateUser)(this.supabase, userId, data);
    }
    async fetchUser(usernameOrId, fields) {
        try {
            return await (0, index_1.fetchUser)(this.supabase, String(usernameOrId), fields);
        }
        catch (error) {
            console.error("Error fetching user:", error);
            return { error: true };
        }
    }
    // Add method to retrieve the SupabaseClient
    getSupabaseClient() {
        return this.supabase;
    }
}
exports.default = Database;
