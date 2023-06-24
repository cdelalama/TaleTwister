import { startOfMonth } from "date-fns";
import { Readable } from "stream";
import { SupabaseClient } from "@supabase/supabase-js";
import {
	supabaseUsersTable,
	supabaseConfigTable,
} from "../../../config/config";

import {
	SupabaseUser,
	ConfigVariable,
	UserFromDB,
} from "../../../types/types";

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

export async function fetchAdmins(supabase: SupabaseClient) {
	const { data: admins, error } = await supabase
		.from(supabaseUsersTable)
		.select("telegram_id")
		.eq("role", "admin");

	if (error) {
		console.error("Error fetching admin users from database:", error);
		return null;
	}
	return admins;
}

export async function fetchUser(
	supabase: SupabaseClient,
	usernameOrId: string,
	fields: (keyof UserFromDB)[]
): Promise<UserFromDB | { error: true } | null> {
	const fieldsStr = fields.join(", ");

	let query = supabase.from(supabaseUsersTable).select(fieldsStr);

	// Try to parse usernameOrId as a number
	const parsedId = Number(usernameOrId);

	// If parsing succeeded (parsedId is not NaN), use telegram_id
	// Otherwise, use telegram_username
	if (!isNaN(parsedId)) {
		query = query.eq("telegram_id", parsedId);
	} else {
		query = query.eq("telegram_username", usernameOrId);
	}

	const { data: users, error } = await query.limit(1);

	if (error) {
		console.error("Error fetching user from database:", error);
		return { error: true };
	}

	return users.length > 0 ? users[0] : null;
}

export async function updateUser(
	supabase: SupabaseClient,
	telegram_id: number,
	data: Partial<{
		role: string;
		first_name: string;
		last_name: string;
		email: string;
	}>
): Promise<boolean> {
	const { data: updateData, error } = await supabase
		.from(supabaseUsersTable)
		.update(data)
		.eq("telegram_id", telegram_id);

	if (error) {
		console.error("Error updating user:", error);
		return false;
	}

	return true;
}