"use client";

import Link from "next/link";
import { useLessonProgress } from "@/lib/progress-store";

function stateLabel(done, current) {
  if (done) return "Done";
  if (current) return "Do this now";
  return "Next";
}

export function LessonRoute({ lessonSlug, hasVideo, quizTotal, projectTitle, nextLesson }) {
  const progress = useLessonProgress(lessonSlug);
  const projectStarted = progress.project.passedCheckIds.length > 0 || progress.project.complete;
  const learned = hasVideo ? progress.video.complete : (projectStarted || progress.quiz.answered > 0 || progress.completed);
  const built = progress.project.complete;
  const checked = quizTotal > 0 && progress.quiz.answered >= quizTotal;
  const finished = progress.completed;
  const currentId = !learned ? "learn" : !built ? "project" : !checked ? "check" : !finished ? "finish" : "continue";
  const steps = [
    { id: "learn", label: "Learn", title: hasVideo ? "Watch and work through the lecture" : "Read the lesson and examples", note: hasVideo ? "Use the chapter notebook and answer each video checkpoint." : "Understand the examples before beginning the project.", done: learned, href: hasVideo ? "#watch" : "#guide" },
    { id: "project", label: "Project", title: projectTitle, note: "Plan it, create it, then prove it meets the definition of done.", done: built, href: "#practice" },
    { id: "check", label: "Check", title: `Answer all ${quizTotal} questions`, note: "Correct weak spots using the explanation after each answer.", done: checked, href: "#study-tools" },
    { id: "finish", label: "Finish", title: "Mark the lesson complete", note: nextLesson ? `Then move to ${nextLesson.title}.` : "Finish the course and review your progress tree.", done: finished, href: "#complete" },
  ];
  const current = steps.find((step) => step.id === currentId) || steps[0];

  return (
    <section className="lesson-route" aria-labelledby="lesson-route-title" data-reveal>
      <header><div><p className="eyebrow">Four clear stages</p><h2 id="lesson-route-title">Learn → Project → Check → Finish</h2></div><a className="button button-primary button-small" href={current.href}>{finished ? "Lesson complete" : current.title} →</a></header>
      <ol>{steps.map((step, index) => { const isCurrent = step.id === currentId; return <li className={`${step.done ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`} key={step.id}><a href={step.href}><span>{step.done ? "✓" : index + 1}</span><em>{step.label}</em><strong>{step.title}</strong><small>{step.note}</small><b>{stateLabel(step.done, isCurrent)}</b></a></li>; })}</ol>
      {finished && nextLesson && <Link className="lesson-route-next" href={`/learn/${nextLesson.slug}`}>Continue to the next lesson: <strong>{nextLesson.title}</strong> →</Link>}
    </section>
  );
}
