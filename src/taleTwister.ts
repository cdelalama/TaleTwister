import { Bot, InlineKeyboard, Middleware, Context  } from "grammy";
import * as dotenv from "dotenv";
import axios from "axios";
import cheerio from "cheerio";
import { decode } from 'html-entities';

dotenv.config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

const userStates = new Map<number, any>();

bot.command("start", (ctx) => {
    console.log('Received update:', JSON.stringify(ctx.update, null, 2));
    ctx.reply("Welcome to my web content extraction bot!");
  });
bot.on("message", async (ctx) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const url = (ctx.message.text ?? "").match(urlRegex);
  console.log('Received update:', JSON.stringify(ctx.update, null, 2));
  if (url && url[0]) {
    try {
    console.log('Fetching URL:', url[0]);
      const response = await axios.get(url[0]);
      const $ = cheerio.load(response.data);
      const pageTitle = $("head > title").text().trim();

      const titles: string[] = [];
      const paragraphs: string[] = [];
      const images: string[] = [];

      $("h1, h2, h3, h4, h5, h6").each((_i, el) => {
        titles.push(decode($(el).text().trim()));
      });

      $("p").each((_i, el) => {
        paragraphs.push(decode($(el).text().trim()));
      });

      $("img").each((_i, el) => {
        images.push($(el).attr("src")!);
      });

      ctx.reply(`Page Title: ${pageTitle}\n\nTitles:\n${titles.join("\n")}\n\nParagraphs:\n${paragraphs.join("\n")}`);

      userStates.set(ctx.from.id, { titles, paragraphs, images, selectedImages: [], currentImage: 0 });

      // Send the first image
      if (images.length > 0) {
        sendImage(ctx, 0);
      }
    } catch (error) {
        console.error('Error while processing the URL:', error);
      ctx.reply("Error fetching the URL content. Please try again.");
    }
  } else {
    ctx.reply(`You said: ${ctx.message.text}`);
  }
});

bot.on('callback_query', async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates.get(userId);
  const imageData = ctx.callbackQuery.data;

  if (!userState) {
    return;
  }

  if (imageData === 'keep') {
    userState.selectedImages.push(userState.images[userState.currentImage]);
  }

  if (userState.currentImage < userState.images.length - 1) {
    userState.currentImage += 1;
    sendImage(ctx, userState.currentImage);
  } else {
    const html = generateHTML(userState.titles, userState.paragraphs, userState.selectedImages);
    ctx.reply(`Here's the generated HTML:\n\n${html}`);
    userStates.delete(userId);
  }
});

function sendImage(ctx: any, index: number) {
  const userState = userStates.get(ctx.from.id);
  const imageUrl = userState.images[index];

  const inlineKeyboard = new InlineKeyboard()
    .text('Keep', 'keep')
    .text('Discard', 'discard');

  ctx.replyWithPhoto(imageUrl, {
    reply_markup: inlineKeyboard,
  });
}

function generateHTML(titles: string[], paragraphs: string[], selectedImages: string[]): string {
    const titleHTML = titles.map((title) => `<h2>${title}</h2>`).join("\n");
    const paragraphHTML = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n");
    const imageHTML = selectedImages.map((src) => `<img src="${src}" alt="" />`).join("\n");
  
    return `<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${titleHTML}\n${paragraphHTML}\n${imageHTML}\n</body>\n</html>`;
  }

  const errorHandler: Middleware<Context> = async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error(`Error while handling update ${ctx.update.update_id}:`, err);
    }
  };
  
  bot.use(errorHandler);