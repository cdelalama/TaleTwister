import { RoleHierarchyType } from "./types/types";

export const SPINNER_FRAMES = ["◜", "◠", "◝", "◞", "◡", "◟"];
export const AVAILABLE_ROLES = ["admin", "premium", "user", "guest"] as const;
export const roleHierarchy: RoleHierarchyType = {
	admin: 0,
	premium: 1,
	user: 2,
	guest: 3,
};
