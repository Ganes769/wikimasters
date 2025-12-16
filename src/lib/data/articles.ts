import db from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { usersSync } from "drizzle-orm/neon";

export async function getArticles() {
  const response = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));
  console.log(response);

  return response;
}

export async function getArticleById(id: number) {
  const articlesList = await getArticles();
  return articlesList.find((a) => +a.id === id) || null;
}
