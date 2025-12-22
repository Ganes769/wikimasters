import db from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { usersSync } from "drizzle-orm/neon";
import redis from "@/cache";

type ArticleListItem = {
  title: string;
  id: number;
  createdAt: string;
  content: string;
  author: string | null;
  imageUrl: string | null;
};

export async function getArticles(): Promise<ArticleListItem[]> {
  const cached = await redis.get<ArticleListItem[]>("articles:all");
  if (cached && Array.isArray(cached)) {
    console.log("GET articles cahced hi");
    return cached;
  } else {
    console.log("get article missed cahced ");
  }
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));
  console.log(response);
  redis.set("articles:all", response, {
    ex: 60,
  });

  return response;
}

export async function getArticleById(id: number) {
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .where(eq(articles.id, id))
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));
  return response[0] ? response[0] : null;
}
