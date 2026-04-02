import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type Context = {
  params: Promise<{ id: string }>;
};

type QuizInput = {
  question: string;
  options: string[];
  answer: string;
};

export async function POST(req: NextRequest, { params }: Context) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: articleId } = await params;
    const body = await req.json();
    const { quizzes } = body;

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      return NextResponse.json(
        { error: "quizzes must be a non-empty array" },
        { status: 400 },
      );
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const createdQuizzes = await Promise.all(
      quizzes.map((quiz: QuizInput) => {
        // Convert answer text to index
        const answerIndex = quiz.options.indexOf(quiz.answer);
        // const answerValue = answerIndex >= 0 ? answerIndex.toString() : "0";

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

    return NextResponse.json({ quizzes: createdQuizzes }, { status: 201 });
  } catch (error) {
    console.error("POST /api/articles/[id]/quizzes error:", error);
    return NextResponse.json(
      { error: "Failed to save quizzes" },
      { status: 500 },
    );
  }
}
