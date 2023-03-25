"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendImage = void 0;
const grammy_1 = require("grammy");
const isValidUrl_1 = require("./isValidUrl");
const userStates_1 = require("../states/userStates");
function sendImage(ctx, index) {
    if (!ctx.from) {
        console.log("ctx.from is undefined.");
        return;
    }
    const userState = userStates_1.userStates.get(ctx.from.id);
    if (!userState) {
        console.log("User state not found for user ID:", ctx.from.id);
        return;
    }
    const imageUrl = userState.images[index].src;
    console.log("Image URL:", imageUrl);
    if (!(0, isValidUrl_1.isValidUrl)(imageUrl)) {
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
