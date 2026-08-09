const TARGET_COUNT = 30;

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = clean(item?.[key]).toLowerCase();
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function rotate(items, offset) {
  if (!items.length) return [];
  return items.map((_, index) => items[(index + offset) % items.length]);
}

function conceptBank(lesson) {
  const core = (lesson.keyIdeas || []).map((idea) => ({ term: clean(idea.term), definition: clean(idea.definition) }));
  const glossary = (lesson.video?.glossary || []).map((idea) => ({ term: clean(idea.term), definition: clean(idea.definition) }));
  return uniqueBy([...core, ...glossary], "term");
}

function makeChoices(correct, distractors, offset = 0) {
  const pool = uniqueBy([correct, ...rotate(distractors, offset)], "text").slice(0, 4);
  const fallback = [
    "A step that ignores the goal and skips checking the result.",
    "A decorative choice that does not affect the learner’s decision.",
    "A shortcut that copies an outcome without explaining the reasoning.",
    "An action unrelated to the lesson goal.",
  ];
  while (pool.length < 4) pool.push({ text: fallback[pool.length] });
  const answer = offset % 4;
  const choices = [...pool];
  const correctIndex = choices.findIndex((item) => item.text === correct.text);
  [choices[answer], choices[correctIndex]] = [choices[correctIndex], choices[answer]];
  return { choices: choices.map((item) => item.text), answer };
}

export function expandStudyMaterials(lesson) {
  const concepts = conceptBank(lesson);
  const activity = clean(lesson.activity);
  const summary = clean(lesson.summary);
  const objectives = (lesson.objectives || []).map(clean).filter(Boolean);
  const guide = (lesson.video?.guide || []).map((section) => ({
    title: clean(section.title),
    explanation: clean(section.paragraphs?.[0] || section.explanation || section.example || section.practice),
  })).filter((section) => section.title && section.explanation);

  const generatedCards = [];
  concepts.forEach((concept) => generatedCards.push(
    { front: concept.term, back: concept.definition },
    { front: `Explain ${concept.term} without using the term itself.`, back: concept.definition },
    { front: `How does ${concept.term} affect this lesson’s practice?`, back: `Use this idea while completing the task: ${activity}` },
    { front: `What evidence would show that ${concept.term} was applied well?`, back: `Connect this idea to a deliberate choice, check the result, and explain the evidence: ${concept.definition}` },
  ));
  objectives.forEach((objective, index) => generatedCards.push({
    front: `Learning goal ${index + 1}: what should you be able to demonstrate?`,
    back: objective,
  }));
  guide.forEach((section) => generatedCards.push({ front: `Lecture note: ${section.title}`, back: section.explanation }));
  generatedCards.push(
    { front: "Why does this lesson matter?", back: summary },
    { front: "What is the hands-on challenge?", back: activity },
    { front: "How should you check your work?", back: "Compare the result with the original goal, test a realistic case, explain what worked, and revise one weak point." },
    { front: "What does it mean to teach this lesson back?", back: "Explain the main ideas in your own words, show where they appear in the practice, and defend one choice with evidence." },
  );

  const flashcards = uniqueBy([...(lesson.flashcards || []), ...generatedCards], "front").slice(0, TARGET_COUNT);
  let filler = 1;
  while (flashcards.length < TARGET_COUNT) {
    flashcards.push({
      front: `Reflection ${filler}: what would you improve if you repeated the lesson task?`,
      back: `Choose one specific part of “${activity}” and explain a change using evidence from the result, not just personal preference.`,
    });
    filler += 1;
  }

  const generatedQuiz = [];
  const conceptDistractors = concepts.map((concept) => ({ text: concept.definition }));
  concepts.forEach((concept, index) => {
    generatedQuiz.push({
      question: `Which description best matches “${concept.term}”?`,
      ...makeChoices({ text: concept.definition }, conceptDistractors.filter((item) => item.text !== concept.definition), index),
      explanation: `${concept.term}: ${concept.definition}`,
    });
    generatedQuiz.push({
      question: `Which action best demonstrates “${concept.term}” during this lesson?`,
      ...makeChoices(
        { text: `Use ${concept.term} to make a deliberate choice, test the result, and explain the evidence.` },
        [
          { text: "Copy the first example without checking whether it fits the goal." },
          { text: "Skip the practice and memorize only the vocabulary." },
          { text: "Choose whatever looks fastest and avoid explaining the decision." },
        ],
        index + 1,
      ),
      explanation: `Understanding is visible when ${concept.term} shapes a choice and the learner checks the result against the lesson goal.`,
    });
  });
  objectives.forEach((objective, index) => generatedQuiz.push({
    question: `What is the strongest evidence for learning goal ${index + 1}?`,
    ...makeChoices(
      { text: `Complete a realistic task and explain evidence that demonstrates: ${objective}` },
      [{ text: "Read the title once and move on." }, { text: "Copy a finished answer without describing the decisions." }, { text: "Finish quickly without testing or reflecting." }],
      index + 2,
    ),
    explanation: `The goal asks you to demonstrate: ${objective}`,
  }));
  guide.forEach((section, index) => generatedQuiz.push({
    question: `What is the main point of the lecture section “${section.title}”?`,
    ...makeChoices(
      { text: section.explanation },
      guide.filter((item) => item.title !== section.title).map((item) => ({ text: item.explanation })),
      index + 3,
    ),
    explanation: section.explanation,
  }));
  generatedQuiz.push({
    question: "What is the strongest way to finish the hands-on challenge?",
    choices: ["Submit the first attempt without testing.", "Compare the result with the goal, test it, explain one decision, and revise.", "Copy another learner’s answer.", "Memorize the instructions without doing the task."],
    answer: 1,
    explanation: `The practice is “${activity}”. Completion includes testing, explanation, and one evidence-based revision.`,
  });

  const quiz = uniqueBy([...(lesson.quiz || []), ...generatedQuiz], "question").slice(0, TARGET_COUNT);
  let quizFiller = 1;
  while (quiz.length < TARGET_COUNT) {
    const primary = concepts[(quizFiller - 1) % Math.max(1, concepts.length)] || { term: "the lesson goal", definition: summary };
    quiz.push({
      question: `Scenario ${quizFiller}: which learning process produces the strongest evidence?`,
      ...makeChoices(
        { text: `Use ${primary.term}, complete the task, test a realistic case, and explain one revision.` },
        [{ text: "Use more decoration without checking the goal." }, { text: "Repeat the definition but avoid the practical task." }, { text: "Assume the first attempt works without gathering evidence." }],
        quizFiller,
      ),
      explanation: `Strong evidence combines “${primary.term}” with practice, checking, explanation, and revision.`,
    });
    quizFiller += 1;
  }

  return { flashcards, quiz };
}