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
const makeDefinitionQuestions = (lesson) => lesson.topics.slice(0, 3).map((topic, index) => {
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

const makeFlashcards = (lesson) => {
  const [first, second, third] = lesson.topics;
  return [
    ...lesson.topics.slice(0, 3).map((topic) => ({ front: topic.term, back: topic.definition })),
    { front: "Why this lesson matters", back: lesson.summary },
    { front: "Practice challenge", back: lesson.activity },
    { front: "Teach it back", back: `Explain ${first.term}, show how ${second.term} is used, and describe why ${third.term} changes the result.` },
  ];
};

const makeQuiz = (lesson) => {
  const [first, second, third] = lesson.topics;
  return [
    ...makeDefinitionQuestions(lesson),
    {
      question: `Which action best applies ${second.term} in this lesson?`,
      choices: [lesson.activity, "Skip the goal and begin clicking until something changes.", "Copy another learner’s result without explaining the steps.", "Memorize the term but avoid using it in a realistic task."],
      answer: 0,
      explanation: `The guided practice applies ${second.term} through a concrete task: ${lesson.activity}`,
    },
    {
      question: `How do ${first.term} and ${third.term} work together?`,
      choices: [
        "They are unrelated terms that should be studied separately.",
        `${third.term} replaces the need to understand ${first.term}.`,
        `${first.term} gives you a foundation, while ${third.term} helps you make a safer or more effective decision during the task.`,
        "They only matter when every learner has a separate computer.",
      ],
      answer: 2,
      explanation: `Connecting ${first.term} with ${third.term} turns a definition into a decision you can explain and check.`,
    },
    {
      question: "What is the strongest evidence that you understood this lesson?",
      choices: [
        "Reading the title once and moving on.",
        "Completing the practice, comparing the result with your prediction, and explaining one improvement.",
        "Finishing before everyone else without checking the result.",
        "Remembering one word but not being able to use it.",
      ],
      answer: 1,
      explanation: "Real understanding combines action, checking, explanation, and reflection—not speed or memorization alone.",
    },
  ];
};

function renderLesson(lesson) {
  const objectives = [
    `Explain ${lesson.topics[0].term} in your own words.`,
    `Apply ${lesson.topics[1].term} to a realistic classroom or community example.`,
    `Connect ${lesson.topics[0].term} with ${lesson.topics[2].term} when making a decision.`,
    `Complete the practice task and reflect on one improvement.`,
  ];
  const flashcards = makeFlashcards(lesson);
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
    .map((topic, index) => `### ${index + 1}. ${topic.term}\n\n${topic.definition}\n\n**In practice:** Look for this idea while you complete the lesson task. Pause before each major step and explain how ${topic.term} changes what you choose, create, or check.`)
    .join("\n\n");

  const [first, second, third] = lesson.topics;

  return `${frontmatter}\n\n## Why this lesson matters\n\n${lesson.summary}\n\nThe goal is not to memorize vocabulary. By the end of the lesson, you should be able to use the ideas in a realistic situation, explain the reason for your choices, and check whether the result actually works for the intended person or task.\n\n## Learning objectives\n\n${objectives.map((item) => `- ${item}`).join("\n")}\n\n## Core ideas\n\n${notes}\n\n## How the ideas connect\n\nStart with **${first.term}** to understand the foundation of the lesson. Use **${second.term}** to turn that understanding into an action. Then apply **${third.term}** to check the quality, safety, or usefulness of the result. The three ideas are strongest when you can explain their relationship rather than treating them as separate definitions.\n\n## Guided walkthrough\n\n1. **Name the goal.** In one sentence, write what you are trying to understand, create, or improve.\n2. **Make a prediction.** Before touching a device, use ${first.term} and ${second.term} to predict what a strong result should look like.\n3. **Complete the task.** ${lesson.activity}\n4. **Check the outcome.** Use ${third.term} to inspect the result. Ask what worked, what did not, and what evidence supports your judgment.\n5. **Explain and revise.** Tell a partner what you changed and why. Make one small improvement, then compare the new result with the first one.\n\n## Worked classroom scenario\n\nImagine two learners sharing one device. The first learner is the **driver** and performs the steps; the second is the **navigator** and reads the goal, predicts the next step, and checks the result. Halfway through the task, switch roles. Both learners should be able to explain how ${first.term}, ${second.term}, and ${third.term} appeared in the work.\n\nIf no device is available, complete the same reasoning on paper: sketch the screen or result, label each decision, and describe what you would test when a device becomes available.\n\n## Common mistakes and fixes\n\n- **Rushing into the tool:** Write the goal and prediction first so every click or step has a reason.\n- **Copying without understanding:** After each major step, explain it in your own words to a partner.\n- **Accepting the first result:** Compare the outcome with the goal and make at least one deliberate improvement.\n- **Letting one person control a shared device:** Rotate driver and navigator roles so both learners think and practice.\n\n## Independent practice\n\n${lesson.activity}\n\nFor an extra challenge, adapt the task for a different audience or community need. Write two sentences explaining what changed and which lesson idea guided your decision.\n\n## Check your understanding\n\n1. How would you explain ${first.term} to someone new to the topic?\n2. What is one realistic example of ${second.term} outside this classroom?\n3. When might ${third.term} prevent a weak, unsafe, or confusing result?\n4. How are ${first.term} and ${second.term} connected?\n5. What evidence would convince you that your practice result works?\n6. If you repeated the activity tomorrow, what would you improve first and why?\n\n## Key takeaway\n\n${lesson.summary}\n\nYou are ready to move on when you can explain the three core ideas, complete the practice without copying, and describe one improvement using evidence from your result.\n`;
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
