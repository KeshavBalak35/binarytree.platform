"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { formatDuration } from "@/lib/format";

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

export function CurriculumCatalog({ tracks, initialTrack = "all" }) {
  const requestedTrack = useSyncExternalStore(subscribeToUrl, getTrackFromUrl, () => initialTrack);
  const validRequestedTrack = requestedTrack === "all" || tracks.some((track) => track.slug === requestedTrack) ? requestedTrack : "all";
  const [query, setQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const activeTrack = selectedTrack ?? validRequestedTrack;

  function selectTrack(slug) {
    setSelectedTrack(slug);
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("track");
    else url.searchParams.set("track", slug);
    window.history.replaceState({}, "", url);
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

  const visibleCount = visibleTracks.reduce((total, track) => total + track.lessons.length, 0);

  async function findWithAI() {
    const request = query.trim();
    if (request.length < 3 || aiLoading) return;
    setAiLoading(true);
    setAiResults([]);
    setAiMessage("The AI guide is finding the best starting points. Your normal search still works instantly.");

    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: request }),
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.recommendations)) throw new Error("unavailable");
      setAiResults(data.recommendations);
      setAiMessage(data.offline
        ? "The AI service is busy, so these are the closest matches found on this device."
        : "Three recommendations from the Binary Tree AI course guide.");
    } catch {
      const local = visibleTracks.flatMap((track) => track.lessons.map((lesson) => ({
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        track: track.shortTitle,
        reason: "A close match from the offline curriculum search.",
      }))).slice(0, 3);
      setAiResults(local);
      setAiMessage(local.length ? "The AI guide is busy, so these are the closest offline matches." : "Try describing the skill with broader words, then ask the AI guide again.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="catalog-shell">
      <div className="container catalog-layout">
        <aside className="catalog-sidebar" aria-label="Course categories">
          <h2>Courses</h2>
          <nav>
            <button className={activeTrack === "all" ? "is-active" : ""} onClick={() => selectTrack("all")}><span>All courses</span><em>{tracks.reduce((sum, track) => sum + track.count, 0)}</em></button>
            {tracks.map((track) => <button className={activeTrack === track.slug ? "is-active" : ""} onClick={() => selectTrack(track.slug)} key={track.slug}><span>{track.shortTitle}</span><em>{track.count}</em></button>)}
          </nav>
          <Link className="catalog-practice-card" href="/typing"><span>Skill practice</span><strong>Key Quest typing</strong><small>Build speed in one minute →</small></Link>
        </aside>

        <div className="catalog-main">
          <div className="catalog-toolbar">
            <label className="search-field">
              <span className="sr-only">Search the curriculum</span><SearchIcon />
              <input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="What do you want to learn?" />
            </label>
            <button className="button button-secondary catalog-ai-button" type="button" disabled={aiLoading || query.trim().length < 3} onClick={findWithAI}>{aiLoading ? "AI is looking…" : "Find with AI"}</button>
            <label className="catalog-mobile-filter">
              <span>Course</span>
              <select value={activeTrack} onChange={(event) => selectTrack(event.target.value)}>
                <option value="all">All courses</option>
                {tracks.map((track) => <option value={track.slug} key={track.slug}>{track.shortTitle}</option>)}
              </select>
            </label>
          </div>
          <p className="catalog-count">{visibleCount} {visibleCount === 1 ? "lesson" : "lessons"} · Notes, practice, flashcards, and quizzes work offline</p>

          {(aiMessage || aiResults.length > 0) && (
            <section className="ai-search-guide" aria-live="polite" aria-label="AI course recommendations">
              <div className="ai-search-guide-heading"><span aria-hidden="true">✦</span><div><strong>AI course guide</strong><p>{aiMessage}</p></div></div>
              {aiResults.length > 0 && <div className="ai-search-results">
                {aiResults.map((result, index) => (
                  <Link href={`/learn/${result.slug}`} key={result.slug}>
                    <span>{index + 1}</span>
                    <div><small>{result.track}</small><strong>{result.title}</strong><p>{result.reason}</p></div>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>}
            </section>
          )}

          {visibleTracks.length === 0 ? (
            <div className="empty-state" data-reveal><strong>No matching lessons.</strong><p>Try a broader topic or ask the AI course guide.</p></div>
          ) : visibleTracks.map((track) => (
            <section className="track-section" id={track.slug} data-reveal key={track.slug}>
              <div className="track-heading">
                <div><span className="course-card-eyebrow">{track.eyebrow}</span><h2>{track.title}</h2><p>{track.description}</p></div>
                <span className="track-heading-meta">{track.lessons.length} lessons · {formatDuration(track.lessons.reduce((total, lesson) => total + lesson.duration, 0))}</span>
              </div>
              <div className="lesson-list">
                {track.lessons.map((lesson) => (
                  <Link className="lesson-row" href={`/learn/${lesson.slug}`} key={lesson.slug}>
                    <span className="lesson-number">{lesson.week}</span>
                    <span className="lesson-row-content"><span className="lesson-row-label">Lesson {lesson.week}</span><h3>{lesson.title}</h3><p>{lesson.summary}</p></span>
                    <span className="lesson-row-meta"><span>{formatDuration(lesson.duration)}</span><span className="lesson-row-arrow" aria-hidden="true">›</span></span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}