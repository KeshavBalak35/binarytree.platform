import { generateAIText, isAIConfigured, parseAIJson } from "@/lib/ai-provider";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

function fallbackDraft(lessonTitle) {
  return {
    goal: `Understand the main idea of ${lessonTitle} and apply it in a small practice task.`,
    steps: ["Read the example and identify its important parts.", "Follow the process once with guidance.", "Change one detail and explain what happened."],
    checkpoint: "Explain the idea in your own words and show one working example.",
    code: "# Add your starter example here\n# Change one detail, run it, and describe the result",
  };
}

export async function POST(request) {
  const { lessonTitle, courseTitle, courseCategory } = await request.json();
  if (!lessonTitle) return NextResponse.json({ error: "lessonTitle required" }, { status: 400 });
  if (!isAIConfigured()) return NextResponse.json({ ...fallbackDraft(lessonTitle), offline: true });

  const prompt = `You are a curriculum designer for Binary Tree, an offline-first digital literacy platform for underprivileged communities.

Draft a lesson called "${String(lessonTitle).slice(0, 180)}" for the course "${String(courseTitle || "").slice(0, 180)}" (${String(courseCategory || "").slice(0, 100)}).

Return ONLY valid JSON with these exact keys:
{
  "goal": "One sentence learning goal",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "checkpoint": "One question or task to check understanding",
  "code": "Starter code (10-20 lines max)"
}

Keep it simple, encouraging, and appropriate for beginners. The code should be copyable and runnable offline.`;

  try {
    const result = await generateAIText(prompt);
    const data = parseAIJson(result.text);
    if (!data.goal || !Array.isArray(data.steps) || !data.checkpoint) throw new Error("Incomplete draft");
    return NextResponse.json({ ...data, offline: false });
  } catch {
    return NextResponse.json({ ...fallbackDraft(lessonTitle), offline: true });
  }
}