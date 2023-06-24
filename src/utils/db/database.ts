
import { SupabaseUser, UserFromDB } from "../../types/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { addUserToDatabase, fetchUser, updateUser } from "../services/index";
class Database {
	constructor(private supabase: SupabaseClient) {}

	async addUser(
		telegram_id: number,
		username: string | null,
		role: string
	): Promise<{ error: boolean } | null> {
		return await addUserToDatabase(this.supabase, telegram_id, username, role);
	}



	async updateUser(
		userId: number,
		data: Partial<Record<string, any>>
	): Promise<boolean> {
		return await updateUser(this.supabase, userId, data);
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

	
	// Add method to retrieve the SupabaseClient
	getSupabaseClient(): SupabaseClient {
		return this.supabase;
	}


}

export default Database;
