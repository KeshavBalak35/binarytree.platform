import { generateAIText, isAIConfigured, parseAIJson } from "@/lib/ai-provider";
import { getAllLessons, getLessonBySlug, TRACK_META } from "@/lib/curriculum";
import { PARTNERS, TEAM } from "@/lib/organization";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

const SITE_PAGES = [
  { href: "/", label: "Binary Tree home", purpose: "Overview of the free, offline-first learning platform." },
  { href: "/learn", label: "Explore courses", purpose: "Browse every course and lesson." },
  { href: "/lab", label: "Code Lab", purpose: "Build, run, test, and improve hands-on web and Python projects." },
  { href: "/progress", label: "Learning progress", purpose: "See the learning tree, course branches, recent activity, and next lesson." },
  { href: "/study", label: "Study workspace", purpose: "Choose a lesson, ask the grounded tutor, use flashcards, and take a quiz." },
  { href: "/typing", label: "Typing practice", purpose: "Run one-minute typing practice with speed and accuracy feedback." },
  { href: "/assessment", label: "Skills assessment", purpose: "Take the eight-question pre or post skills check." },
  { href: "/educators", label: "Educator hub", purpose: "Find low-resource classroom tools and curriculum guidance." },
  { href: "/educators/lesson-planner", label: "AI lesson planner", purpose: "Generate a complete low-resource 60-minute lesson plan." },
  { href: "/offline", label: "Offline access", purpose: "Understand what keeps working without a connection." },
  { href: "/about", label: "Our approach", purpose: "Learn how Binary Tree designs accessible education." },
  { href: "/team", label: "Meet the team", purpose: "See Binary Tree leadership and responsibilities." },
  { href: "/partners", label: "Our partners", purpose: "Explore the organizations supporting the mission." },
  { href: "/apply", label: "Apply to join", purpose: "Open the official Binary Tree team application." },
];

const NAVIGATION_INTENT = /\b(find|show|take me|open|go to|where|start|recommend|browse|explore|join|apply|course|lesson|learn|teach|tool|study|practice)\b/i;

function cleanPathname(value) {
  const pathname = String(value || "/").split("?")[0];
  return pathname.startsWith("/") ? pathname.slice(0, 180) : "/";
}

function currentPageContext(pathname) {
  if (pathname.startsWith("/lab/")) {
    const lesson = getLessonBySlug(pathname.slice("/lab/".length));
    if (lesson?.project) return `The learner is working in Code Lab on "${lesson.project.title}" for the lesson "${lesson.title}". Project goal: ${lesson.project.description}`;
  }
  if (pathname.startsWith("/learn/")) {
    const lesson = getLessonBySlug(pathname.slice("/learn/".length));
    if (lesson) return `The learner is reading "${lesson.title}" in ${lesson.track}. Summary: ${lesson.summary} Learning goals: ${lesson.objectives.join("; ")} Practice activity: ${lesson.activity}`;
  }
  const page = SITE_PAGES.toSorted((a, b) => b.href.length - a.href.length).find((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)));
  return page ? `${page.label}: ${page.purpose}` : "A Binary Tree public page.";
}

function answerActions(answer, lessons) {
  const text = String(answer || "");
  const paths = (text.match(/\/learn\/[a-z0-9-]+/gi) || []).map((href) => ({ href }));
  const namedLessons = lessons.filter((lesson) => text.toLowerCase().includes(lesson.title.toLowerCase())).map((lesson) => ({ href: `/learn/${lesson.slug}` }));
  return [...paths, ...namedLessons];
}

const SEARCH_STOP_WORDS = new Set(["a", "an", "and", "begin", "beginning", "course", "for", "from", "i", "learn", "lesson", "me", "of", "start", "the", "to", "want", "with"]);

function navigationFallbackActions(question, lessons) {
  const normalizedQuestion = String(question || "").toLowerCase();
  const tokens = [...new Set(normalizedQuestion.match(/[a-z0-9]+/g) || [])].filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));
  return lessons
    .map((lesson, index) => {
      const title = String(lesson.title || "").toLowerCase();
      const track = String(lesson.track || "").toLowerCase();
      const summary = String(lesson.summary || "").toLowerCase();
      const score = tokens.reduce((total, token) => total + (title.includes(token) ? 8 : 0) + (track.includes(token) ? 4 : 0) + (summary.includes(token) ? 2 : 0), 0);
      return { lesson, score, index };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 3)
    .map(({ lesson }) => ({ href: `/learn/${lesson.slug}`, label: lesson.title, detail: lesson.summary }));
}

