"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { formatDuration } from "@/lib/format";
import { lessonProgressPercent, trackProgressPercent, useProgressSnapshot } from "@/lib/progress-store";

function subscribeToUrl(onChange) { window.addEventListener("popstate", onChange); return () => window.removeEventListener("popstate", onChange); }
function getTrackFromUrl() { return new URLSearchParams(window.location.search).get("track") || "all"; }
function SearchIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>; }

function CompactCourseCard({ track, progress }) {
  const percent = trackProgressPercent(track, progress);
  const nextLesson = track.lessons.find((lesson) => lessonProgressPercent(lesson, progress) < 100) || track.lessons[track.lessons.length - 1];
  return (
    <article className="compact-course-card" id={track.slug}>
      <div className="compact-course-top"><div><span>{track.eyebrow}</span><h2>{track.title}</h2></div><strong>{percent}%</strong></div>
      <p>{track.description}</p>
      <div className="compact-course-meter"><span style={{ width: `${percent}%` }} /></div>
      <div className="compact-course-next"><span><small>{percent ? "Continue with" : "Begin with"}</small><strong>{nextLesson.title}</strong></span><Link className="button button-primary button-small" href={`/learn/${nextLesson.slug}`}>{percent ? "Continue" : "Start"} →</Link></div>
      <details><summary>See all {track.count} lessons <span>{formatDuration(track.totalMinutes)}</span></summary><ol>{track.lessons.map((lesson) => <li key={lesson.slug}><Link href={`/learn/${lesson.slug}`}><span>{lesson.week}. {lesson.title}</span><em>{lessonProgressPercent(lesson, progress)}%</em></Link></li>)}</ol></details>
    </article>
  );
}

export function CurriculumCatalog({ tracks, initialTrack = "all" }) {
  const requested = useSyncExternalStore(subscribeToUrl, getTrackFromUrl, () => initialTrack);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [aiResults, setAiResults] = useState([]);
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const progress = useProgressSnapshot();
  const active = selected ?? (requested === "all" || tracks.some((track) => track.slug === requested) ? requested : "all");
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tracks.filter((track) => (active === "all" || track.slug === active) && (!term || [track.title, track.description, ...track.lessons.flatMap((lesson) => [lesson.title, lesson.summary])].join(" ").toLowerCase().includes(term)));
  }, [active, query, tracks]);

  function chooseTrack(value) {
    setSelected(value);
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("track"); else url.searchParams.set("track", value);
    window.history.replaceState({}, "", url);
  }

  async function askAI() {
    if (query.trim().length < 3 || aiLoading) return;
    setAiLoading(true); setAiResults([]); setAiMessage("Matching your goal to the curriculum…");
    try {
      const response = await fetch("/api/ai/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: query.trim() }) });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.recommendations)) throw new Error("unavailable");
      setAiResults(data.recommendations); setAiMessage(data.offline ? "These are the closest offline matches." : "Here are three grounded matches.");
    } catch {
      const matches = tracks.flatMap((track) => track.lessons.map((lesson) => ({ slug: lesson.slug, title: lesson.title, track: track.shortTitle, reason: lesson.summary }))).filter((item) => [item.title,item.reason].join(" ").toLowerCase().includes(query.trim().toLowerCase())).slice(0,3);
      setAiResults(matches); setAiMessage(matches.length ? "These are the closest offline matches." : "Try a broader topic.");
    } finally { setAiLoading(false); }
  }

  return (
    <div className="catalog-shell compact-catalog-shell"><div className="container">
      <section className="treepath-library-callout"><div><p className="eyebrow">Need an ordered plan?</p><h2>Use TreePath—not the course library.</h2><p>TreePath checks prerequisites and shows one unlocked next step. This page is for finding a specific subject.</p></div><Link className="button button-primary" href="/tree-path">Open TreePath →</Link></section>
      <section className="compact-discovery" aria-labelledby="course-search-title"><div><p className="eyebrow">Course library</p><h2 id="course-search-title">Find a specific course or lesson.</h2></div><div className="compact-toolbar"><label className="search-field"><span className="sr-only">Search courses</span><SearchIcon /><input value={query} onChange={(event) => { setQuery(event.target.value); setAiResults([]); setAiMessage(""); }} placeholder="Try Python, spreadsheets, or design" /></label><button className="button button-secondary" type="button" disabled={aiLoading || query.trim().length < 3} onClick={askAI}>{aiLoading ? "Matching…" : "Ask AI"}</button><label><span>Course</span><select value={active} onChange={(event) => chooseTrack(event.target.value)}><option value="all">All courses</option>{tracks.map((track) => <option value={track.slug} key={track.slug}>{track.shortTitle}</option>)}</select></label></div></section>
      {(aiMessage || aiResults.length > 0) && <section className="ai-search-guide" aria-live="polite"><div className="ai-search-guide-heading"><span aria-hidden="true">✦</span><div><strong>AI course guide</strong><p>{aiMessage}</p></div></div>{aiResults.length > 0 && <div className="ai-search-results">{aiResults.map((item,index) => <Link href={`/learn/${item.slug}`} key={item.slug}><span>{index+1}</span><div><small>{item.track}</small><strong>{item.title}</strong><p>{item.reason}</p></div><span aria-hidden="true">→</span></Link>)}</div>}</section>}
      <p className="compact-result-count">{visible.length} {visible.length === 1 ? "course" : "courses"} shown</p>
      {visible.length ? <div className="compact-course-grid">{visible.map((track) => <CompactCourseCard track={track} progress={progress} key={track.slug} />)}</div> : <div className="empty-state"><strong>No matching courses.</strong><p>Try a broader topic or ask the AI guide.</p></div>}
    </div></div>
  );
}
