import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Context = {
  params: Promise<{
    articleId: string;
  }>;
};

type QuizInput = {
  question: string;
  options: string[];
  answer: string;
};

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const { articleId } = await params;
    const body = await req.json();
    const { quizzes, clerkId } = body;

    if (!clerkId) {
      return NextResponse.json(
        { error: "clerkId is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return NextResponse.json(
        { error: "quizzes must be a non-empty array" },
        { status: 400 },
      );
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const createdQuizzes = await Promise.all(
      quizzes.map((quiz: QuizInput) => {
        const answerIndex = quiz.options.indexOf(quiz.answer);

        return prisma.quiz.create({
          data: {
            clerkId,
            question: quiz.question,
            options: quiz.options,
            answer: answerIndex >= 0 ? answerIndex : 0,
            articleId,
          },
        });
      }),
    );

    return NextResponse.json(
      {
        message: "Quizzes created successfully",
        quizzes: createdQuizzes,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/article/[articleId]/quizzes error:", error);
    return NextResponse.json(
      { error: "Failed to save quizzes" },
      { status: 500 },
    );
  }
}
