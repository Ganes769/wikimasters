import resend from "@/email";
import db from "@/db";
import { usersSync } from "drizzle-orm/neon";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import CelebrationTemplate from "@/template/celebration-template";
import { title } from "process";
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default async function sendCelebaration(
  articleId: number,
  pageView?: number
) {
  const response = await db
    .select({
      email: usersSync.email,
      id: usersSync.id,
      title: articles.title,
      name: usersSync.name,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
    .where(eq(articles.id, articleId));

  if (!response[0]) {
    console.log(
      `⚠️ No article found with id ${articleId}, skipping celebration email`
    );
    return;
  }

  const { email, name, title } = response[0];
  console.log("📧 Author email:", email);
  if (!email) {
    console.log(
      "⚠️ No email found for article author, skipping celebration email"
    );
    return;
  }

  try {
    const emailres = await resend.emails.send({
      from: "wikimaster <onboarding@resend.dev>",
      to: "ganeshsnawali@gmail.com",
      subject: `your articles on wikimaster got page view ${pageView}`,
      react: (
        <CelebrationTemplate
          articleTitle={title}
          articleUrl={`${BASE_URL}/wiki/${articleId}`}
          name={name ?? "Friend"}
          pageviews={pageView as any}
        />
      ),
    });
    if (emailres.error) {
      console.error(
        `❌ Email send error for article ${articleId}:`,
        emailres.error
      );
    } else {
      console.log(
        `✅ Email sent successfully for celebration: article ${articleId} with ${pageView} views`
      );
    }
  } catch (error) {
    console.error(
      `❌ Exception sending celebration email for article ${articleId}:`,
      error
    );
    throw error; // Re-throw so the caller can handle it
  }
}
