import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 },
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
        { error: "AI returned invalid JSON", raw: output },
        { status: 500 },
      );
    }

    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error) {
    console.error("POST /api/generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 },
    );
  }
}
