import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: { quizzes: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article, { status: 200 });
  } catch (error) {
    console.error("GET /api/articles/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 },
    );
  }
}

import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (article.clerkId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.article.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
