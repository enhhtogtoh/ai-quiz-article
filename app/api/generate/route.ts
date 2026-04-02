import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "content шаардлагатай" },
        { status: 400 }
      );
    }

    const prompt = `
Generate 3 multiple choice quiz questions from the article below.

Return ONLY valid JSON in this exact format:
[
  {
    "question": "Question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Correct option text"
  }
]

Article:
${content}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate quiz questions from articles. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const output = response.choices[0]?.message?.content ?? "[]";

    let quizzes;
    try {
      quizzes = JSON.parse(output);
    } catch {
      return NextResponse.json(
        { error: "AI буруу JSON буцаалаа", raw: output },
        { status: 500 }
      );
    }

    
    const formatted = quizzes.map((q: any) => {
      const index = q.options.findIndex(
        (opt: string) => opt === q.answer
      );

      return {
        question: q.question,
        options: q.options,
        answer: index === -1 ? 0 : index, 
      };
    });

    return NextResponse.json({ quizzes: formatted }, { status: 200 });

  } catch (error) {
    console.error("POST /api/generate error:", error);
    return NextResponse.json(
      { error: "Quiz үүсгэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}