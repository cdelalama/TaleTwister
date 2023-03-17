"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const dotenv = __importStar(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const html_entities_1 = require("html-entities");
dotenv.config();
const bot = new grammy_1.Bot(process.env.TELEGRAM_BOT_TOKEN);
const userStates = new Map();
bot.command("start", (ctx) => ctx.reply("Welcome to my web content extraction bot!"));
bot.on("message", async (ctx) => {
    var _a;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const url = ((_a = ctx.message.text) !== null && _a !== void 0 ? _a : "").match(urlRegex);
    if (url && url[0]) {
        try {
            console.log('Fetching URL:', url[0]);
            const response = await axios_1.default.get(url[0]);
            const $ = cheerio_1.default.load(response.data);
            const pageTitle = $("head > title").text().trim();
            const titles = [];
            const paragraphs = [];
            const images = [];
            $("h1, h2, h3, h4, h5, h6").each((_i, el) => {
                titles.push((0, html_entities_1.decode)($(el).text().trim()));
            });
            $("p").each((_i, el) => {
                paragraphs.push((0, html_entities_1.decode)($(el).text().trim()));
            });
            $("img").each((_i, el) => {
                images.push($(el).attr("src"));
            });
            ctx.reply(`Page Title: ${pageTitle}\n\nTitles:\n${titles.join("\n")}\n\nParagraphs:\n${paragraphs.join("\n")}`);
            userStates.set(ctx.from.id, { titles, paragraphs, images, selectedImages: [], currentImage: 0 });
            // Send the first image
            if (images.length > 0) {
                sendImage(ctx, 0);
            }
        }
        catch (error) {
            console.error('Error while processing the URL:', error);
            ctx.reply("Error fetching the URL content. Please try again.");
        }
    }
    else {
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
    }
    else {
        const html = generateHTML(userState.titles, userState.paragraphs, userState.selectedImages);
        ctx.reply(`Here's the generated HTML:\n\n${html}`);
        userStates.delete(userId);
    }
});
function sendImage(ctx, index) {
    const userState = userStates.get(ctx.from.id);
    const imageUrl = userState.images[index];
    const inlineKeyboard = new grammy_1.InlineKeyboard()
        .text('Keep', 'keep')
        .text('Discard', 'discard');
    ctx.replyWithPhoto(imageUrl, {
        reply_markup: inlineKeyboard,
    });
}
function generateHTML(titles, paragraphs, selectedImages) {
    const titleHTML = titles.map((title) => `<h2>${title}</h2>`).join("\n");
    const paragraphHTML = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n");
    const imageHTML = selectedImages.map((src) => `<img src="${src}" alt="" />`).join("\n");
    return `<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${titleHTML}\n${paragraphHTML}\n${imageHTML}\n</body>\n</html>`;
}
