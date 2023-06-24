"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Database {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async addUser(telegram_id, username, role) {
        return await addUserToDatabase(this.supabase, telegram_id, username, role);
    }
    async getUserCredit(userId) {
        return await getUserCharacterCredit(this.supabase, userId);
    }
    async updateUser(userId, data) {
        return await updateUser(this.supabase, userId, data);
    }
    async updateUserCredit(userId, newCredit) {
        try {
            await this.updateUser(userId, { character_credit: newCredit });
            return true;
        }
        catch (error) {
            console.error("Error updating user credit:", error);
            return false;
        }
    }
    async fetchUser(usernameOrId, fields) {
        try {
            return await fetchUser(this.supabase, String(usernameOrId), fields);
        }
        catch (error) {
            console.error("Error fetching user:", error);
            return { error: true };
        }
    }
    //TODO delete this
    async findUser(usernameOrId) {
        try {
            const user = await findUser(this.supabase, usernameOrId);
            return user;
        }
        catch (error) {
            console.error("Error finding user:", error);
            return null;
        }
    }
    //TODO delete this
    async fetchUserRole(telegram_id) {
        return await fetchUserRole(this.supabase, telegram_id);
    }
    // Add method to retrieve the SupabaseClient
    getSupabaseClient() {
        return this.supabase;
    }
    //TODO delete this
    async fetchUserDetails(telegram_id) {
        try {
            const userDetails = await fetchUserDetails(this.supabase, telegram_id);
            return userDetails;
        }
        catch (error) {
            console.error("Error fetching user details:", error);
            return { error: true };
        }
    }
    async addTransaction(userId, packageId, telegramPaymentChargeId, providerPaymentChargeId, buyerName, buyerEmail, currency, totalAmount) {
        try {
            const { id, error } = await addTransactionToDatabase(this.supabase, userId, packageId, telegramPaymentChargeId, providerPaymentChargeId, buyerName, buyerEmail, currency, totalAmount);
            if (error) {
                throw error;
            }
            return { id, success: true };
        }
        catch (error) {
            console.error("Error saving transaction to database:", error);
            return { id: null, success: false };
        }
    }
    async getLastCreditGivenAt(userId) {
        try {
            const lastCreditGivenAt = await getLastCreditGivenAt(this.supabase, userId);
            if (lastCreditGivenAt) {
                return new Date(lastCreditGivenAt);
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error("Error getting last credit given date:", error);
            return null;
        }
    }
}
exports.default = Database;
