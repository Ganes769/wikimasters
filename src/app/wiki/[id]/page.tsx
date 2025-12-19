import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/data/articles";
import WikiArticleViewer from "@/components/wiki-article";

interface ViewArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewArticlePage({
  params,
}: ViewArticlePageProps) {
  const { id } = await params;

  // Mock permission check - in a real app, this would come from auth/user context
  const canEdit = true; // Set to true for demonstration

  const article = await getArticleById(+id);

  if (!article) {
    notFound();
  }

  return <WikiArticleViewer article={article} canEdit={canEdit} />;
}
