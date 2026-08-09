"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  isLessonStarted,
  lessonProgressBreakdown,
  lessonProgressPercent,
  overallProgressPercent,
  trackProgressPercent,
  useProgressSnapshot,
} from "@/lib/progress-store";

const ACCENTS = {
  blue: "#2f7894",
  violet: "#76669a",
  coral: "#b96756",
  green: "#4c9169",
  gold: "#a98232",
  teal: "#398783",
  indigo: "#596e9d",
};

function flattenedCatalog(tracks) {
  return tracks.flatMap((track) => track.lessons.map((lesson) => ({ ...lesson, trackSlug: track.slug, trackTitle: track.title })));
}

function safeDateLabel(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function lessonActivityLabel(lesson, state) {
  const progress = lessonProgressBreakdown(lesson, state);
  if (progress.completed) return "Lesson marked complete";
  const parts = [];
  if (progress.video.total) parts.push(`${progress.video.complete}/${progress.video.total} video checks`);
  if (progress.quiz.total) parts.push(`${progress.quiz.answered}/${progress.quiz.total} quiz questions`);
  if (progress.project.total) parts.push(`${progress.project.passed}/${progress.project.total} project checks`);
  return parts.length ? parts.join(" · ") : "Not started yet";
}

function buildSummary(tracks, state) {
  const lessons = flattenedCatalog(tracks);
  const lessonRows = lessons.map((lesson) => ({
    ...lesson,
    percent: lessonProgressPercent(lesson, state),
    started: isLessonStarted(lesson, state),
    updatedAt: state.lessons?.[lesson.slug]?.updatedAt || null,
  }));
  const recent = [...lessonRows]
    .filter((lesson) => lesson.updatedAt)
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0] || null;

  let upNext = null;
  if (recent?.percent < 100) upNext = recent;
  if (!upNext && recent) {
    const recentIndex = lessonRows.findIndex((lesson) => lesson.slug === recent.slug);
    upNext = lessonRows.slice(recentIndex + 1).find((lesson) => lesson.percent < 100)
      || lessonRows.find((lesson) => lesson.percent < 100)
      || null;
  }
  if (!upNext) upNext = lessonRows.find((lesson) => lesson.percent < 100) || null;

  const trackRows = tracks.map((track) => {
    const lessonsWithProgress = track.lessons.map((lesson) => ({
      ...lesson,
      percent: lessonProgressPercent(lesson, state),
      started: isLessonStarted(lesson, state),
    }));
    return {
      ...track,
      percent: trackProgressPercent(track, state),
      completeCount: lessonsWithProgress.filter((lesson) => lesson.percent === 100).length,
      startedCount: lessonsWithProgress.filter((lesson) => lesson.started).length,
      lessons: lessonsWithProgress,
    };
  });

  return {
    overall: overallProgressPercent(tracks, state),
    completedLessons: lessonRows.filter((lesson) => lesson.percent === 100).length,
    startedLessons: lessonRows.filter((lesson) => lesson.started).length,
    totalLessons: lessonRows.length,
    recent,
    upNext,
    tracks: trackRows,
  };
}

function ContextCard({ eyebrow, lesson, empty, state, actionLabel }) {
  return (
    <article className="context-card">
      <span>{eyebrow}</span>
      {lesson ? (
        <>
          <small>{lesson.trackTitle}</small>
          <h3>{lesson.title}</h3>
          <p>{lessonActivityLabel(lesson, state)}</p>
          <Link href={`/learn/${lesson.slug}`}>{actionLabel} <span aria-hidden="true">→</span></Link>
        </>
      ) : (
        <>
          <h3>{empty.title}</h3>
          <p>{empty.copy}</p>
          <Link href="/learn">Browse courses <span aria-hidden="true">→</span></Link>
        </>
      )}
    </article>
  );
}