function safeActions(items, lessons) {
  const knownPages = new Map(SITE_PAGES.map((page) => [page.href, page]));
  const knownLessons = new Map(lessons.map((lesson) => [`/learn/${lesson.slug}`, lesson]));
  const actions = [];
  const seen = new Set();
  for (const item of Array.isArray(items) ? items : []) {
    const href = String(item?.href || "").split("#")[0];
    if (seen.has(href)) continue;
    const page = knownPages.get(href);
    const lesson = knownLessons.get(href);
    if (!page && !lesson) continue;
    seen.add(href);
    actions.push({
      label: String(item?.label || page?.label || lesson?.title || "Open").slice(0, 80),
      href,
      detail: String(item?.detail || page?.purpose || lesson?.summary || "").slice(0, 180),
    });
    if (actions.length === 3) break;
  }
  return actions;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid AI request is required." }, { status: 400 });
  }

  const question = String(body.question || "").trim().slice(0, 700);
  const pathname = cleanPathname(body.pathname);
  if (question.length < 2) return NextResponse.json({ error: "Ask a question or describe a goal." }, { status: 400 });
  if (!isAIConfigured()) return NextResponse.json({ error: "Binary Tree AI is not configured.", code: "not_configured" }, { status: 503 });

  const history = (Array.isArray(body.history) ? body.history : []).slice(-6).map((item) => ({
    role: item?.role === "assistant" ? "assistant" : "user",
    content: String(item?.text || "").slice(0, 700),
  })).filter((item) => item.content && item.content !== question);
  const lessons = getAllLessons();
  const lessonCatalog = lessons.map((lesson) => `${`/learn/${lesson.slug}`} | ${TRACK_META[lesson.trackSlug]?.shortTitle || lesson.track} | ${lesson.title} | ${String(lesson.summary).slice(0, 120)}`).join("\n");
  const siteMap = SITE_PAGES.map((page) => `${page.href} | ${page.label} | ${page.purpose}`).join("\n");
  const team = TEAM.map((person) => `${person.name} — ${person.role}; published area: ${person.group}`).join("; ");
  const partners = PARTNERS.map((partner) => `${partner.name} (${partner.focus})`).join("; ");

  const systemPrompt = `You are the built-in Binary Tree AI tutor and site guide. Respond to the learner's actual request, not with a generic description of what you can do.

CURRENT PAGE
${currentPageContext(pathname)}

RULES
- Use the supplied data as the only source for claims about Binary Tree, its people, partners, pages, and courses.
- You may use your general educational knowledge to directly teach or explain topics outside the current Binary Tree curriculum. Clearly say when Binary Tree does not yet have a matching course, but still give a useful beginner answer.
- Treat recent messages as a real conversation. Resolve follow-ups and pronouns from that context.
- Tolerate spelling and grammar mistakes; infer the most likely meaning without correcting or shaming the learner.
- Identify every distinct question or request and answer each one. Never silently skip a clause.
- Separate published facts from reasonable inference and from what cannot be known from the supplied evidence.
- For subjective judgments about a person, explicitly say the site does not provide enough evidence to judge. A published role can support an inference, not proof.
- Be warm, direct, conversational, and practical. Start with the answer. Use readable Markdown when it helps, but do not use LaTeX notation. Use up to 220 words when teaching requires it.
- Recommend zero to three useful internal links. When the learner asks to find, start, or learn a course, include at least one action and copy its exact title and path character-for-character from the course catalog. Direct factual answers normally have no actions.
- Never invent a link or claim access to private accounts, assessment records, browsing history, or progress.
- Return ONLY valid JSON in this shape: {"answer":"response","actions":[{"label":"label","href":"exact internal path","detail":"why this helps"}]}

SITE MAP
${siteMap}

COURSE CATALOG
${lessonCatalog}

TEAM
${team}

PARTNERS
${partners}`;

  try {
    const result = await generateAIText([
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: question },
    ], { json: true, temperature: 0.2, maxCompletionTokens: 900 });
    const parsed = parseAIJson(result.text);
    const answer = String(parsed?.answer || "").trim().slice(0, 1800);
    if (!answer) throw new Error("Missing answer");
    let actions = NAVIGATION_INTENT.test(question) ? safeActions([...(Array.isArray(parsed.actions) ? parsed.actions : []), ...answerActions(answer, lessons)], lessons) : [];
    if (NAVIGATION_INTENT.test(question) && actions.length === 0) {
      actions = safeActions(navigationFallbackActions(question, lessons), lessons);
    }
    if (NAVIGATION_INTENT.test(question) && actions.length === 0) {
      try {
        const linkResult = await generateAIText([
          { role: "system", content: `Select up to three relevant lessons from this exact catalog. Copy paths exactly. Return only JSON: {"actions":[{"href":"/learn/exact-slug","label":"exact title","detail":"short reason"}]}\n\n${lessonCatalog}` },
          { role: "user", content: `Learner request: ${question}\n\nYour answer: ${answer}` },
        ], { json: true, temperature: 0, maxCompletionTokens: 300 });
        actions = safeActions(parseAIJson(linkResult.text)?.actions, lessons);
      } catch {}
    }
    return NextResponse.json({ answer, actions, provider: "groq", model: result.model });
  } catch (error) {
    const code = error?.code || "invalid_response";
    const status = Number(error?.status) >= 400 ? Number(error.status) : 502;
    return NextResponse.json({ error: "The live AI could not answer right now. Please try again.", code }, { status });
  }
}