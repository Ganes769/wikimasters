"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import db from "@/db/index";
import { articles } from "@/db/schema";
import { stackServerApp } from "@/stack/server";
import { ensureUserSynced } from "@/lib/user-sync";
import { authorizedUserToEditArticles } from "@/db/authz";
import { use } from "react";

// Server actions for articles (stubs)
// TODO: Replace with real database operations when ready

export type CreateArticleInput = {
  title: string;
  content: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  // Ensure user is synced to Neon before using their ID
  const userId = await ensureUserSynced();
  if (!userId) {
    throw new Error("❌ Failed to sync user");
  }

  console.log("✨ createArticle called:", data);

  const response = await db
    .insert(articles)
    .values({
      title: data.title,
      content: data.content,
      slug: `${Date.now()}`,
      imageUrl: data.imageUrl || null,
      published: true,
      authorId: userId,
    })
    .returning({ id: articles.id });

  const articleId = response[0]?.id;
  return { success: true, message: "Article create logged", id: articleId };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }
  if (!(await authorizedUserToEditArticles(user.id, +id))) {
    throw new Error("Forbidden");
  }
  // Ensure user is synced to Neon
  await ensureUserSynced();

  console.log("📝 updateArticle called:", { id, ...data });

  const updateData: {
    title?: string;
    content?: string;
    imageUrl?: string | null;
    updatedAt?: string;
  } = {
    updatedAt: new Date().toISOString(),
  };

  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.content !== undefined) {
    updateData.content = data.content;
  }
  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl || null;
  }

  const _response = await db
    .update(articles)
    .set(updateData)
    .where(eq(articles.id, +id));

  return { success: true, message: `Article ${id} update logged` };
}

export async function deleteArticle(id: string) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  // Ensure user is synced to Neon
  await ensureUserSynced();
  if (!(await authorizedUserToEditArticles(user.id, +id))) {
    throw new Error("Forbidden");
  }
  console.log("🗑️ deleteArticle called:", id);

  const _response = await db.delete(articles).where(eq(articles.id, +id));

  return { success: true, message: `Article ${id} delete logged (stub)` };
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  await deleteArticle(String(id));
  // After deleting, redirect the user back to the homepage.
  redirect("/");
}
