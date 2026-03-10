import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        user: true,
        quizzes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(articles, { status: 200 });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  try {
    const body = await req.json();
    const { title, content, summary } = body;

    if (!title || !content || !userId) {
      return NextResponse.json(
        { error: "title, content, clerkId, userId are required" },
        { status: 400 },
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary: summary ?? "",
        clerkId: userId,
        userId,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 },
    );
  }
}
