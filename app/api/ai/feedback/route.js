import { generateAIText, isAIConfigured } from "@/lib/ai-provider";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

const FALLBACK_FEEDBACK = "You're doing great! Try changing one thing in the code and see what happens — that curiosity is what makes a great programmer.";

export async function POST(request) {
  const { code, lessonTitle, lessonGoal } = await request.json();
  if (!isAIConfigured()) return NextResponse.json({ feedback: FALLBACK_FEEDBACK, offline: true });

  const prompt = `You are an encouraging coding mentor for Binary Tree, teaching digital literacy to beginners in underserved communities.

A student is working on: "${String(lessonTitle || "this lesson").slice(0, 180)}"
Learning goal: "${String(lessonGoal || "practice the lesson skill").slice(0, 400)}"

Their code / notes:
${String(code || "(no code yet)").slice(0, 6000)}

Give them 2-3 sentences of warm, specific, encouraging feedback. Point out what looks good, and if there's a next step they could try, mention it gently. Keep it very simple — this is likely their first exposure to programming.`;

  try {
    const result = await generateAIText(prompt);
    return NextResponse.json({ feedback: result.text.slice(0, 1200), offline: false });
  } catch {
    return NextResponse.json({ feedback: FALLBACK_FEEDBACK, offline: true });
  }
}