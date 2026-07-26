import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

const LANGUAGE_NAMES = { en: "English", sw: "Kiswahili", fr: "French" };

function offlineAnswer(lesson, language) {
  if (language === "sw") return `${lesson.summary} Tumia kadi za kujifunza na jaribio la somo kwa mapitio zaidi.`;
  if (language === "fr") return `${lesson.summary} Utilisez les cartes mémoire et le quiz de la leçon pour aller plus loin.`;
  return `${lesson.summary} A useful practice step is: ${lesson.activity}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const question = String(body.question || "").trim().slice(0, 800);
    const mode = body.mode === "simplify" ? "simplify" : "answer";
    const language = LANGUAGE_NAMES[body.language] ? body.language : "en";
    const lesson = body.lesson || {};

    if (!question || !lesson.title || !lesson.summary) {
      return NextResponse.json({ error: "A question and lesson context are required." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ answer: offlineAnswer(lesson, language), offline: true });
    }

    const context = [
      `Lesson title: ${String(lesson.title).slice(0, 160)}`,
      `Lesson summary: ${String(lesson.summary).slice(0, 1400)}`,
      `Key ideas: ${JSON.stringify(lesson.keyIdeas || []).slice(0, 3600)}`,
      `Practice activity: ${String(lesson.activity || "").slice(0, 1200)}`,
    ].join("\n");

    const instruction = mode === "simplify"
      ? "Rewrite the prior answer more simply, using one short analogy if helpful."
      : "Answer the learner's question using only the lesson context below.";
    const prompt = `You are Patchwork's patient study companion for learners who may share a phone or computer and may have limited bandwidth.

${instruction}
- Respond in ${LANGUAGE_NAMES[language]}.
- Stay grounded in the supplied lesson. If the context does not support an answer, say so and point to the closest relevant idea.
- Use plain language, at most 120 words, and short paragraphs.
- Never claim that a draft translation was reviewed by a native speaker.

${context}

Learner request: ${question}`;

    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });
    const generation = model.generateContent(prompt).then((result) => result.response.text());
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 12000));
    const answer = await Promise.race([generation, timeout]);
    return NextResponse.json({ answer: answer.trim().slice(0, 1400), offline: false });
  } catch {
    return NextResponse.json({ error: "The study companion is temporarily unavailable." }, { status: 503 });
  }
}
