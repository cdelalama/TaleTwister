import {

} from "../utils/services/index";
import { SupabaseUser, UserFromDB } from "../../types/types";
import { SupabaseClient } from "@supabase/supabase-js";

class Database {
	constructor(private supabase: SupabaseClient) {}

	async addUser(
		telegram_id: number,
		username: string | null,
		role: string
	): Promise<{ error: boolean } | null> {
		return await addUserToDatabase(this.supabase, telegram_id, username, role);
	}

	async getUserCredit(userId: number): Promise<number | null> {
		return await getUserCharacterCredit(this.supabase, userId);
	}

	async updateUser(
		userId: number,
		data: Partial<Record<string, any>>
	): Promise<boolean> {
		return await updateUser(this.supabase, userId, data);
	}

	async updateUserCredit(userId: number, newCredit: number): Promise<boolean> {
		try {
			await this.updateUser(userId, { character_credit: newCredit });
			return true;
		} catch (error) {
			console.error("Error updating user credit:", error);
			return false;
		}
	}

	async fetchUser(
		usernameOrId: string | number,
		fields: (keyof UserFromDB)[]
	): Promise<UserFromDB | { error: true } | null> {
		try {
			return await fetchUser(this.supabase, String(usernameOrId), fields);
		} catch (error) {
			console.error("Error fetching user:", error);
			return { error: true };
		}
	}

	//TODO delete this

	async findUser(usernameOrId: string): Promise<SupabaseUser | null> {
		try {
			const user = await findUser(this.supabase, usernameOrId);
			return user;
		} catch (error) {
			console.error("Error finding user:", error);
			return null;
		}
	}
	//TODO delete this
	async fetchUserRole(
		telegram_id: number
	): Promise<string | null | { error: true }> {
		return await fetchUserRole(this.supabase, telegram_id);
	}
	// Add method to retrieve the SupabaseClient
	getSupabaseClient(): SupabaseClient {
		return this.supabase;
	}
	//TODO delete this

	async fetchUserDetails(
		telegram_id: number
	): Promise<{ role: string; banned: boolean } | { error: boolean } | null> {
		try {
			const userDetails = await fetchUserDetails(this.supabase, telegram_id);
			return userDetails;
		} catch (error) {
			console.error("Error fetching user details:", error);
			return { error: true };
		}
	}

	async addTransaction(
		userId: number,
		packageId: number,
		telegramPaymentChargeId: string,
		providerPaymentChargeId: string,
		buyerName: string,
		buyerEmail: string,
		currency: string,
		totalAmount: number
	): Promise<{ id: number | null; success: boolean }> {
		try {
			const { id, error } = await addTransactionToDatabase(
				this.supabase,
				userId,
				packageId,
				telegramPaymentChargeId,
				providerPaymentChargeId,
				buyerName,
				buyerEmail,
				currency,
				totalAmount
			);

			if (error) {
				throw error;
			}

			return { id, success: true };
		} catch (error) {
			console.error("Error saving transaction to database:", error);
			return { id: null, success: false };
		}
	}
	async getLastCreditGivenAt(userId: number): Promise<Date | null> {
		try {
			const lastCreditGivenAt = await getLastCreditGivenAt(
				this.supabase,
				userId
			);

			if (lastCreditGivenAt) {
				return new Date(lastCreditGivenAt);
			} else {
				return null;
			}
		} catch (error) {
			console.error("Error getting last credit given date:", error);
			return null;
		}
	}
}

export default Database;
