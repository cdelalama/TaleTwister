import {
	supabase,
	supabaseConfigTable,
	retry_deleay_ms,
	max_retries,
} from "../config";
import { updateConfiguration } from "../utils/services/index";

export let MONITOR_INTERVAL: number;
export let MAX_CHUNK_SIZE: number;
export let DOWNLOADS_FOLDER: string;
export let DISCARD_NOTIFICATION_DELAY_MS: number;
export let DISCARD_NOTIFICATION_BATCH_SIZE: number;
export let LIST_USERS_PER_PAGE: number;
export let CPU_THRESHOLD: number;
export let MEMORY_THRESHOLD: number;
export let COOLDOWN_TIME_MINUTES: number;
export let monitoringEnabled: boolean;
export let CREDIT_AMOUNT: number;
export let ELIGIBILITY_PERIOD: number;
export let SUPPORT_EMAIL: string;
export let TERMS_AND_CONDITIONS: string;

export async function toggleMonitoring(status: boolean) {
	monitoringEnabled = status;
	await updateConfiguration(supabase, "monitoringEnabled", monitoringEnabled);
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadConfigurations(): Promise<Map<string, string>> {
	for (let attempt = 1; attempt <= Number(max_retries); attempt++) {
		const { data, error } = await supabase
			.from(supabaseConfigTable)
			.select("key, value");

		if (!error && data) {
			return new Map(data.map((item) => [item.key, item.value]));
		}

		console.error(`Error loading configurations (attempt ${attempt}):`, error);

		// Wait before retrying
		await delay(Number(retry_deleay_ms));
	}

	console.error(`Failed to load configurations after ${max_retries} attempts.`);
	return new Map();
}

export async function initializeConfigurations() {
	const configurations = await loadConfigurations();

	MONITOR_INTERVAL = Number(configurations.get("MONITOR_INTERVAL")) || 60000;
	MAX_CHUNK_SIZE = Number(configurations.get("MAX_CHUNK_SIZE")) || 1000000;
	DOWNLOADS_FOLDER = configurations.get("DOWNLOADS_FOLDER") || "downloads";
	DISCARD_NOTIFICATION_DELAY_MS = Number(configurations.get("DISCARD_NOTIFICATION_DELAY_MS")) || 300000;
	DISCARD_NOTIFICATION_BATCH_SIZE = Number(configurations.get("DISCARD_NOTIFICATION_BATCH_SIZE")) || 50;
	LIST_USERS_PER_PAGE = Number(configurations.get("LIST_USERS_PER_PAGE")) || 10;
	CPU_THRESHOLD = Number(configurations.get("CPU_THRESHOLD")) || 90;
	MEMORY_THRESHOLD = Number(configurations.get("MEMORY_THRESHOLD")) || 90;
	COOLDOWN_TIME_MINUTES = Number(configurations.get("COOLDOWN_TIME_MINUTES")) || 5;
	monitoringEnabled = parseBoolean( configurations.get("monitoringEnabled"), true	);
	CREDIT_AMOUNT = Number(configurations.get("CREDIT_AMOUNT")) || 100;
	ELIGIBILITY_PERIOD = Number(configurations.get("ELIGIBILITY_PERIOD")) || 1;
	TERMS_AND_CONDITIONS = configurations.get("TERMS_AND_CONDITIONS") || "terms and conditions text not found";
	SUPPORT_EMAIL = configurations.get("SUPPORT_EMAIL") || "voiceGenieBot@gmail.com";
}
export async function reloadSingleConfiguration(key: string) {
	const { data, error } = await supabase
		.from(supabaseConfigTable)
		.select("value")
		.eq("key", key)
		.single();

	if (error || !data) {
		console.error(`Error reloading configuration for ${key}:`, error);
		return;
	}

	switch (key) {
		case "MONITOR_INTERVAL":
			MONITOR_INTERVAL = Number(data.value) || 60000;
			break;
		case "MAX_CHUNK_SIZE":
			MAX_CHUNK_SIZE = Number(data.value) || 1000000;
			break;
		case "DOWNLOADS_FOLDER":
			DOWNLOADS_FOLDER = data.value || "downloads";
			break;
		case "DISCARD_NOTIFICATION_DELAY_MS":
			DISCARD_NOTIFICATION_DELAY_MS = Number(data.value) || 300000;
			break;
		case "DISCARD_NOTIFICATION_BATCH_SIZE":
			DISCARD_NOTIFICATION_BATCH_SIZE = Number(data.value) || 50;
			break;
		case "LIST_USERS_PER_PAGE":
			LIST_USERS_PER_PAGE = Number(data.value) || 10;
			break;
		case "CPU_THRESHOLD":
			CPU_THRESHOLD = Number(data.value) || 90;
			break;
		case "MEMORY_THRESHOLD":
			MEMORY_THRESHOLD = Number(data.value) || 90;
			break;
		case "COOLDOWN_TIME_MINUTES":
			COOLDOWN_TIME_MINUTES = Number(data.value) || 5;
			break;
		case "monitoringEnabled":
			monitoringEnabled = parseBoolean(data.value, true);
			break;
		case "CREDIT_AMOUNT":
			CREDIT_AMOUNT = Number(data.value) || 100;
			break;
		case "ELIGIBILITY_PERIOD": ELIGIBILITY_PERIOD = Number(data.value) || 1;
			break;
		case "TERMS_AND_CONDITIONS": TERMS_AND_CONDITIONS = data.value || "terms and conditions text missing";
			break;
		case "SUPPORT_EMAIL": SUPPORT_EMAIL = data.value || "voiceGenieBot@gmail.com";
			break;
		default:
			console.error(`Unknown configuration key: ${key}`);
	}
}

function parseBoolean(str: string | undefined, defaultValue: boolean): boolean {
	if (str === undefined) {
		return defaultValue;
	}
	return str.toLowerCase() === "true";
}
