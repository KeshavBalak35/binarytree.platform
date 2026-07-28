import { generateAIText, isAIConfigured, parseAIJson } from "@/lib/ai-provider";
import { getAllLessons, getLessonBySlug, TRACK_META } from "@/lib/curriculum";
import { PARTNERS, TEAM } from "@/lib/organization";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

const SITE_PAGES = [
  { href: "/", label: "Binary Tree home", purpose: "Overview of the free, offline-first learning platform." },
  { href: "/learn", label: "Explore courses", purpose: "Browse every course and lesson." },
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

const STOP_WORDS = new Set(["about", "binary", "course", "from", "help", "learn", "lesson", "need", "page", "should", "that", "this", "tree", "want", "what", "with"]);
const NAVIGATION_INTENT = /\b(find|show|take me|open|go to|where|start|recommend|browse|explore|join|apply|course|lesson|tool|study|practice)\b/i;
const SUBJECTIVE_JUDGMENT = /\b(smart|intelligent|good person|trustworthy|talented|best|better than|competent)\b/i;

function cleanPathname(value) {
  const pathname = String(value || "/").split("?")[0];
  return pathname.startsWith("/") ? pathname.slice(0, 180) : "/";
}

function currentPageContext(pathname) {
  if (pathname.startsWith("/learn/")) {
    const lesson = getLessonBySlug(pathname.slice("/learn/".length));
    if (lesson) return `The learner is reading "${lesson.title}" in ${lesson.track}. Summary: ${lesson.summary} Learning goals: ${lesson.objectives.join("; ")} Practice activity: ${lesson.activity}`;
  }
  const page = SITE_PAGES.toSorted((a, b) => b.href.length - a.href.length).find((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)));
  return page ? `${page.label}: ${page.purpose}` : "A Binary Tree public page.";
}

function lessonAction(lesson, reason) {
  return { label: lesson.title, href: `/learn/${lesson.slug}`, detail: String(reason || lesson.summary).slice(0, 180) };
}

