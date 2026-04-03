import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const articles = await prisma.article.findMany({
      where: { clerkId },
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
  const { userId: clerkId } = await auth();

  try {
    const body = await req.json();
    const { title, content, summary } = body;

    if (!title || !content || !clerkId) {
      return NextResponse.json(
        { error: "title, content, and authentication are required" },
        { status: 400 },
      );
    }

    let dbUser = await prisma.user.findFirst({ where: { clerkId } });

    if (!dbUser) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const name =
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

      dbUser = await prisma.user.create({
        data: { clerkId, email, name },
      });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary: summary ?? "",
        clerkId,
        userId: dbUser.id,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!article) {
      return NextResponse.json({ error: "Article олдсонгүй" }, { status: 404 });
    }

   
    if (article.clerkId !== userId) {
      return NextResponse.json({ error: "Хандах эрхгүй" }, { status: 403 });
    }

    await prisma.article.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Амжилттай устгалаа" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Устгах үед алдаа гарлаа" },
      { status: 500 },
    );
  }
}
