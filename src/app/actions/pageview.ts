"use server";

import redis from "@/cache";

const keyFor = (id: number | string) => `pageview:articles${id}`;
export async function increamentPageView(articleId: number) {
  const articleKey = keyFor(articleId);
  const newVal = await redis.incr(articleKey);
  return +newVal;
}
