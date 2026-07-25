import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { professionalLessons } from "./sources/professional.mjs";
import { senegalLessons } from "./sources/senegal.mjs";
import { brandLessons } from "./sources/personal-brand.mjs";
import { digitalLessons } from "./sources/digital-literacy.mjs";
import { pythonLessons } from "./sources/intermediate-python.mjs";
import { machineLearningLessons } from "./sources/machine-learning.mjs";
import { designDataLessons } from "./sources/design-data.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const destination = path.join(here, "..", "content", "lessons");
const lessons = [
  ...professionalLessons,
  ...senegalLessons,
  ...brandLessons,
  ...digitalLessons,
  ...pythonLessons,
  ...machineLearningLessons,
  ...designDataLessons,
];

const toYaml = (value) => JSON.stringify(value);
const makeQuiz = (lesson) => lesson.topics.map((topic, index) => {
  const otherDefinitions = lesson.topics
    .filter((_, otherIndex) => otherIndex !== index)
    .map((item) => item.definition);
  const fallback = [
    "A decorative feature with no effect on the task",
    "A tool that should be used without checking its result",
  ];
  const choices = [topic.definition, ...otherDefinitions, ...fallback].slice(0, 4);
  const shift = index % choices.length;
  const rotated = [...choices.slice(shift), ...choices.slice(0, shift)];
  return {
    question: `Which explanation best describes ${topic.term}?`,
    choices: rotated,
    answer: rotated.indexOf(topic.definition),
    explanation: topic.definition,
  };
});

function renderLesson(lesson) {
  const objectives = [
    `Explain ${lesson.topics[0].term} in your own words.`,
    `Apply ${lesson.topics[1].term} to a realistic classroom or community example.`,
    `Complete the practice task and reflect on one improvement.`,
  ];
  const flashcards = lesson.topics.map((topic) => ({ front: topic.term, back: topic.definition }));
  const quiz = makeQuiz(lesson);
  const frontmatter = [
    "---",
    `slug: ${toYaml(lesson.slug)}`,
    `title: ${toYaml(lesson.title)}`,
    `track: ${toYaml(lesson.track)}`,
    `trackSlug: ${toYaml(lesson.trackSlug)}`,
    `week: ${lesson.week}`,
    `level: ${toYaml(lesson.level || "Beginner")}`,
    `duration: ${lesson.duration || 60}`,
    `sourceUrl: ${toYaml(lesson.sourceUrl)}`,
    `summary: ${toYaml(lesson.summary)}`,
    `summarySw: ${toYaml(lesson.summarySw)}`,
    `summaryFr: ${toYaml(lesson.summaryFr)}`,
    `activity: ${toYaml(lesson.activity)}`,
    `objectives: ${toYaml(objectives)}`,
    `keyIdeas: ${toYaml(lesson.topics)}`,
    `flashcards: ${toYaml(flashcards)}`,
    `quiz: ${toYaml(quiz)}`,
    `translationStatus: ${toYaml("Draft — native speaker review required")}`,
    "---",
  ].join("\n");

  const notes = lesson.topics
    .map((topic, index) => `### ${index + 1}. ${topic.term}\n\n${topic.definition}`)
    .join("\n\n");

  return `${frontmatter}\n\n# ${lesson.title}\n\n> ${lesson.summary}\n\n## Learning objectives\n\n${objectives.map((item) => `- ${item}`).join("\n")}\n\n## Lesson notes\n\n${notes}\n\n## Guided practice\n\n${lesson.activity}\n\nWork in pairs when devices are shared. Write your prediction before using a device, then compare the result with what actually happened.\n\n## Check your understanding\n\n- What is the most important idea from this lesson?\n- Where could you use it at school, at work, or in your community?\n- What would you teach to someone seeing this topic for the first time?\n\n## Muhtasari wa Kiswahili — rasimu\n\n${lesson.summarySw}\n\n> Rasimu hii inahitaji mapitio ya mzungumzaji asilia kabla ya kuchapishwa rasmi.\n\n## Résumé français — brouillon\n\n${lesson.summaryFr}\n\n> Cette traduction doit être relue par une personne francophone avant publication officielle.\n`;
}

await mkdir(destination, { recursive: true });
for (const file of await readdir(destination)) {
  if (file.endsWith(".md")) await unlink(path.join(destination, file));
}
for (const lesson of lessons) {
  await writeFile(path.join(destination, `${lesson.slug}.md`), renderLesson(lesson), "utf8");
}
await writeFile(path.join(here, "..", "public", "offline-lessons.json"), JSON.stringify(lessons.map((lesson) => `/learn/${lesson.slug}`), null, 2), "utf8");
console.log(`Generated ${lessons.length} curriculum lessons.`);