export function ProgressTree({ tracks }) {
  const state = useProgressSnapshot();
  const summary = useMemo(() => buildSummary(Array.isArray(tracks) ? tracks : [], state), [tracks, state]);

  return (
    <section className="progress-tree" aria-labelledby="progress-tree-title">
      <div className="progress-overview">
        <div className="progress-copy">
          <p className="progress-kicker">Your learning tree</p>
          <h2 id="progress-tree-title">Every finished step adds some color.</h2>
          <p>Video checkpoints, quizzes, projects, and completed lessons all contribute. Your progress stays on this device.</p>
          <div className="overall-meter">
            <div><strong>{summary.overall}%</strong><span>overall progress</span></div>
            <progress value={summary.overall} max="100" aria-label={`${summary.overall}% overall curriculum progress`}>{summary.overall}%</progress>
            <small>{summary.completedLessons} of {summary.totalLessons} lessons complete · {summary.startedLessons} started</small>
          </div>
        </div>

        <div className="tree-art" aria-hidden="true" style={{ "--overall": `${summary.overall}%` }}>
          <span className="tree-sun" />
          <div className="tree-canopy tree-canopy-one" />
          <div className="tree-canopy tree-canopy-two" />
          <div className="tree-canopy tree-canopy-three" />
          <div className="tree-trunk"><span /></div>
          <div className="tree-ground"><span /></div>
          <div className="tree-branch-dots">
            {summary.tracks.map((track, index) => (
              <span
                className="tree-branch-dot"
                data-side={index % 2 ? "right" : "left"}
                key={track.slug}
                style={{
                  "--branch-top": `${(index % 4) * 21}%`,
                  "--branch-offset": `${(index % 3) * 14}%`,
                  "--branch-color": ACCENTS[track.color] || ACCENTS.blue,
                  "--branch-opacity": Math.max(0.18, track.percent / 100),
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="progress-context" aria-label="Recent and suggested lessons">
        <ContextCard
          eyebrow={summary.recent ? `Recent · ${safeDateLabel(summary.recent.updatedAt)}` : "Recent activity"}
          lesson={summary.recent}
          empty={{ title: "Nothing here yet—and that is okay.", copy: "Choose one lesson and your first branch will begin to fill." }}
          state={state}
          actionLabel="Continue lesson"
        />
        <ContextCard
          eyebrow="Up next"
          lesson={summary.upNext}
          empty={{ title: "Your tree is fully colored.", copy: "You have completed every lesson currently in the curriculum." }}
          state={state}
          actionLabel={summary.upNext?.started ? "Keep going" : "Start this lesson"}
        />
      </div>

      <div className="track-tree" aria-label="Progress by course">
        <div className="track-tree-heading">
          <div><span>Branches</span><h2>Progress by course</h2></div>
          <p>Open a branch to see every lesson.</p>
        </div>
        <ol className="track-list">
          {summary.tracks.map((track, index) => (
            <li key={track.slug} style={{ "--track-color": ACCENTS[track.color] || ACCENTS.blue }}>
              <article className="track-branch">
                <div className="branch-mark" aria-hidden="true">
                  <span className="branch-line"><i style={{ width: `${track.percent}%` }} /></span>
                  <span className={`branch-leaf ${track.percent === 100 ? "is-complete" : ""}`}>{index + 1}</span>
                </div>
                <div className="branch-content">
                  <header>
                    <div><small>{track.eyebrow || "Learning track"}</small><h3>{track.title}</h3></div>
                    <strong>{track.percent}%</strong>
                  </header>
                  <progress value={track.percent} max="100" aria-label={`${track.title}: ${track.percent}% complete`}>{track.percent}%</progress>
                  <details>
                    <summary>{track.completeCount}/{track.lessons.length} complete · {track.startedCount} started <span aria-hidden="true">⌄</span></summary>
                    <ol className="lesson-progress-list">
                      {track.lessons.map((lesson) => (
                        <li key={lesson.slug}>
                          <Link href={`/learn/${lesson.slug}`}>
                            <span className={`lesson-status ${lesson.percent === 100 ? "is-complete" : lesson.started ? "is-started" : ""}`} aria-hidden="true" />
                            <span><small>Lesson {lesson.week}</small><strong>{lesson.title}</strong></span>
                            <em>{lesson.percent}%</em>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </details>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <style jsx>{`
        .progress-tree { --ink: #173e53; --muted: #5d7680; color: var(--ink); }
        .progress-overview { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 430px); align-items: center; gap: clamp(34px, 6vw, 82px); padding: clamp(28px, 5vw, 58px); overflow: hidden; border: 2px solid #214f61; border-radius: 24px 11px 28px 15px; background: linear-gradient(145deg, #f8fcfb 0%, #e9f4f4 55%, #dfeee8 100%); box-shadow: 5px 7px 0 rgba(24, 63, 77, .11); }
        .progress-kicker, .track-tree-heading span, .context-card > span { display: block; margin: 0 0 8px; color: #347c79; font-size: .72rem; font-weight: 850; letter-spacing: .11em; text-transform: uppercase; }
        .progress-copy h2 { max-width: 650px; margin: 0 0 14px; font-family: Georgia, serif; font-size: clamp(2rem, 4vw, 3.55rem); line-height: 1.02; letter-spacing: -.035em; }
        .progress-copy > p:not(.progress-kicker) { max-width: 620px; margin: 0; color: var(--muted); line-height: 1.65; }
        .overall-meter { display: grid; gap: 9px; max-width: 590px; margin-top: 30px; }
        .overall-meter > div { display: flex; align-items: baseline; gap: 9px; }
        .overall-meter strong { font-family: Georgia, serif; font-size: 2.15rem; }
        .overall-meter span, .overall-meter small { color: var(--muted); }
        progress { width: 100%; height: 12px; overflow: hidden; border: 0; border-radius: 999px; background: #d6e3e3; accent-color: #3c8d6a; }
        progress::-webkit-progress-bar { border-radius: 999px; background: #d6e3e3; }
        progress::-webkit-progress-value { border-radius: 999px; background: linear-gradient(90deg, #337b98, #4a9a6d); }
        progress::-moz-progress-bar { border-radius: 999px; background: linear-gradient(90deg, #337b98, #4a9a6d); }

        .tree-art { position: relative; min-height: 370px; filter: drop-shadow(0 18px 20px rgba(29, 73, 73, .14)); }
        .tree-sun { position: absolute; top: 14px; right: 16px; width: 65px; height: 61px; border-radius: 48% 52% 44% 56%; background: #f4cf6c; opacity: .8; transform: rotate(8deg); }
        .tree-canopy { position: absolute; z-index: 2; border: 2px solid rgba(25, 83, 77, .3); background: color-mix(in srgb, #4e9b72 var(--overall), #d6e8e1); transition: background .35s ease; }
        .tree-canopy-one { top: 28px; left: 15%; width: 68%; height: 178px; border-radius: 47% 53% 42% 58% / 53% 45% 55% 47%; transform: rotate(-4deg); }
        .tree-canopy-two { top: 103px; left: 2%; width: 58%; height: 142px; border-radius: 55% 45% 62% 38% / 45% 58% 42% 55%; transform: rotate(7deg); }
        .tree-canopy-three { top: 93px; right: 0; width: 56%; height: 153px; border-radius: 43% 57% 39% 61% / 62% 44% 56% 38%; transform: rotate(-7deg); }
        .tree-trunk { position: absolute; bottom: 38px; left: 46%; z-index: 1; width: 50px; height: 175px; overflow: hidden; border: 2px solid #775c43; border-radius: 48% 52% 17px 13px; background: #d4b994; transform: rotate(1.5deg); }
        .tree-trunk span { position: absolute; right: 0; bottom: 0; left: 0; height: var(--overall); background: #8a694a; transition: height .35s ease; }
        .tree-ground { position: absolute; right: 4%; bottom: 24px; left: 2%; height: 32px; border-bottom: 3px solid #39785a; border-radius: 50%; transform: rotate(-1deg); }
        .tree-ground span { position: absolute; right: 24%; bottom: -9px; width: 39%; height: 18px; border-bottom: 2px solid #75a586; border-radius: 50%; }
        .tree-branch-dots { position: absolute; inset: 55px 12% 125px; z-index: 3; }
        .tree-branch-dot { position: absolute; top: var(--branch-top); width: 31px; height: 24px; border: 2px solid rgba(23, 62, 83, .28); border-radius: 63% 37% 58% 42%; background: var(--branch-color); opacity: var(--branch-opacity); }
        .tree-branch-dot[data-side="left"] { left: var(--branch-offset); transform: rotate(-19deg); }
        .tree-branch-dot[data-side="right"] { right: var(--branch-offset); transform: rotate(22deg); }

        .progress-context { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; margin: 28px 0 48px; }
        .context-card { position: relative; min-height: 220px; padding: 27px 29px; border: 1px solid #b8d0d3; border-radius: 9px 19px 10px 16px; background: #fff; box-shadow: 3px 4px 0 rgba(26, 68, 80, .08); }
        .context-card:nth-child(2) { border-radius: 19px 8px 17px 10px; background: #f4f9f4; transform: rotate(.3deg); }
        .context-card small { color: #617984; }
        .context-card h3 { margin: 7px 0 10px; font-family: Georgia, serif; font-size: clamp(1.35rem, 2.2vw, 1.85rem); }
        .context-card p { margin: 0 0 24px; color: var(--muted); line-height: 1.55; }
        .context-card a { position: absolute; bottom: 25px; color: #286d82; font-weight: 800; text-decoration: none; }
        .context-card a:hover { text-decoration: underline; text-underline-offset: 4px; }

        .track-tree { padding-top: 8px; }
        .track-tree-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 21px; }
        .track-tree-heading h2 { margin: 0; font-family: Georgia, serif; font-size: clamp(1.8rem, 3vw, 2.6rem); }
        .track-tree-heading p { margin: 0; color: var(--muted); }
        .track-list, .lesson-progress-list { padding: 0; margin: 0; list-style: none; }
        .track-list { display: grid; gap: 17px; }
        .track-branch { display: grid; grid-template-columns: 92px minmax(0, 1fr); align-items: start; gap: 18px; }
        .branch-mark { position: relative; min-height: 72px; margin-top: 9px; }
        .branch-line { position: absolute; top: 28px; right: 0; left: 2px; height: 10px; overflow: hidden; border: 1px solid color-mix(in srgb, var(--track-color) 40%, #b9cfd2); border-radius: 60% 40% 52% 48%; background: #e1ebea; transform: rotate(-4deg); }
        .branch-line i { display: block; height: 100%; border-radius: inherit; background: var(--track-color); }
        .branch-leaf { position: absolute; top: 5px; left: 0; display: grid; width: 38px; height: 31px; place-items: center; border: 2px solid var(--track-color); border-radius: 63% 37% 58% 42%; background: #f8fbfa; color: var(--track-color); font-size: .72rem; font-weight: 850; transform: rotate(-8deg); }
        .branch-leaf.is-complete { background: var(--track-color); color: #fff; }
        .branch-content { min-width: 0; padding: 22px 24px; border: 1px solid #c3d5d7; border-radius: 8px 17px 8px 14px; background: #fff; }
        .track-list > li:nth-child(even) .branch-content { border-radius: 16px 8px 15px 8px; background: #f8fbfa; }
        .branch-content header { display: flex; align-items: start; justify-content: space-between; gap: 18px; }
        .branch-content header small { color: var(--track-color); font-size: .67rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
        .branch-content h3 { margin: 4px 0 11px; font-family: Georgia, serif; font-size: 1.3rem; }
        .branch-content header > strong { color: var(--track-color); font-family: Georgia, serif; font-size: 1.65rem; }
        .branch-content progress { height: 8px; accent-color: var(--track-color); }
        .branch-content details { margin-top: 10px; }
        .branch-content summary { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; color: var(--muted); cursor: pointer; font-size: .78rem; font-weight: 700; list-style: none; }
        .branch-content summary::-webkit-details-marker { display: none; }
        .lesson-progress-list { display: grid; gap: 2px; padding-top: 7px; border-top: 1px dashed #c8d8d9; }
        .lesson-progress-list a { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 11px; min-height: 54px; padding: 7px 8px; border-radius: 10px; color: var(--ink); text-decoration: none; }
        .lesson-progress-list a:hover { background: #edf5f3; }
        .lesson-progress-list a > span:nth-child(2) { display: grid; min-width: 0; }
        .lesson-progress-list small { color: var(--muted); font-size: .65rem; }
        .lesson-progress-list strong { overflow: hidden; font-size: .82rem; text-overflow: ellipsis; white-space: nowrap; }
        .lesson-progress-list em { color: var(--track-color); font-size: .76rem; font-style: normal; font-weight: 850; }
        .lesson-status { width: 13px; height: 13px; border: 2px solid #a8bec0; border-radius: 48% 52% 45% 55%; background: #fff; }
        .lesson-status.is-started { border-color: var(--track-color); background: color-mix(in srgb, var(--track-color) 30%, #fff); }
        .lesson-status.is-complete { border-color: var(--track-color); background: var(--track-color); }

        @media (max-width: 820px) {
          .progress-overview { grid-template-columns: 1fr; }
          .tree-art { width: min(100%, 430px); min-height: 320px; margin: -15px auto 0; }
          .progress-context { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .progress-overview { padding: 27px 20px 20px; border-radius: 18px 8px 20px 10px; }
          .progress-copy h2 { font-size: 2.25rem; }
          .tree-art { min-height: 285px; transform: scale(.92); transform-origin: center bottom; }
          .progress-context { margin-top: 20px; }
          .context-card { min-height: 210px; padding: 23px 21px; }
          .track-tree-heading { display: block; }
          .track-tree-heading p { margin-top: 8px; }
          .track-branch { grid-template-columns: 35px minmax(0, 1fr); gap: 9px; }
          .branch-line { display: none; }
          .branch-leaf { width: 31px; height: 28px; }
          .branch-content { padding: 18px 15px; }
          .branch-content header > strong { font-size: 1.35rem; }
          .lesson-progress-list strong { white-space: normal; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tree-canopy, .tree-trunk span { transition: none; }
        }
      `}</style>
    </section>
  );
}
