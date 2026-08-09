import { generateAIText, isAIConfigured, parseAIJson } from "@/lib/ai-provider";
import { getAllLessons, TRACK_META } from "@/lib/curriculum";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

function catalogText(lessons) {
  return lessons.map((lesson) => `${lesson.slug} | ${TRACK_META[lesson.trackSlug]?.shortTitle || lesson.track} | ${lesson.title} | ${String(lesson.summary).slice(0, 180)}`).join("\n");
}

function safeRecommendations(items, lessons) {
  const bySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
  const seen = new Set();
  const recommendations = [];
  for (const item of Array.isArray(items) ? items : []) {
    const lesson = bySlug.get(String(item?.slug || ""));
    if (!lesson || seen.has(lesson.slug)) continue;
    seen.add(lesson.slug);
    recommendations.push({ slug: lesson.slug, title: lesson.title, track: TRACK_META[lesson.trackSlug]?.shortTitle || lesson.track, reason: String(item?.reason || lesson.summary).slice(0, 220) });
    if (recommendations.length === 3) break;
  }
  return recommendations;
}

function assessmentFallback(score, total, lessons) {
  const start = score >= 7 ? 9 : score >= 4 ? 3 : 0;
  return {
    title: score >= 7 ? "Strong foundation—stretch the skill." : score >= 4 ? "A useful foundation to build on." : "Start small and make the basics feel familiar.",
    summary: `You answered ${score} of ${total} scored questions correctly. This is a starting point, not a label.`,
    nextSteps: score >= 7 ? ["Choose one intermediate lesson.", "Complete its practice activity.", "Use the quiz to check what transfers."] : ["Begin with one foundational lesson.", "Practice for 20 focused minutes.", "Use flashcards before taking the lesson quiz."],
    recommendations: lessons.slice(start, start + 3).map((lesson) => ({ slug: lesson.slug, title: lesson.title, track: TRACK_META[lesson.trackSlug]?.shortTitle || lesson.track, reason: "A practical next lesson from the Binary Tree curriculum." })),
  };
}

function typingFallback(result) {
  const accuracy = Number(result.accuracy || 0);
  const wpm = Number(result.wpm || 0);
  return {
    title: accuracy >= 96 ? "Your accuracy is ready for a little more speed." : "Slow down slightly and protect accuracy.",
    summary: `You finished at ${wpm} WPM with ${accuracy}% accuracy. ${accuracy >= 96 ? "That consistency is the right base for a harder round." : "Clean keystrokes will raise your speed more reliably than rushing."}`,
    nextSteps: accuracy >= 96 ? ["Repeat once at the same level.", "Keep your hands relaxed.", "Move up a level if accuracy stays above 94%."] : ["Repeat the same level.", "Pause after each mistake instead of speeding up.", "Aim for 95% accuracy before changing difficulty."],
    recommendedLevel: accuracy >= 96 && result.level !== "hard" ? (result.level === "easy" ? "medium" : "hard") : String(result.level || "easy"),
  };
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "A valid coaching request is required." }, { status: 400 }); }
  const type = body.type === "typing" ? "typing" : body.type === "assessment" ? "assessment" : "";
  if (!type) return NextResponse.json({ error: "A supported coaching type is required." }, { status: 400 });
  const lessons = getAllLessons();

  if (type === "assessment") {
    const score = Math.max(0, Math.min(8, Number(body.score) || 0));
    const total = 8;
    const missedSkills = (Array.isArray(body.missedSkills) ? body.missedSkills : []).slice(0, 8).map((item) => String(item).slice(0, 220));
    const reflection = String(body.reflection || "").trim().slice(0, 500);
    const fallback = assessmentFallback(score, total, lessons);
    if (!isAIConfigured()) return NextResponse.json({ ...fallback, offline: true });
    const prompt = `You are Binary Tree's supportive learning-plan coach. Turn this private skills check into a concrete next step.

Score: ${score}/${total}
Topics missed: ${missedSkills.join("; ") || "None supplied"}
Learner's goal: ${reflection || "Not supplied"}

Choose exactly three real lessons from the catalog. Never shame the learner or overstate what eight questions prove. Return ONLY valid JSON:
{"title":"encouraging headline","summary":"two concise sentences","nextSteps":["three specific steps"],"recommendations":[{"slug":"exact slug","reason":"why this fits"}]}

CATALOG
${catalogText(lessons)}`;
    try {
      const result = await generateAIText(prompt, { json: true, temperature: 0.15, models: ["openai/gpt-oss-20b"] });
      const parsed = parseAIJson(result.text);
      const recommendations = safeRecommendations(parsed.recommendations, lessons);
      if (!parsed.title || !parsed.summary || !Array.isArray(parsed.nextSteps) || recommendations.length < 2) throw new Error("Incomplete plan");
      return NextResponse.json({ title: String(parsed.title).slice(0, 180), summary: String(parsed.summary).slice(0, 600), nextSteps: parsed.nextSteps.slice(0, 3).map((item) => String(item).slice(0, 220)), recommendations, offline: false, provider: "groq" });
    } catch {
      return NextResponse.json({ ...fallback, offline: true });
    }
  }

  const result = {
    wpm: Math.max(0, Math.min(300, Number(body.result?.wpm) || 0)),
    rawWpm: Math.max(0, Math.min(300, Number(body.result?.rawWpm) || 0)),
    accuracy: Math.max(0, Math.min(100, Number(body.result?.accuracy) || 0)),
    mistakes: Math.max(0, Math.min(999, Number(body.result?.mistakes) || 0)),
    words: Math.max(0, Math.min(9999, Number(body.result?.words) || 0)),
    level: ["easy", "medium", "hard"].includes(body.result?.level) ? body.result.level : "easy",
  };
  const fallback = typingFallback(result);
  if (!isAIConfigured()) return NextResponse.json({ ...fallback, offline: true });
  const prompt = `You are Binary Tree's practical typing coach. Give a beginner a precise next-round plan from these one-minute results:
${JSON.stringify(result)}

Be encouraging but specific. Accuracy matters before speed. Return ONLY valid JSON:
{"title":"short headline","summary":"two sentences using their actual metrics","nextSteps":["three short actions"],"recommendedLevel":"easy|medium|hard"}`;
  try {
    const generation = await generateAIText(prompt, { json: true, temperature: 0.15, models: ["openai/gpt-oss-20b"] });
    const parsed = parseAIJson(generation.text);
    const recommendedLevel = ["easy", "medium", "hard"].includes(parsed.recommendedLevel) ? parsed.recommendedLevel : fallback.recommendedLevel;
    if (!parsed.title || !parsed.summary || !Array.isArray(parsed.nextSteps)) throw new Error("Incomplete coach");
    return NextResponse.json({ title: String(parsed.title).slice(0, 180), summary: String(parsed.summary).slice(0, 600), nextSteps: parsed.nextSteps.slice(0, 3).map((item) => String(item).slice(0, 220)), recommendedLevel, offline: false, provider: "groq" });
  } catch {
    return NextResponse.json({ ...fallback, offline: true });
  }
}