function findLessons(query, lessons) {
  const tokens = String(query).toLowerCase().match(/[a-z0-9+#.-]{3,}/g)?.filter((token) => !STOP_WORDS.has(token)) || [];
  const ranked = lessons.map((lesson) => {
    const text = [lesson.title, lesson.summary, lesson.track, ...(lesson.objectives || []), ...(lesson.keyIdeas || []).flatMap((idea) => [idea.term, idea.definition])].join(" ").toLowerCase();
    return { lesson, score: tokens.reduce((total, token) => total + (text.includes(token) ? 1 : 0), 0) };
  }).sort((a, b) => b.score - a.score || a.lesson.week - b.lesson.week);
  const matches = ranked[0]?.score > 0 ? ranked.filter((item) => item.score > 0) : ranked;
  return matches.slice(0, 3).map(({ lesson }) => lessonAction(lesson, "A close match for what you described."));
}

function roleExplanation(person) {
  if (person.role.includes("AI, Open Source and Hackathons")) return "Their listed responsibilities cover Binary Tree’s AI work, open-source initiatives, and hackathons.";
  if (person.role.includes("International Relations and Education")) return "Their listed responsibilities connect international relationships with education programs.";
  if (person.role.includes("Curriculum Design and Education")) return "Their listed responsibilities cover curriculum design and education.";
  if (person.role === "Founder") return "As founder, they are listed as the person who established Binary Tree.";
  if (person.role === "Executive Director") return "As executive director, they are listed in an organization-wide leadership role.";
  return `Their published area is ${person.group.toLowerCase()}.`;
}

function mentionedTeamMember(question) {
  const normalized = question.toLowerCase();
  return TEAM.find((person) => {
    const fullName = person.name.toLowerCase().replace(/[.]/g, "");
    const meaningfulParts = fullName.split(/\s+/).filter((part) => part.length >= 4);
    return normalized.replace(/[.]/g, "").includes(fullName) || meaningfulParts.some((part) => normalized.includes(part));
  }) || null;
}

function localResponse(question, pathname, lessons) {
  const normalized = question.toLowerCase();
  const person = mentionedTeamMember(question);
  if (person) {
    const judgment = SUBJECTIVE_JUDGMENT.test(question)
      ? `The published team page does not provide enough evidence to fairly judge whether ${person.name} is “smart.” A leadership title can show responsibility and trust, but it is not proof of intelligence.`
      : "";
    return {
      answer: `${person.name} is Binary Tree’s ${person.role}. ${roleExplanation(person)}${judgment ? ` ${judgment}` : ""}`,
      actions: [],
    };
  }
  if (/(course|lesson|learn|python|coding|design|data|business|machine|spreadsheet|digital)/.test(normalized)) {
    return { answer: "I found a few lessons that match what you described. Start with the first one, then use its lesson tutor whenever an idea needs a simpler explanation.", actions: findLessons(question, lessons) };
  }
  if (/(teacher|educator|class|lesson plan)/.test(normalized)) {
    return { answer: "The educator hub combines the curriculum, assessment, offline study materials, and an AI planner that builds a complete 60-minute lesson for low-resource classrooms.", actions: SITE_PAGES.filter((page) => ["/educators", "/educators/lesson-planner", "/assessment"].includes(page.href)).map(({ label, href, purpose }) => ({ label, href, detail: purpose })) };
  }
  if (/(team|partner|join|apply|organization)/.test(normalized)) {
    return { answer: `Binary Tree currently lists ${TEAM.length} team leaders and ${PARTNERS.length} partner organizations. You can meet them or apply through the official form on the site.`, actions: SITE_PAGES.filter((page) => ["/team", "/partners", "/apply"].includes(page.href)).map(({ label, href, purpose }) => ({ label, href, detail: purpose })) };
  }
  if (/(type|typing|keyboard|wpm|accuracy)/.test(normalized)) {
    return { answer: "Key Quest gives you a focused one-minute typing session, then turns your speed and accuracy into a specific next practice target.", actions: [{ label: "Start typing practice", href: "/typing", detail: "Practice speed and accuracy with an AI coach after every session." }] };
  }
  if (/(assess|skill|level|start|next)/.test(normalized)) {
    return { answer: "If you are unsure where to begin, take the short skills assessment. It creates a private AI learning plan from your score and missed topics, without sending your name to the AI.", actions: [{ label: "Take the skills assessment", href: "/assessment", detail: "Eight questions, one reflection, and a personalized next-step plan." }, { label: "Explore all courses", href: "/learn", detail: "Browse the complete curriculum." }] };
  }
  return { answer: `I can explain this page, find a course, recommend your next step, or take you directly to a Binary Tree tool. You are currently on ${currentPageContext(pathname)}`, actions: SITE_PAGES.filter((page) => ["/learn", "/assessment", "/study"].includes(page.href)).map(({ label, href, purpose }) => ({ label, href, detail: purpose })) };
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
    actions.push({ label: String(item?.label || page?.label || lesson?.title || "Open").slice(0, 80), href, detail: String(item?.detail || page?.purpose || lesson?.summary || "").slice(0, 180) });
    if (actions.length === 3) break;
  }
  return actions;
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "A valid AI request is required." }, { status: 400 }); }
  const question = String(body.question || "").trim().slice(0, 700);
  const pathname = cleanPathname(body.pathname);
  const history = (Array.isArray(body.history) ? body.history : []).slice(-6).map((item) => `${item?.role === "assistant" ? "Assistant" : "Learner"}: ${String(item?.text || "").slice(0, 500)}`).join("\n");
  if (question.length < 2) return NextResponse.json({ error: "Ask a question or describe a goal." }, { status: 400 });

  const lessons = getAllLessons();
  const fallback = localResponse(question, pathname, lessons);
  const directPersonAnswer = mentionedTeamMember(question) && !NAVIGATION_INTENT.test(question);
  if (directPersonAnswer) return NextResponse.json({ ...fallback, offline: false, grounded: true, provider: "site-data" });
  if (!isAIConfigured()) return NextResponse.json({ ...fallback, offline: true });

  const lessonCatalog = lessons.map((lesson) => `${`/learn/${lesson.slug}`} | ${TRACK_META[lesson.trackSlug]?.shortTitle || lesson.track} | ${lesson.title} | ${String(lesson.summary).slice(0, 180)}`).join("\n");
  const siteMap = SITE_PAGES.map((page) => `${page.href} | ${page.label} | ${page.purpose}`).join("\n");
  const team = TEAM.map((person) => `${person.name} — ${person.role}; published area: ${person.group}`).join("; ");
  const partners = PARTNERS.map((partner) => `${partner.name} (${partner.focus})`).join("; ");
  const prompt = `You are the built-in Binary Tree AI guide. You help a learner take a useful action inside this website.

CURRENT PAGE
${currentPageContext(pathname)}

RECENT CONVERSATION
${history || "No earlier messages."}

LEARNER REQUEST
${question}

GROUNDING RULES
- Use only the site map, course catalog, team, and partner facts below.
- Identify every distinct question or request in the learner's message and answer each one. Never silently skip a clause.
- Separate published facts from reasonable inference and from what cannot be known from the supplied evidence.
- For subjective judgments such as whether a person is smart, good, trustworthy, or talented, explicitly say the site does not provide enough evidence to judge. You may explain what their published role suggests, but label that as an inference rather than proof.
- Be warm, direct, conversational, and practical. Answer in at most 140 words.
- Recommend zero to three useful internal links. Only include a link when the learner asks to navigate, find, open, start, or when a link materially completes the request. Direct factual answers should normally return an empty actions array.
- Never invent a link.
- If the request is outside Binary Tree or the supplied curriculum, say what you can help with instead.
- Do not imply access to private accounts, assessment records, browsing history, or progress unless the learner wrote it in this conversation.
- Return ONLY valid JSON:
{"answer":"short response","actions":[{"label":"short action label","href":"exact catalog or site-map path","detail":"why this helps"}]}

SITE MAP
${siteMap}

COURSE CATALOG
${lessonCatalog}

TEAM
${team}

PARTNERS
${partners}`;

  try {
    const result = await generateAIText(prompt, { json: true, temperature: 0.15 });
    const parsed = parseAIJson(result.text);
    let answer = String(parsed?.answer || "").trim();
    if (!answer) throw new Error("Missing answer");
    const namedPerson = mentionedTeamMember(question);
    if (namedPerson && !answer.toLowerCase().includes(namedPerson.role.toLowerCase())) {
      answer = `${namedPerson.name} is Binary Tree’s ${namedPerson.role}. ${answer}`;
    }
    if (namedPerson && SUBJECTIVE_JUDGMENT.test(question) && !/(not enough evidence|cannot judge|can’t judge|can't judge|does not provide enough|not possible to judge)/i.test(answer)) {
      answer += ` The published team page does not provide enough evidence to fairly judge whether ${namedPerson.name} is “smart.” Their role shows responsibility, but a title alone is not proof of intelligence.`;
    }
    answer = answer.slice(0, 1200);
    const actions = NAVIGATION_INTENT.test(question)
      ? safeActions([...safeActions(parsed.actions, lessons), ...fallback.actions], lessons)
      : [];
    return NextResponse.json({ answer, actions, offline: false, provider: "groq" });
  } catch {
    return NextResponse.json({ ...fallback, offline: true });
  }
}