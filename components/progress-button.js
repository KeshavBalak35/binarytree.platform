"use client";

import { toggleLessonComplete, useLessonProgress } from "@/lib/progress-store";

export function ProgressButton({ lessonSlug }) {
  const progress = useLessonProgress(lessonSlug);
  return (
    <button type="button" className={`progress-button ${progress.completed ? "is-complete" : ""}`} onClick={() => toggleLessonComplete(lessonSlug)}>
      {progress.completed ? "✓ Lesson complete" : "Mark lesson complete"}
    </button>
  );
}