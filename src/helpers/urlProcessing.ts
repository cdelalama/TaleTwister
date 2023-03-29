import axios from "axios";
import cheerio from "cheerio";
import { decode } from "html-entities";
import { URL } from "url";

export async function processUrl(url: string) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const pageTitle = $("head > title").text().trim();

  let elementIndex = 0;

  const titles: Array<{ content: string; index: number }> = [];
  const paragraphs: Array<{ content: string; index: number }> = [];
  const images: Array<{ index: number; src: string }> = [];

  $("body *").each((_i, el) => {
    if ($(el).is("h1, h2, h3, h4, h5, h6")) {
      titles.push({
        content: decode($(el).text().trim()),
        index: elementIndex,
      });
    } else if ($(el).is("p")) {
      paragraphs.push({
        content: decode($(el).text().trim()),
        index: elementIndex,
      });
    } else if ($(el).is("img")) {
      const src = $(el).attr("src")!;
      const absoluteUrl = new URL(src, response.request.responseURL).toString();
      images.push({ index: elementIndex, src: absoluteUrl });
    } else {
      // Skip non-matching elements
      return;
    }
    elementIndex++;
  });

  return { pageTitle, titles, paragraphs, images };
}
