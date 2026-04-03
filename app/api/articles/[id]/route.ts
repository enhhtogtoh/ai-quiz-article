import { auth } from "@clerk/nextjs/server";
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

type Context1 = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: NextRequest, { params }: Context1) {
  try {
    const { id } = await params;

    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 },
    );
  }
}
