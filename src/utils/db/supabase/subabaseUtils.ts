import { startOfMonth } from "date-fns";
import { Readable } from "stream";
import { SupabaseClient } from "@supabase/supabase-js";
import {
	supabaseUsersTable,
	supabaseConfigTable,
} from "../../../config/config";

export async function addUserToDatabase(
	supabase: SupabaseClient,
	telegram_id: number,
	username: string | null,
	role: string
): Promise<{ error: true; code?: string } | null> {
	try {
		const { error } = await supabase.from(supabaseUsersTable).insert([
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
	} catch (error) {
		console.error("Error in addUserToDatabase:", error);
		return { error: true };
	}
	return null;
}