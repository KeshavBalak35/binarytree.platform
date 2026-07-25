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

export function CurriculumCatalog({ tracks, initialTrack = "all" }) {
  const requestedTrack = useSyncExternalStore(subscribeToUrl, getTrackFromUrl, () => initialTrack);
  const validRequestedTrack = requestedTrack === "all" || tracks.some((track) => track.slug === requestedTrack) ? requestedTrack : "all";
  const [query, setQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const activeTrack = selectedTrack ?? validRequestedTrack;

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

  return (
    <div className="catalog-shell">
      <div className="container">
        <div className="catalog-toolbar">
          <label className="search-field">
            <span className="sr-only">Search the curriculum</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons, topics, or skills" />
          </label>
          <div className="filter-row" aria-label="Filter by learning track">
            <button className={`filter-button ${activeTrack === "all" ? "is-active" : ""}`} onClick={() => setSelectedTrack("all")}>All tracks</button>
            {tracks.map((track) => (
              <button key={track.slug} className={`filter-button ${activeTrack === track.slug ? "is-active" : ""}`} onClick={() => setSelectedTrack(track.slug)}>{track.shortTitle}</button>
            ))}
          </div>
        </div>
        <p className="catalog-count">Showing {visibleCount} {visibleCount === 1 ? "lesson" : "lessons"}. Every summary, flashcard, and quiz is available offline.</p>

        {visibleTracks.length === 0 ? (
          <div className="empty-state"><strong>No matching lessons.</strong><br />Try a broader topic or switch back to all tracks.</div>
        ) : visibleTracks.map((track) => (
          <section className="track-section" id={track.slug} key={track.slug}>
            <div className="track-heading">
              <div>
                <span className="course-card-eyebrow" style={{ color: `var(--${track.color === "green" ? "mint" : track.color}-500, var(--blue-600))` }}>{track.eyebrow}</span>
                <h2>{track.title}</h2>
                <p>{track.description}</p>
              </div>
              <span className="track-heading-meta">{track.lessons.length} lessons · {formatDuration(track.lessons.reduce((total, lesson) => total + lesson.duration, 0))}</span>
            </div>
            <div className="lesson-list">
              {track.lessons.map((lesson) => (
                <Link className="lesson-row" href={`/learn/${lesson.slug}`} key={lesson.slug}>
                  <span className="lesson-number">{String(lesson.week).padStart(2, "0")}</span>
                  <span>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.summary}</p>
                  </span>
                  <span className="lesson-row-meta"><span>{formatDuration(lesson.duration)}</span><span className="lesson-row-arrow">→</span></span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
