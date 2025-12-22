"use server";
import sendCelebaration from "@/email/celebration-email";
import redis from "@/cache";
const milestones = [5, 10, 100, 1000, 10000];

const keyFor = (id: number | string) => `pageview:articles${id}`;
export async function increamentPageView(articleId: number) {
  const articleKey = keyFor(articleId);
  const newVal = await redis.incr(articleKey);
  console.log(`Pageview incremented for article ${articleId}: ${newVal}`);
  if (milestones.includes(newVal)) {
    console.log(
      `🎉 Milestone reached! Sending celebration email for article ${articleId} with ${newVal} views`
    );
    try {
      await sendCelebaration(articleId, +newVal);
      console.log(
        `✅ Celebration email sent successfully for article ${articleId}`
      );
    } catch (error) {
      console.error(
        `❌ Failed to send celebration email for article ${articleId}:`,
        error
      );
      // Don't throw - we still want to return the pageview count even if email fails
    }
  }
  return +newVal;
}
