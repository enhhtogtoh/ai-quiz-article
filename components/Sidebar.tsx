"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import SidebarSkeleton from "./SidebarSkeleton";

interface Article {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}

interface SidebarProps {
  articles: Article[];
  loading?: boolean;
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

export default function Sidebar({
  articles,
  loading = false,
  setArticles,
}: SidebarProps) {
  const router = useRouter();

  const handleArticleClick = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };

  const handleTakeQuiz = (articleId: string) => {
    router.push(`/quiz/${articleId}`);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Устгах уу?")) return;

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.error || "Алдаа гарлаа");
        return;
      }

      // state update
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };
  return (
    <div className="h-screen p-4 overflow-y-auto bg-white border-r w-80">
      <h2 className="mb-4 text-xl font-bold">Article History</h2>
      <div className="space-y-4">
        {loading ? (
          <SidebarSkeleton />
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden transition-shadow cursor-pointer hover:shadow-md"
              onClick={() => handleArticleClick(article.id)}
            >
              <CardHeader className="p-4">
                {/* ✅ DELETE button - ГАНЦХАН */}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {article.title}
                  </CardTitle>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ❗ маш чухал
                      handleDelete(article.id);
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(article.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {article.summary}
                </p>
              </CardContent>

              <CardFooter className="flex justify-end p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // ❗ мөн энд
                    handleTakeQuiz(article.id);
                  }}
                >
                  Take Quiz
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            <p>No articles yet.</p>
            <p className="text-sm">Create your first article to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
