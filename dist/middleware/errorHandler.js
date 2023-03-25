"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = async (ctx, next) => {
    try {
        await next();
    }
    catch (err) {
        console.error(`Error while handling update ${ctx.update.update_id}:`, err);
    }
};
exports.errorHandler = errorHandler;
