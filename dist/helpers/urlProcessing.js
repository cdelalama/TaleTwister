"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUrl = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const html_entities_1 = require("html-entities");
const url_1 = require("url");
async function processUrl(url) {
    const response = await axios_1.default.get(url);
    const $ = cheerio_1.default.load(response.data);
    const pageTitle = $("head > title").text().trim();
    let elementIndex = 0;
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
    return { pageTitle, titles, paragraphs, images };
}
exports.processUrl = processUrl;
