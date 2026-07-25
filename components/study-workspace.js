"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StudyCompanion } from "./study-companion";

export function StudyWorkspace({ lessons }) {
  const [selectedSlug, setSelectedSlug] = useState(lessons[0]?.slug || "");
  const lesson = useMemo(() => lessons.find((item) => item.slug === selectedSlug) || lessons[0], [lessons, selectedSlug]);
  if (!lesson) return null;

  return (
    <div className="study-page-grid">
      <aside className="study-library">
        <p className="eyebrow">Focused study</p>
        <h2>Choose a lesson</h2>
        <p>The companion changes its context, flashcards, and quiz to match your selection.</p>
        <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} aria-label="Selected lesson">
          {lessons.map((item) => <option value={item.slug} key={item.slug}>{item.track} · W{item.week}: {item.title}</option>)}
        </select>
        <div className="source-card" style={{ marginTop: 18 }}>
          <strong>{lesson.title}</strong>
          <p>{lesson.summary}</p>
          <Link href={`/learn/${lesson.slug}`}>Read full lesson →</Link>
        </div>
      </aside>
      <div className="study-page-panel">
        <StudyCompanion lesson={lesson} expanded />
      </div>
    </div>
  );
}
