import { Context, InlineKeyboard } from "grammy";
import { isValidUrl } from "./isValidUrl";
import { userStates } from "../states/userStates";

export function sendImage(ctx: Context, index: number) {
  if (!ctx.from) {
    console.log("ctx.from is undefined.");
    return;
  }

  const userState = userStates.get(ctx.from.id);

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

  const inlineKeyboard = new InlineKeyboard()
    .text("Keep", "keep")
    .text("Discard", "discard");

  ctx.replyWithPhoto(imageUrl, {
    reply_markup: inlineKeyboard,
  });
}
