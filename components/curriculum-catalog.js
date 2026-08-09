"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { formatDuration } from "@/lib/format";
import { lessonProgressPercent, trackProgressPercent, useProgressSnapshot } from "@/lib/progress-store";

const FEATURED_TRACKS = ["professional-foundations", "senegal-entrepreneurship"];
const RECENT_VIDEO_TRACKS = ["digital-literacy", "personal-brand", "intermediate-python", "machine-learning"];

function subscribeToUrl(onStoreChange) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getTrackFromUrl() {
  return new URLSearchParams(window.location.search).get("track") || "all";
}

function SearchIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>;
}

function CoursePathCard({ track, progressState, featured = false, expanded = false, onOpen }) {
  const percent = trackProgressPercent(track, progressState);
  const nextLesson = track.lessons.find((lesson) => lessonProgressPercent(lesson, progressState) < 100) || track.lessons[track.lessons.length - 1];
  const videoLessons = track.lessons.filter((lesson) => lesson.video).length;
  const videoMinutes = Math.round(track.lessons.reduce((total, lesson) => total + (lesson.video?.durationSeconds || 0), 0) / 60);
  const projects = track.lessons.filter((lesson) => lesson.project).length;
  const visibleLessons = expanded ? track.lessons : track.lessons.slice(0, featured ? 4 : 3);

  return (
    <article className={`course-path-card course-path-${track.color} ${featured ? "is-featured" : ""} ${expanded ? "is-expanded" : ""}`} id={track.slug}>
      <header className="course-path-header">
        <div className="course-path-title">
          <span className="course-card-eyebrow">{track.eyebrow}</span>
          <h2>{track.title}</h2>
          <p>{track.description}</p>
        </div>
        <div className="course-path-progress" aria-label={`${percent}% of ${track.title} complete`}>
          <strong>{percent}%</strong><span>complete</span><i><b style={{ width: `${percent}%` }} /></i>
        </div>
      </header>

      <div className="course-path-facts" aria-label="Course details">
        <span><strong>{track.count}</strong> ordered lessons</span>
        <span><strong>{videoLessons}</strong> embedded lectures</span>
        <span><strong>{formatDuration(track.totalMinutes)}</strong> guided study</span>
        <span><strong>{videoMinutes} min</strong> of video</span>
        {projects > 0 && <span><strong>{projects}</strong> code {projects === 1 ? "project" : "projects"}</span>}
      </div>

      <div className="course-path-next">
        <div><small>{percent > 0 ? "Your next lesson" : "Start with lesson 1"}</small><strong>{nextLesson.title}</strong><span>{nextLesson.video ? `${nextLesson.video.durationLabel} video · interactive checks` : formatDuration(nextLesson.duration)}</span></div>
        <Link className="button button-primary" href={`/learn/${nextLesson.slug}`}>{percent > 0 ? "Continue course" : "Start course"} →</Link>
      </div>

      <ol className="course-lesson-plan" aria-label={`${track.title} lesson plan`}>
        {visibleLessons.map((lesson) => {
          const lessonPercent = lessonProgressPercent(lesson, progressState);
          return (
            <li className={lesson.slug === nextLesson.slug ? "is-next" : ""} key={lesson.slug}>
              <Link className="lesson-row" href={`/learn/${lesson.slug}`}>
                <span className="lesson-number">{lesson.week}</span>
                <span className="lesson-row-content"><span className="lesson-row-label">Lesson {lesson.week} · {lesson.video ? "Video + practice" : "Guided lesson"}</span><h3>{lesson.title}</h3><p>{lesson.summary}</p></span>
                <span className="lesson-row-meta"><span>{lesson.video ? lesson.video.durationLabel : formatDuration(lesson.duration)}</span><em>{lessonPercent > 0 ? `${lessonPercent}%` : "Start"}</em><span className="lesson-row-arrow" aria-hidden="true">›</span></span>
              </Link>
            </li>
          );
        })}
      </ol>

      {!expanded && track.lessons.length > visibleLessons.length && <button className="course-plan-open" type="button" onClick={() => onOpen(track.slug)}>See all {track.count} lessons in order →</button>}
    </article>
  );
}

