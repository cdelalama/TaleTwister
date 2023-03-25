"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUrl = void 0;
function isValidUrl(url) {
    try {
        if (url.startsWith("data:image/")) {
            return true;
        }
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
exports.isValidUrl = isValidUrl;
