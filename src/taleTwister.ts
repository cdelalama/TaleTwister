import { Bot } from "grammy";
import * as dotenv from "dotenv";
import { Context } from "./types";
import { onMessage, onStart } from "./handlers";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const bot = new Bot<Context>(process.env.TELEGRAM_BOT_TOKEN!);
console.log("Bot token:", process.env.TELEGRAM_BOT_TOKEN);

bot.api
  .getMe()
  .then((botInfo) => {
    console.log("Bot info:", botInfo);
  })
  .catch((error) => {
    console.error("Failed to get bot info:", error);
  });

bot.start({
  allowed_updates: ["message", "callback_query"],
  timeout: 30,
});

bot.command("start", onStart);
bot.on("message", onMessage);

bot.use(errorHandler);

bot.start();