function CourseGroup({ eyebrow, title, description, tracks, progressState, featured = false, onOpen }) {
  if (!tracks.length) return null;
  return (
    <section className="course-group" aria-labelledby={`group-${eyebrow.replaceAll(" ", "-")}`}>
      <div className="course-group-heading"><div><p className="eyebrow">{eyebrow}</p><h2 id={`group-${eyebrow.replaceAll(" ", "-")}`}>{title}</h2></div><p>{description}</p></div>
      <div className={`course-path-grid ${featured ? "is-featured" : ""}`}>
        {tracks.map((track) => <CoursePathCard track={track} progressState={progressState} featured={featured} onOpen={onOpen} key={track.slug} />)}
      </div>
    </section>
  );
}

export function CurriculumCatalog({ tracks, initialTrack = "all" }) {
  const requestedTrack = useSyncExternalStore(subscribeToUrl, getTrackFromUrl, () => initialTrack);
  const validRequestedTrack = requestedTrack === "all" || tracks.some((track) => track.slug === requestedTrack) ? requestedTrack : "all";
  const [query, setQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const progressState = useProgressSnapshot();
  const activeTrack = selectedTrack ?? validRequestedTrack;

  function selectTrack(slug, scroll = false) {
    setSelectedTrack(slug);
    setQuery("");
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("track");
    else url.searchParams.set("track", slug);
    window.history.replaceState({}, "", url);
    if (scroll) window.setTimeout(() => document.getElementById("course-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function updateQuery(value) {
    setQuery(value);
    setAiResults([]);
    setAiMessage("");
  }

  const visibleTracks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tracks
      .filter((track) => activeTrack === "all" || track.slug === activeTrack)
      .map((track) => ({
        ...track,
        lessons: track.lessons.filter((lesson) => !normalized || [lesson.title, lesson.summary, track.title].join(" ").toLowerCase().includes(normalized)),
      }))
      .filter((track) => track.lessons.length > 0);
  }, [tracks, query, activeTrack]);

  const featuredTracks = FEATURED_TRACKS.map((slug) => tracks.find((track) => track.slug === slug)).filter(Boolean);
  const recentTracks = RECENT_VIDEO_TRACKS.map((slug) => tracks.find((track) => track.slug === slug)).filter(Boolean);
  const additionalTracks = tracks.filter((track) => !FEATURED_TRACKS.includes(track.slug) && !RECENT_VIDEO_TRACKS.includes(track.slug));
  const totalVideos = tracks.reduce((sum, track) => sum + track.lessons.filter((lesson) => lesson.video).length, 0);
  const visibleCount = visibleTracks.reduce((total, track) => total + track.lessons.length, 0);

  async function findWithAI() {
    const request = query.trim();
    if (request.length < 3 || aiLoading) return;
    setAiLoading(true);
    setAiResults([]);
    setAiMessage("The AI guide is matching your goal to the clearest starting lesson.");
    try {
      const response = await fetch("/api/ai/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: request }) });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.recommendations)) throw new Error("unavailable");
      setAiResults(data.recommendations);
      setAiMessage(data.offline ? "AI is busy, so these are the closest offline matches." : "Three grounded recommendations from the Binary Tree course guide.");
    } catch {
      const local = visibleTracks.flatMap((track) => track.lessons.map((lesson) => ({ slug: lesson.slug, title: lesson.title, summary: lesson.summary, track: track.shortTitle, reason: "A close match from the offline curriculum." }))).slice(0, 3);
      setAiResults(local);
      setAiMessage(local.length ? "AI is busy, so these are the closest offline matches." : "Try a broader skill or goal.");
    } finally { setAiLoading(false); }
  }

  return (
    <div className="catalog-shell">
      <div className="container catalog-layout">
        <section className="course-start-guide" aria-labelledby="course-start-title">
          <div><p className="eyebrow">How learning works</p><h2 id="course-start-title">One course. One lesson at a time.</h2><p>No guessing where to click next. Pick a course, follow its numbered lessons, and complete the same five-step routine each time.</p></div>
          <ol><li><span>1</span><strong>Choose a course</strong><small>Start with the path that matches your goal.</small></li><li><span>2</span><strong>Follow the order</strong><small>Every lesson tells you exactly what comes next.</small></li><li><span>3</span><strong>Build evidence</strong><small>Watch, learn, practice, check, then continue.</small></li></ol>
          <div className="course-audit-pill"><strong>{totalVideos} / {totalVideos}</strong><span>current public curriculum uploads, embedded in lessons</span></div>
        </section>

        <section className="catalog-discovery" aria-labelledby="find-course-title">
          <div className="catalog-discovery-heading"><div><p className="eyebrow">Find a specific skill</p><h2 id="find-course-title">Know what you want to learn?</h2></div>{activeTrack !== "all" && <button type="button" onClick={() => selectTrack("all")}>← Back to all courses</button>}</div>
          <div className="catalog-toolbar">
            <label className="search-field"><span className="sr-only">Search the curriculum</span><SearchIcon /><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Try Python, web research, or personal brand" /></label>
            <button className="button button-secondary catalog-ai-button" type="button" disabled={aiLoading || query.trim().length < 3} onClick={findWithAI}>{aiLoading ? "AI is looking…" : "Ask AI to match me"}</button>
            <label className="catalog-mobile-filter"><span>Show one course</span><select value={activeTrack} onChange={(event) => selectTrack(event.target.value)}><option value="all">All courses</option>{tracks.map((track) => <option value={track.slug} key={track.slug}>{track.shortTitle}</option>)}</select></label>
          </div>
          <p className="catalog-count">{visibleCount} {visibleCount === 1 ? "lesson" : "lessons"} shown · notes and core practice work offline</p>

          {(aiMessage || aiResults.length > 0) && <section className="ai-search-guide" aria-live="polite" aria-label="AI course recommendations"><div className="ai-search-guide-heading"><span aria-hidden="true">✦</span><div><strong>AI course guide</strong><p>{aiMessage}</p></div></div>{aiResults.length > 0 && <div className="ai-search-results">{aiResults.map((result, index) => <Link href={`/learn/${result.slug}`} key={result.slug}><span>{index + 1}</span><div><small>{result.track}</small><strong>{result.title}</strong><p>{result.reason}</p></div><span aria-hidden="true">→</span></Link>)}</div>}</section>}
        </section>

        <div id="course-results" className="course-results">
          {(activeTrack !== "all" || query.trim()) ? (
            visibleTracks.length ? visibleTracks.map((track) => <CoursePathCard track={track} progressState={progressState} expanded onOpen={selectTrack} key={track.slug} />) : <div className="empty-state"><strong>No matching lessons.</strong><p>Try a broader topic or ask the AI course guide.</p></div>
          ) : <>
            <CourseGroup eyebrow="Recommended start" title="Complete, guided pathways" description="These multi-week programs combine an ordered syllabus with current Binary Tree lectures, practice, study tools, and progress tracking." tracks={featuredTracks} progressState={progressState} featured onOpen={(slug) => selectTrack(slug, true)} />
            <CourseGroup eyebrow="Video courses" title="Four more complete lecture series" description="Every upload from these four recent series is now embedded in its exact lesson—with chapters, checkpoints, deep notes, and a next step." tracks={recentTracks} progressState={progressState} onOpen={(slug) => selectTrack(slug, true)} />
            <CourseGroup eyebrow="More learning" title="Additional focused tracks" description="Use these when they match a specific classroom or project need." tracks={additionalTracks} progressState={progressState} onOpen={(slug) => selectTrack(slug, true)} />
          </>}
        </div>
      </div>
    </div>
  );
}