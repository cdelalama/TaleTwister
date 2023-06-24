import { Context } from "grammy";
import { UserState } from "./userState";
import { AVAILABLE_ROLES } from "../constants";


export type SessionData = {
    lastMessageIds?: number[];
    textToTransform?: string;
    hasAcceptedTerms?: boolean;
};

export type MyContext = import("grammy").Context &
    SessionFlavor<SessionData> & {
        userRole?: (typeof AVAILABLE_ROLES)[number] | "guest";
        bot: Bot<MyContext>;
        action?: GrammyAction;
        db: Database;
        replyWithMainKeyboard: (
            text: string,
            withKeyboard?: boolean,
            extra?: any
        ) => Promise<any>;
    };

export type SupabaseUser = {
    id: bigint;
    created_at?: string;
    telegram_id?: number;
    role?: string;
    telegram_username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    banned?: boolean;
    terms_accepted?: boolean;
    terms_accepted_date?: string;
};
export type UserFromDB = {
    [key in keyof SupabaseUser]?: SupabaseUser[key];
};


export type RoleHierarchyType = {
	[key: string]: number;
	admin: number;
	premium: number;
	user: number;
	guest: number;
};

export interface ConfigVariable {
	id: string;
	key: string;
	value: string;
	description: string;
}

export interface Command {
	name: string;
	description: string;
	role?: (typeof AVAILABLE_ROLES)[number]; // here role can be "admin", "premium", "user", "guest" or undefined
}

export interface UserState {
    titles: Array<{ content: string; index: number }>;
    paragraphs: Array<{ content: string; index: number }>;
    images: Array<{ index: number; src: string }>;
    selectedImages: Array<{ index: number; src: string }>;
    currentImage: number;
}

export interface CustomContext extends Context {
    userStates: Map<number, UserState>;
}


