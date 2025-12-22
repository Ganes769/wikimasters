import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface WikiCardProps {
  title: string;
  author: string;
  date: string;
  summary: string;
  href: string;
  imageUrl?: string | null;
}

export function WikiCard({
  title,
  author,
  date,
  summary,
  href,
  imageUrl,
}: WikiCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const hasValidImage =
    imageUrl &&
    (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"));

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      {hasValidImage && (
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardHeader className={hasValidImage ? "pb-3" : "pb-2"}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="font-medium">{author}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(date)}</span>
          </div>
        </div>
        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-0">
        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
          {summary}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-4">
        <Link
          href={href}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors group/link"
        >
          <span>Read article</span>
          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
}
