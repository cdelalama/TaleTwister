import { Middleware, Context } from "grammy";

export const errorHandler: Middleware<Context> = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(`Error while handling update ${ctx.update.update_id}:`, err);
  }
};
