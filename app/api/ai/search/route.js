import { generateAIText, isAIConfigured, parseAIJson } from "@/lib/ai-provider";
import { getAllLessons, TRACK_META } from "@/lib/curriculum";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

const STOP_WORDS = new Set(["about", "after", "before", "course", "from", "have", "help", "into", "learn", "lesson", "need", "that", "the", "this", "want", "with"]);

function lessonResult(lesson, reason) {
  return {
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary,
    track: TRACK_META[lesson.trackSlug]?.shortTitle || lesson.track || "Binary Tree course",
    reason,
  };
}

function localRecommendations(query, lessons) {
  const tokens = query.toLowerCase().match(/[a-z0-9+#.-]{3,}/g)?.filter((token) => !STOP_WORDS.has(token)) || [];
  const ranked = lessons.map((lesson) => {
    const title = String(lesson.title || "").toLowerCase();
    const summary = String(lesson.summary || "").toLowerCase();
    const keyIdeas = (lesson.keyIdeas || []).map((idea) => `${idea.term || ""} ${idea.definition || ""}`).join(" ").toLowerCase();
    const track = String(TRACK_META[lesson.trackSlug]?.title || lesson.track || "").toLowerCase();
    const score = tokens.reduce((total, token) => total + (title.includes(token) ? 8 : 0) + (keyIdeas.includes(token) ? 4 : 0) + (summary.includes(token) ? 3 : 0) + (track.includes(token) ? 2 : 0), 0);
    return { lesson, score };
  }).sort((a, b) => b.score - a.score || a.lesson.week - b.lesson.week);

  const matched = ranked.some((item) => item.score > 0) ? ranked.filter((item) => item.score > 0) : ranked;
  return matched.slice(0, 3).map(({ lesson, score }) => lessonResult(
    lesson,
    score > 0 ? `A close match for “${query.slice(0, 80)}”.` : `A practical starting point in ${TRACK_META[lesson.trackSlug]?.shortTitle || "this pathway"}.`,
  ));
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid search request is required." }, { status: 400 });
  }

  const query = String(body.query || "").trim().slice(0, 240);
  if (query.length < 3) return NextResponse.json({ error: "Describe what you want to learn." }, { status: 400 });

  const lessons = getAllLessons();
  const fallback = localRecommendations(query, lessons);
  if (!isAIConfigured()) return NextResponse.json({ recommendations: fallback, offline: true, providerStatus: "not_configured" });

  try {
    const catalog = lessons.map((lesson) => {
      const track = TRACK_META[lesson.trackSlug]?.shortTitle || lesson.track || "Course";
      return `${lesson.slug} | ${track} | ${lesson.title} | ${String(lesson.summary || "").slice(0, 220)}`;
    }).join("\n");

    const prompt = `You are Binary Tree's course guide. A learner described what they want to learn. Recommend exactly three lessons from the catalog below.

Learner request: ${query}

Rules:
- Choose only slugs that appear in the catalog.
- Prefer a sensible learning sequence, including a beginner-friendly starting point when appropriate.
- Give each recommendation one concrete sentence explaining why it fits.
- Return ONLY valid JSON in this shape: {"recommendations":[{"slug":"exact-slug","reason":"one sentence"}]}

CATALOG:
${catalog}`;

    const result = await generateAIText(prompt);
    const parsed = parseAIJson(result.text);
    const requested = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
    const bySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));
    const seen = new Set();
    const recommendations = [];

    for (const item of requested) {
      const lesson = bySlug.get(String(item?.slug || ""));
      if (!lesson || seen.has(lesson.slug)) continue;
      seen.add(lesson.slug);
      recommendations.push(lessonResult(lesson, String(item.reason || "Recommended for your learning goal.").slice(0, 260)));
      if (recommendations.length === 3) break;
    }
    for (const item of fallback) {
      if (recommendations.length === 3) break;
      if (!seen.has(item.slug)) recommendations.push(item);
    }

    return NextResponse.json({ recommendations, offline: false, provider: "apifreellm" });
  } catch (error) {
    return NextResponse.json({ recommendations: fallback, offline: true, providerStatus: error?.code || "unavailable", providerHttpStatus: Number(error?.status) || null });
  }
}