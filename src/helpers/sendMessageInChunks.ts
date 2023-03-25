import { Context } from "grammy";

export async function sendMessageInChunks(ctx: Context, text: string) {
  const maxMessageLength = 4096;
  let startIndex = 0;
  let endIndex = maxMessageLength;

  while (startIndex < text.length) {
    if (endIndex < text.length) {
      endIndex = text.lastIndexOf("\n", endIndex);
    } else {
      endIndex = text.length;
    }

    await ctx.reply(text.slice(startIndex, endIndex));
    startIndex = endIndex + 1;
    endIndex = startIndex + maxMessageLength;
  }
}
