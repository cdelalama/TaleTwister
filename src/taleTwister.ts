import { Bot, InlineKeyboard, Middleware, Context, InputFile } from "grammy";
import * as dotenv from "dotenv";
import axios from "axios";
import cheerio from "cheerio";

import { decode } from "html-entities";
import { URL } from "url";

dotenv.config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
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

const userStates = new Map<
	number,
	{
		titles: Array<{ content: string; index: number }>;
		paragraphs: Array<{ content: string; index: number }>;
		images: Array<{ index: number; src: string }>;
		selectedImages: Array<{ index: number; src: string }>;
		currentImage: number;
	}
>();

bot.command("start", (ctx) => {
	console.log("Received update:", JSON.stringify(ctx.update, null, 2));
	ctx.reply("Welcome to my web content extraction bot!");
});
bot.on("message", async (ctx) => {
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	const url = (ctx.message.text ?? "").match(urlRegex);
	let elementIndex = 0;

	console.log("Received update:", JSON.stringify(ctx.update, null, 2));
	if (url && url[0]) {
		try {
			console.log("Fetching URL:", url[0]);
			const response = await axios.get(url[0]);
			const $ = cheerio.load(response.data);
			const pageTitle = $("head > title").text().trim();

			const titles: Array<{ content: string; index: number }> = [];
			const paragraphs: Array<{ content: string; index: number }> = [];

			$("h1, h2, h3, h4, h5, h6").each((_i, el) => {
				titles.push({
					content: decode($(el).text().trim()),
					index: elementIndex,
				});
				elementIndex++;
			});

			$("p").each((_i, el) => {
				paragraphs.push({
					content: decode($(el).text().trim()),
					index: elementIndex,
				});
				elementIndex++;
			});

			const images: Array<{ index: number; src: string }> = [];

			elementIndex = 0;

			$("body *").each((_i, el) => {
				if ($(el).is("img")) {
					const src = $(el).attr("src")!;
					const absoluteUrl = new URL(
						src,
						response.request.responseURL
					).toString();
					images.push({ index: elementIndex, src: absoluteUrl });
					elementIndex++;
				}
			});

			ctx.reply(
				`Page Title: ${pageTitle}\n\nTitles:\n${titles
					.map((t) => t.content)
					.join("\n")}\n\nParagraphs:\n${paragraphs
					.map((p) => p.content)
					.join("\n")}`
			);

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
		} catch (error) {
			console.error("Error while processing the URL:", error);
			ctx.reply("Error fetching the URL content. Please try again.");
		}
	} else {
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
	} else {
		const html = generateHTML(
			userState.titles,
			userState.paragraphs,
			userState.images,
			userState.selectedImages
		);

		const htmlBuffer = Buffer.from(html, "utf-8");
		const inputFile = new InputFile(htmlBuffer, "generated.html");
		ctx.replyWithDocument(inputFile);
		userStates.delete(userId);
	}
});

function sendImage(ctx: any, index: number) {
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

function generateHTML(
	titles: Array<{ content: string; index: number }>,
	paragraphs: Array<{ content: string; index: number }>,
	images: Array<{ index: number; src: string }>,
	selectedImages: Array<{ index: number; src: string }>
): string {
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
			.filter((image) =>
				selectedImages.some((selectedImage) => selectedImage.src === image.src)
			)
			.map((image) => ({
				type: "image",
				content: image.src,
				index: image.index,
			})),
	];

	const sortedElements = allElements.sort((a, b) => a.index - b.index);

	const contentHTML = sortedElements
		.map((element: { type: string; content: string; index: number }) => {
			if (element.type === "title") {
				return `<h2>${element.content}</h2>`;
			} else if (element.type === "paragraph") {
				return `<p>${element.content}</p>`;
			} else if (element.type === "image") {
				return `<img src="${element.content}" alt="" />`;
			}
		})
		.join("\n");

	return `<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${contentHTML}\n</body>\n</html>`;
}

const errorHandler: Middleware<Context> = async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		console.error(`Error while handling update ${ctx.update.update_id}:`, err);
	}
};

bot.use(errorHandler);

function isValidUrl(url: string): boolean {
	try {
		if (url.startsWith("data:image/")) {
			return true;
		}
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
