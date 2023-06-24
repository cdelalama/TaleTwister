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
const imports_1 = require("./imports");
const dotenv = __importStar(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const html_entities_1 = require("html-entities");
const url_1 = require("url");
dotenv.config();
const bot = new imports_1.Bot(process.env.TELEGRAM_BOT_TOKEN);
bot.start({
    allowed_updates: ["message", "callback_query"],
    timeout: 30,
});
const userStates = new Map();
bot.command("start", (ctx) => {
    console.log("Received update:", JSON.stringify(ctx.update, null, 2));
    ctx.reply("Welcome to my web content extraction bot!");
});
bot.on("message", async (ctx) => {
    var _a;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const url = ((_a = ctx.message.text) !== null && _a !== void 0 ? _a : "").match(urlRegex);
    let elementIndex = 0;
    console.log("Received update:", JSON.stringify(ctx.update, null, 2));
    if (url && url[0]) {
        try {
            console.log("Fetching URL:", url[0]);
            const response = await axios_1.default.get(url[0]);
            const $ = cheerio_1.default.load(response.data);
            const pageTitle = $("head > title").text().trim();
            const titles = [];
            const paragraphs = [];
            const images = [];
            $("body *").each((_i, el) => {
                if ($(el).is("h1, h2, h3, h4, h5, h6")) {
                    titles.push({
                        content: (0, html_entities_1.decode)($(el).text().trim()),
                        index: elementIndex,
                    });
                }
                else if ($(el).is("p")) {
                    paragraphs.push({
                        content: (0, html_entities_1.decode)($(el).text().trim()),
                        index: elementIndex,
                    });
                }
                else if ($(el).is("img")) {
                    const src = $(el).attr("src");
                    const absoluteUrl = new url_1.URL(src, response.request.responseURL).toString();
                    images.push({ index: elementIndex, src: absoluteUrl });
                }
                else {
                    // Skip non-matching elements
                    return;
                }
                elementIndex++;
            });
            await sendMessageInChunks(ctx, `Page Title: ${pageTitle}\n\nTitles:\n${titles
                .map((t) => t.content)
                .join("\n")}`);
            await sendMessageInChunks(ctx, `Paragraphs:\n${paragraphs.map((p) => p.content).join("\n")}`);
            userStates.set(ctx.from.id, {
                titles,
                paragraphs,
                images,
                selectedImages: [],
                currentImage: 0,
            });
            // Send the first image
            if (images.length > 0) {
                sendImage(ctx, 0);
            }
        }
        catch (error) {
            console.error("Error while processing the URL:", error);
            ctx.reply("Error fetching the URL content. Please try again.");
        }
    }
    else {
        ctx.reply(`You said: ${ctx.message.text}`);
    }
});
bot.on("callback_query", async (ctx) => {
    const userId = ctx.from.id;
    const userState = userStates.get(userId);
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
        const html = generateHTML(userState.titles, userState.paragraphs, userState.images, userState.selectedImages);
        const htmlBuffer = Buffer.from(html, "utf-8");
        const inputFile = new imports_1.InputFile(htmlBuffer, "generated.html");
        ctx.replyWithDocument(inputFile);
        userStates.delete(userId);
    }
});
function sendImage(ctx, index) {
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
    const inlineKeyboard = new imports_1.InlineKeyboard()
        .text("Keep", "keep")
        .text("Discard", "discard");
    ctx.replyWithPhoto(imageUrl, {
        reply_markup: inlineKeyboard,
    });
}
function generateHTML(titles, paragraphs, images, selectedImages) {
    const allElements = [
        ...titles.map((t) => ({
            type: "title",
            content: t.content,
            index: t.index,
        })),
        ...paragraphs.map((p) => ({
            type: "paragraph",
            content: p.content,
            index: p.index,
        })),
        ...images
            .filter((image) => selectedImages.some((selectedImage) => selectedImage.src === image.src))
            .map((image) => ({
            type: "image",
            content: image.src,
            index: image.index,
        })),
    ];
    const sortedElements = allElements.sort((a, b) => a.index - b.index);
    const contentHTML = sortedElements
        .map((element) => {
        if (element.type === "title") {
            return `<h2>${element.content}</h2>`;
        }
        else if (element.type === "paragraph") {
            return `<p>${element.content}</p>`;
        }
        else if (element.type === "image") {
            return `<img src="${element.content}" alt="" />`;
        }
    })
        .join("\n");
    return `<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${contentHTML}\n</body>\n</html>`;
}
const errorHandler = async (ctx, next) => {
    try {
        await next();
    }
    catch (err) {
        console.error(`Error while handling update ${ctx.update.update_id}:`, err);
    }
};
bot.use(errorHandler);
function isValidUrl(url) {
    try {
        if (url.startsWith("data:image/")) {
            return true;
        }
        new url_1.URL(url);
        return true;
    }
    catch {
        return false;
    }
}
async function sendMessageInChunks(ctx, text) {
    const maxMessageLength = 4096;
    let startIndex = 0;
    let endIndex = maxMessageLength;
    while (startIndex < text.length) {
        if (endIndex < text.length) {
            endIndex = text.lastIndexOf("\n", endIndex);
        }
        else {
            endIndex = text.length;
        }
        await ctx.reply(text.slice(startIndex, endIndex));
        startIndex = endIndex + 1;
        endIndex = startIndex + maxMessageLength;
    }
}
