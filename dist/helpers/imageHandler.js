"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCallbackQuery = exports.sendImage = void 0;
const grammy_1 = require("grammy");
async function sendImage(ctx, index) {
    const userState = ctx.userStates.get(ctx.from.id);
    if (!userState) {
        console.log("User state not found for user ID:", ctx.from.id);
        return;
    }
    const imageUrl = userState.images[index].src;
    console.log("Image URL:", imageUrl);
    if (!isValidUrl(imageUrl)) {
        console.log("Invalid image URL:", imageUrl);
        ctx.reply("The image URL is invalid. Skipping this image...");
        if (userState.currentImage < userState.images.length - 1) {
            userState.currentImage += 1;
            sendImage(ctx, userState.currentImage);
        }
        return;
    }
    const inlineKeyboard = new grammy_1.InlineKeyboard()
        .text("Keep", "keep")
        .text("Discard", "discard");
    ctx.replyWithPhoto(imageUrl, {
        reply_markup: inlineKeyboard,
    });
}
exports.sendImage = sendImage;
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
async function handleCallbackQuery(ctx) {
    const userId = ctx.from.id;
    const userState = ctx.userStates.get(userId);
    const imageData = ctx.callbackQuery.data;
    if (!userState) {
        return;
    }
    if (imageData === "keep") {
        userState.selectedImages.push(userState.images[userState.currentImage]);
    }
    if (userState.currentImage < userState.images.length - 1) {
        userState.currentImage += 1;
        sendImage(ctx, userState.currentImage);
    }
    else {
        ctx.answerCallbackQuery();
    }
}
exports.handleCallbackQuery = handleCallbackQuery;
