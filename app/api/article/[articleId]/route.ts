import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Context = {
  params: Promise<{
    articleId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const { articleId } = await params;
    const body = await req.json();
    const { title, content, summary } = body;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(summary !== undefined ? { summary } : {}),
      },
    });

    return NextResponse.json(updatedArticle, { status: 200 });
  } catch (error) {
    console.error("POST /api/article/[articleId] error:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 },
    );
  }
}
