import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const { lessonTitle, courseTitle, courseCategory } = await request.json();
  if (!lessonTitle) return NextResponse.json({ error: "lessonTitle required" }, { status: 400 });

  const prompt = `You are a curriculum designer for Patchwork, an offline-first digital literacy platform for underprivileged communities.

Draft a lesson called "${lessonTitle}" for the course "${courseTitle}" (${courseCategory}).

Return ONLY valid JSON with these exact keys:
{
  "goal": "One sentence learning goal",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "checkpoint": "One question or task to check understanding",
  "code": "Starter code (10-20 lines max)"
}

Keep it simple, encouraging, and appropriate for beginners. The code should be copyable and runnable offline.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    const data = JSON.parse(match[0]);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Draft failed", details: e.message }, { status: 500 });
  }
}
