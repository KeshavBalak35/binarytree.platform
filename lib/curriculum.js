import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIRECTORY = path.join(process.cwd(), "content", "lessons");

export const TRACK_META = {
  "professional-foundations": {
    title: "Professional Foundations",
    shortTitle: "Professional Skills",
    description: "Career communication, productivity, automation, web fundamentals, Python, and responsible AI.",
    eyebrow: "Work-ready digital skills",
    color: "blue",
  },
  "senegal-entrepreneurship": {
    title: "Senegal Digital Entrepreneurship",
    shortTitle: "Digital Entrepreneurship",
    description: "A practical path from computer basics to a credible online business presence and safer digital operations.",
    eyebrow: "Senegal program",
    color: "violet",
  },
  "personal-brand": {
    title: "Managing a Personal Brand",
    shortTitle: "Personal Brand",
    description: "Build a trustworthy professional presence with modern productivity, automation, coding, and AI skills.",
    eyebrow: "Career pathway",
    color: "coral",
  },
  "digital-literacy": {
    title: "Digital Literacy",
    shortTitle: "Digital Literacy",
    description: "Foundational web, file, research, and programming skills for first-time digital learners.",
    eyebrow: "Start here",
    color: "green",
  },
  "intermediate-python": {
    title: "Intermediate Python",
    shortTitle: "Intermediate Python",
    description: "Files, APIs, object-oriented programming, and a complete data-backed console capstone.",
    eyebrow: "Build real programs",
    color: "gold",
  },
  "machine-learning": {
    title: "Machine Learning with Python",
    shortTitle: "Machine Learning",
    description: "EDA, regression, classification, neural networks, and careful model tuning through real examples.",
    eyebrow: "Data & AI",
    color: "teal",
  },
  "data-and-design": {
    title: "Database Management & Graphic Design",
    shortTitle: "Data & Design",
    description: "Current lectures from the program’s dual-track work in data architecture and visual communication.",
    eyebrow: "New dual track",
    color: "indigo",
  },
};

function normalizeLesson(fileName) {
  const fullPath = path.join(CONTENT_DIRECTORY, fileName);
  const source = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(source);
  return {
    ...data,
    slug: data.slug || fileName.replace(/\.md$/, ""),
    week: Number(data.week || 1),
    duration: Number(data.duration || 60),
    objectives: Array.isArray(data.objectives) ? data.objectives : [],
    keyIdeas: Array.isArray(data.keyIdeas) ? data.keyIdeas : [],
    flashcards: Array.isArray(data.flashcards) ? data.flashcards : [],
    quiz: Array.isArray(data.quiz) ? data.quiz : [],
    content,
  };
}

export function getAllLessons() {
  if (!fs.existsSync(CONTENT_DIRECTORY)) return [];
  return fs
    .readdirSync(CONTENT_DIRECTORY)
    .filter((file) => file.endsWith(".md"))
    .map(normalizeLesson)
    .sort((a, b) => {
      if (a.trackSlug !== b.trackSlug) return a.trackSlug.localeCompare(b.trackSlug);
      return a.week - b.week;
    });
}

export function getLessonBySlug(slug) {
  return getAllLessons().find((lesson) => lesson.slug === slug) || null;
}

export function getTracks() {
  const grouped = new Map();
  for (const lesson of getAllLessons()) {
    if (!grouped.has(lesson.trackSlug)) grouped.set(lesson.trackSlug, []);
    grouped.get(lesson.trackSlug).push(lesson);
  }
  return Array.from(grouped.entries()).map(([slug, lessons]) => ({
    slug,
    ...(TRACK_META[slug] || {
      title: lessons[0]?.track || slug,
      shortTitle: lessons[0]?.track || slug,
      description: "A Patchwork learning track.",
      eyebrow: "Learning track",
      color: "blue",
    }),
    lessons,
    count: lessons.length,
    totalMinutes: lessons.reduce((total, lesson) => total + lesson.duration, 0),
  }));
}

export function getTrackBySlug(slug) {
  return getTracks().find((track) => track.slug === slug) || null;
}

export function getAdjacentLessons(slug) {
  const lessons = getAllLessons();
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  return {
    previous: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}
