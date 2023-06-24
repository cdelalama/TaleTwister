"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reloadSingleConfiguration = exports.initializeConfigurations = exports.toggleMonitoring = exports.TERMS_AND_CONDITIONS = exports.SUPPORT_EMAIL = exports.ELIGIBILITY_PERIOD = exports.CREDIT_AMOUNT = exports.monitoringEnabled = exports.COOLDOWN_TIME_MINUTES = exports.MEMORY_THRESHOLD = exports.CPU_THRESHOLD = exports.LIST_USERS_PER_PAGE = exports.DISCARD_NOTIFICATION_BATCH_SIZE = exports.DISCARD_NOTIFICATION_DELAY_MS = exports.DOWNLOADS_FOLDER = exports.MAX_CHUNK_SIZE = exports.MONITOR_INTERVAL = void 0;
const config_1 = require("../config");
const index_1 = require("../utils/services/index");
async function toggleMonitoring(status) {
    exports.monitoringEnabled = status;
    await (0, index_1.updateConfiguration)(config_1.supabase, "monitoringEnabled", exports.monitoringEnabled);
}
exports.toggleMonitoring = toggleMonitoring;
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function loadConfigurations() {
    for (let attempt = 1; attempt <= Number(config_1.max_retries); attempt++) {
        const { data, error } = await config_1.supabase
            .from(config_1.supabaseConfigTable)
            .select("key, value");
        if (!error && data) {
            return new Map(data.map((item) => [item.key, item.value]));
        }
        console.error(`Error loading configurations (attempt ${attempt}):`, error);
        // Wait before retrying
        await delay(Number(config_1.retry_deleay_ms));
    }
    console.error(`Failed to load configurations after ${config_1.max_retries} attempts.`);
    return new Map();
}
async function initializeConfigurations() {
    const configurations = await loadConfigurations();
    exports.MONITOR_INTERVAL = Number(configurations.get("MONITOR_INTERVAL")) || 60000;
    exports.MAX_CHUNK_SIZE = Number(configurations.get("MAX_CHUNK_SIZE")) || 1000000;
    exports.DOWNLOADS_FOLDER = configurations.get("DOWNLOADS_FOLDER") || "downloads";
    exports.DISCARD_NOTIFICATION_DELAY_MS = Number(configurations.get("DISCARD_NOTIFICATION_DELAY_MS")) || 300000;
    exports.DISCARD_NOTIFICATION_BATCH_SIZE = Number(configurations.get("DISCARD_NOTIFICATION_BATCH_SIZE")) || 50;
    exports.LIST_USERS_PER_PAGE = Number(configurations.get("LIST_USERS_PER_PAGE")) || 10;
    exports.CPU_THRESHOLD = Number(configurations.get("CPU_THRESHOLD")) || 90;
    exports.MEMORY_THRESHOLD = Number(configurations.get("MEMORY_THRESHOLD")) || 90;
    exports.COOLDOWN_TIME_MINUTES = Number(configurations.get("COOLDOWN_TIME_MINUTES")) || 5;
    exports.monitoringEnabled = parseBoolean(configurations.get("monitoringEnabled"), true);
    exports.CREDIT_AMOUNT = Number(configurations.get("CREDIT_AMOUNT")) || 100;
    exports.ELIGIBILITY_PERIOD = Number(configurations.get("ELIGIBILITY_PERIOD")) || 1;
    exports.TERMS_AND_CONDITIONS = configurations.get("TERMS_AND_CONDITIONS") || "terms and conditions text not found";
    exports.SUPPORT_EMAIL = configurations.get("SUPPORT_EMAIL") || "voiceGenieBot@gmail.com";
}
exports.initializeConfigurations = initializeConfigurations;
async function reloadSingleConfiguration(key) {
    const { data, error } = await config_1.supabase
        .from(config_1.supabaseConfigTable)
        .select("value")
        .eq("key", key)
        .single();
    if (error || !data) {
        console.error(`Error reloading configuration for ${key}:`, error);
        return;
    }
    switch (key) {
        case "MONITOR_INTERVAL":
            exports.MONITOR_INTERVAL = Number(data.value) || 60000;
            break;
        case "MAX_CHUNK_SIZE":
            exports.MAX_CHUNK_SIZE = Number(data.value) || 1000000;
            break;
        case "DOWNLOADS_FOLDER":
            exports.DOWNLOADS_FOLDER = data.value || "downloads";
            break;
        case "DISCARD_NOTIFICATION_DELAY_MS":
            exports.DISCARD_NOTIFICATION_DELAY_MS = Number(data.value) || 300000;
            break;
        case "DISCARD_NOTIFICATION_BATCH_SIZE":
            exports.DISCARD_NOTIFICATION_BATCH_SIZE = Number(data.value) || 50;
            break;
        case "LIST_USERS_PER_PAGE":
            exports.LIST_USERS_PER_PAGE = Number(data.value) || 10;
            break;
        case "CPU_THRESHOLD":
            exports.CPU_THRESHOLD = Number(data.value) || 90;
            break;
        case "MEMORY_THRESHOLD":
            exports.MEMORY_THRESHOLD = Number(data.value) || 90;
            break;
        case "COOLDOWN_TIME_MINUTES":
            exports.COOLDOWN_TIME_MINUTES = Number(data.value) || 5;
            break;
        case "monitoringEnabled":
            exports.monitoringEnabled = parseBoolean(data.value, true);
            break;
        case "CREDIT_AMOUNT":
            exports.CREDIT_AMOUNT = Number(data.value) || 100;
            break;
        case "ELIGIBILITY_PERIOD":
            exports.ELIGIBILITY_PERIOD = Number(data.value) || 1;
            break;
        case "TERMS_AND_CONDITIONS":
            exports.TERMS_AND_CONDITIONS = data.value || "terms and conditions text missing";
            break;
        case "SUPPORT_EMAIL":
            exports.SUPPORT_EMAIL = data.value || "voiceGenieBot@gmail.com";
            break;
        default:
            console.error(`Unknown configuration key: ${key}`);
    }
}
exports.reloadSingleConfiguration = reloadSingleConfiguration;
function parseBoolean(str, defaultValue) {
    if (str === undefined) {
        return defaultValue;
    }
    return str.toLowerCase() === "true";
}
