import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const directory = path.join(process.cwd(), "content", "lessons");
const files = (await readdir(directory)).filter((file) => file.endsWith(".md"));
const errors = [];
const slugs = new Set();

for (const file of files) {
  const source = await readFile(path.join(directory, file), "utf8");
  const { data, content } = matter(source);
  const required = ["slug", "title", "track", "trackSlug", "summary", "summarySw", "summaryFr", "sourceUrl", "activity"];
  for (const key of required) if (!data[key]) errors.push(`${file}: missing ${key}`);
  if (slugs.has(data.slug)) errors.push(`${file}: duplicate slug ${data.slug}`);
  slugs.add(data.slug);
  if (!String(data.sourceUrl || "").startsWith("https://docs.google.com/")) errors.push(`${file}: invalid Drive source URL`);
  if (!Array.isArray(data.keyIdeas) || data.keyIdeas.length < 3) errors.push(`${file}: needs at least 3 key ideas`);
  if (!Array.isArray(data.flashcards) || data.flashcards.length < 3) errors.push(`${file}: needs at least 3 flashcards`);
  if (!Array.isArray(data.quiz) || data.quiz.length < 3) errors.push(`${file}: needs at least 3 quiz questions`);
  if (!content.includes("Muhtasari wa Kiswahili") || !content.includes("Résumé français")) errors.push(`${file}: localized draft sections missing`);
}

if (files.length !== 42) errors.push(`expected 42 distinct current lessons, found ${files.length}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${files.length} lessons: unique slugs, Drive sources, trilingual summaries, flashcards, and quizzes.`);
