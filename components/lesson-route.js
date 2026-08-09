"use client";

import Link from "next/link";
import { useLessonProgress } from "@/lib/progress-store";

function stateLabel(done, current) {
  if (done) return "Done";
  if (current) return "Do this now";
  return "Later";
}

export function LessonRoute({ lessonSlug, hasVideo, hasProject, quizTotal, guideSections, nextLesson }) {
  const progress = useLessonProgress(lessonSlug);
  const watched = !hasVideo || progress.video.complete;
  const projectStarted = progress.project.passedCheckIds.length > 0 || progress.project.complete;
  const practiced = !hasProject || progress.project.complete;
  const checked = quizTotal > 0 && progress.quiz.answered >= quizTotal;
  const finished = progress.completed;
  const learned = projectStarted || progress.quiz.answered > 0 || finished;

  let currentId = hasVideo && !watched ? "watch" : "learn";
  if (learned && hasProject && !practiced) currentId = "practice";
  else if (learned && practiced && !checked) currentId = "check";
  else if (checked && !finished) currentId = "finish";
  else if (finished) currentId = "continue";

  const steps = [
    { id: "watch", label: hasVideo ? "Watch the interactive lecture" : "Preview the lesson goal", note: hasVideo ? "Pause for the three thinking checks." : "Know what you will be able to do.", done: watched, href: "#watch", hidden: !hasVideo },
    { id: "learn", label: `Read the ${guideSections || "complete"} teaching sections`, note: "Use the examples, vocabulary, and misconception fixes.", done: learned, href: "#guide" },
    { id: "practice", label: hasProject ? "Complete the Code Lab project" : "Complete the guided practice", note: hasProject ? "Build it, run the checks, then improve it." : "Make something that proves the skill.", done: practiced, href: "#practice" },
    { id: "check", label: `Answer all ${quizTotal} lesson questions`, note: "Use feedback to correct the weak spots.", done: checked, href: "#study-tools" },
    { id: "finish", label: "Mark the lesson complete", note: nextLesson ? `Then continue to ${nextLesson.title}.` : "You have reached the end of this course.", done: finished, href: "#complete" },
  ].filter((step) => !step.hidden);

  const current = steps.find((step) => step.id === currentId) || steps[0];

  return (
    <section className="lesson-route" aria-labelledby="lesson-route-title" data-reveal>
      <header><div><p className="eyebrow">Your lesson route</p><h2 id="lesson-route-title">Do these steps in order.</h2></div><a className="button button-primary button-small" href={current.href}>{currentId === "continue" ? "Lesson complete" : current.label} →</a></header>
      <ol>
        {steps.map((step, index) => {
          const isCurrent = step.id === currentId;
          return <li className={`${step.done ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`} key={step.id}><a href={step.href}><span>{step.done ? "✓" : index + 1}</span><strong>{step.label}</strong><small>{step.note}</small><em>{stateLabel(step.done, isCurrent)}</em></a></li>;
        })}
      </ol>
      {finished && nextLesson && <Link className="lesson-route-next" href={`/learn/${nextLesson.slug}`}>Continue to the next lesson: <strong>{nextLesson.title}</strong> →</Link>}
    </section>
  );
}