import { WikiCard } from "@/components/wiki-card";
import { getArticles } from "@/lib/data/articles";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, BookOpen, Sparkles } from "lucide-react";

export default async function Home() {
  const articles = await getArticles();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Share your knowledge with the world</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                WikiMasters
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl md:text-2xl">
              Create, share, and discover articles. Build your knowledge base
              one article at a time.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group text-base">
                <Link href="/wiki/new">
                  <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                  Create Article
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="#articles">
                  <BookOpen className="h-5 w-5" />
                  Browse Articles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <main id="articles" className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Latest Articles
            </h2>
            <p className="text-muted-foreground">
              Discover the most recent contributions from our community
            </p>
          </div>

          {articles.length > 0 ? (
            <div className="flex flex-col gap-6">
              {articles.map(({ title, id, createdAt, content, author }) => (
                <WikiCard
                  title={title}
                  author={author ? author : "Unknown"}
                  date={createdAt}
                  summary={content.substring(0, 200)} // temporary
                  href={`/wiki/${id}`}
                  key={id}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No articles yet</h3>
              <p className="mb-6 text-muted-foreground">
                Be the first to create an article and share your knowledge!
              </p>
              <Button asChild>
                <Link href="/wiki/new">
                  <Plus className="h-4 w-4" />
                  Create Your First Article
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
