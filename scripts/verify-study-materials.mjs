import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { expandStudyMaterials } from "../lib/study-materials.js";
import { getVideoCurriculum } from "../lib/video-curriculum.js";

const directory = path.join(process.cwd(), "content", "lessons");
const rows = fs.readdirSync(directory).filter((file) => file.endsWith(".md")).map((file) => {
  const parsed = matter(fs.readFileSync(path.join(directory, file), "utf8")).data;
  const lesson = { ...parsed, video: getVideoCurriculum(parsed.slug) };
  const study = expandStudyMaterials(lesson);
  const uniqueCards = new Set(study.flashcards.map((item) => item.front.toLowerCase())).size;
  const uniqueQuestions = new Set(study.quiz.map((item) => item.question.toLowerCase())).size;
  if (study.flashcards.length !== 30 || study.quiz.length !== 30 || uniqueCards !== 30 || uniqueQuestions !== 30) {
    throw new Error(parsed.slug + " has invalid study material counts");
  }
  return { slug: parsed.slug, flashcards: study.flashcards.length, questions: study.quiz.length };
});
console.log("Verified " + rows.length + " lessons with 30 unique flashcards and 30 unique questions each.");