const YOUTUBE_CHANNEL = "https://www.youtube.com/@binarytree-t8z";

export const check = (id, time, prompt, choices, answer, explanation) => ({
  id,
  time,
  prompt,
  choices,
  answer,
  explanation,
});

export const unit = (time, title, idea, method, example, practice, checklist = []) => ({
  time,
  title,
  idea,
  method,
  example,
  practice,
  checklist,
});

export const vocab = (name, definition) => ({ term: name, definition });
export const correction = (myth, reality) => ({ myth, reality });

export function reviewedLecture({
  youtubeId,
  title,
  publishedAt,
  durationSeconds,
  learningPromise,
  chapters,
  checkpoints,
  guideIntroduction,
  units,
  glossary,
  misconceptions,
  transferChallenge,
  projectId = null,
}) {
  return {
    youtubeId,
    title,
    publishedAt,
    durationSeconds,
    durationLabel: `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")}`,
    channelUrl: YOUTUBE_CHANNEL,
    watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    learningPromise,
    chapters: chapters.map(([time, chapterTitle]) => ({ time, title: chapterTitle })),
    checkpoints,
    guideIntroduction,
    guide: units.map((item) => ({
      time: item.time,
      title: item.title,
      paragraphs: [item.idea, item.method],
      example: { label: "Worked example", text: item.example },
      practice: item.practice,
      checklist: item.checklist,
    })),
    glossary,
    misconceptions,
    transferChallenge,
    projectId,
    references: [],
    sourceNote: "Reviewed against the public lecture with timestamped slide sampling across the full runtime and cross-checked against the source lesson context.",
  };
}
