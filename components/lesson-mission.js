"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recordProjectProgress, useLessonProgress } from "@/lib/progress-store";

const MINIMUM_EVIDENCE_LENGTH = 20;

function storageKey(lessonSlug) {
  return `binarytree-mission:${lessonSlug}:v1`;
}

export function LessonMission({ lessonSlug, mission, project = null, standalone = false }) {
  const progress = useLessonProgress(lessonSlug);
  const [responses, setResponses] = useState({});
  const [completedIds, setCompletedIds] = useState([]);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey(lessonSlug)) || "{}");
        setResponses(saved.responses && typeof saved.responses === "object" ? saved.responses : {});
        setCompletedIds(Array.isArray(saved.completedIds) ? saved.completedIds : []);
      } catch {}
      setLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [lessonSlug]);

  useEffect(() => {
    if (project || !loaded) return undefined;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(storageKey(lessonSlug), JSON.stringify({ responses, completedIds, updatedAt: new Date().toISOString() }));
      } catch {}
    }, 250);
    return () => clearTimeout(timeout);
  }, [completedIds, lessonSlug, loaded, project, responses]);

  useEffect(() => {
    if (project || !loaded) return;
    recordProjectProgress(lessonSlug, completedIds, mission.steps.length);
  }, [completedIds, lessonSlug, loaded, mission.steps.length, project]);

  const completedCount = project ? progress.project.passedCheckIds.length : completedIds.length;
  const totalCount = project ? project.tests.length : mission.steps.length;
  const percent = totalCount ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  function updateResponse(stepId, value) {
    setResponses((current) => ({ ...current, [stepId]: value }));
    setCompletedIds((current) => current.filter((id) => id !== stepId));
    setMessage("Draft saved on this device.");
  }

  function verifyStep(step) {
    const value = String(responses[step.id] || "").trim();
    if (value.length < MINIMUM_EVIDENCE_LENGTH) {
      setMessage(`Add a specific response for “${step.title}” before checking it.`);
      return;
    }
    const next = [...new Set([...completedIds, step.id])];
    setCompletedIds(next);

    setMessage(next.length === mission.steps.length ? "Project evidence complete. Use the checklist once more before finishing the lesson." : `${step.title} checked. Continue to the next project phase.`);
  }

  return (
    <section className={`lesson-mission ${standalone ? "is-standalone" : ""}`} id="practice" aria-labelledby={`mission-title-${lessonSlug}`} data-reveal>
      <header className="lesson-mission-header">
        <div>
          <p className="eyebrow">Lesson project · {mission.format}</p>
          <h2 id={`mission-title-${lessonSlug}`}>{mission.title}</h2>
          <p>{mission.deliverable}</p>
        </div>
        <div className="mission-progress" aria-label={`${completedCount} of ${totalCount} project checks complete`}>
          <strong>{percent}%</strong><span>{completedCount} of {totalCount} checks</span>
          <div><i style={{ width: `${percent}%` }} /></div>
        </div>
      </header>

      {project ? (
        <div className="mission-code-layout">
          <div>
            <span className="mission-label">Your brief</span>
            <p>{mission.brief}</p>
            <ol className="mission-phase-list">{mission.steps.map((step, index) => <li key={step.id}><span>{index + 1}</span><div><strong>{step.title}</strong><p>{step.prompt}</p></div></li>)}</ol>
          </div>
          <aside>
            <span className="mission-label">Definition of done</span>
            <ul>{project.tests.map((test) => <li key={test.id}>{test.title}</li>)}</ul>
            <Link className="button button-primary" href={`/lab/${lessonSlug}`}>Open this project →</Link>
            <small>Your draft, test results, and progress save on this device.</small>
          </aside>
        </div>
      ) : (
        <div className="mission-workbook">
          <div className="mission-workbook-main">
            {mission.steps.map((step, index) => {
              const checked = completedIds.includes(step.id);
              return (
                <article className={checked ? "is-checked" : ""} key={step.id}>
                  <div className="mission-step-heading"><span>{checked ? "✓" : index + 1}</span><div><small>Project phase {index + 1}</small><h3>{step.title}</h3></div></div>
                  <p>{step.prompt}</p>
                  <label htmlFor={`${lessonSlug}-${step.id}`}>Your evidence</label>
                  <textarea id={`${lessonSlug}-${step.id}`} rows="5" value={responses[step.id] || ""} onChange={(event) => updateResponse(step.id, event.target.value)} placeholder="Write the decision you made, what you created, and evidence that it works…" />
                  <button className={`button ${checked ? "button-secondary" : "button-primary"} button-small`} type="button" onClick={() => verifyStep(step)}>{checked ? "Checked — edit to revise" : "Check this phase"}</button>
                </article>
              );
            })}
            {message && <p className="mission-save-message" role="status">{message}</p>}
          </div>
          <aside className="mission-review-card">
            <span className="mission-label">Definition of done</span>
            <ul>{mission.criteria.map((criterion) => <li key={criterion.title}><strong>{criterion.title}</strong><span>{criterion.description}</span></li>)}</ul>
            <div className="mission-reflection"><strong>Final reflection</strong><p>{mission.reflection}</p></div>
            <div className="mission-privacy-note"><strong>Your writing stays private.</strong><p>This workbook saves only on this device. Use the checklist to review your evidence before marking each phase complete.</p></div>
          </aside>
        </div>
      )}
    </section>
  );
}
