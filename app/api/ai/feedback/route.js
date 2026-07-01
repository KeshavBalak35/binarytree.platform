import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ feedback: "Great work exploring this lesson! Keep experimenting with the code — every change teaches you something new." });
  }

  const { code, lessonTitle, lessonGoal } = await request.json();

  const prompt = `You are an encouraging coding mentor for Binary Tree, teaching digital literacy to beginners in underserved communities.

A student is working on: "${lessonTitle}"
Learning goal: "${lessonGoal}"

Their code / notes:
${code || "(no code yet)"}

Give them 2-3 sentences of warm, specific, encouraging feedback. Point out what looks good, and if there's a next step they could try, mention it gently. Keep it very simple — this is likely their first exposure to programming.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return NextResponse.json({ feedback: result.response.text() });
  } catch {
    return NextResponse.json({ feedback: "You're doing great! Try changing one thing in the code and see what happens — that curiosity is what makes a great programmer." });
  }
}
