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
          <h2 id="progress-tree-title">Every finished step grows a new branch.</h2>
          <p>Video checkpoints grow twigs, quizzes add leaves, and finished projects extend each course branch. Your progress stays on this device.</p>
          <div className="overall-meter">
            <div><strong>{summary.overall}%</strong><span>overall progress</span></div>
            <progress value={summary.overall} max="100" aria-label={`${summary.overall}% overall curriculum progress`}>{summary.overall}%</progress>
            <small>{summary.completedLessons} of {summary.totalLessons} lessons complete · {summary.startedLessons} started</small>
          </div>
        </div>

        <div className="tree-art" aria-hidden="true">
          <span className="tree-sun" />
          <span className="tree-ground tree-ground-back" />
          <span className="tree-trunk-main" />
          <span className="tree-trunk-root tree-root-left" />
          <span className="tree-trunk-root tree-root-right" />
          <div className="growth-branches">
            {summary.tracks.map((track, index) => {
              const twigCount = Math.min(4, Math.ceil(track.percent / 25));
              const leafCount = Math.min(5, track.completeCount + (track.startedCount > track.completeCount ? 1 : 0));
              return (
                <span
                  className="growth-branch"
                  data-side={index % 2 ? "right" : "left"}
                  key={track.slug}
                  style={{
                    "--branch-y": `${38 + index * 26}px`,
                    "--branch-reach": `${(track.percent ? 44 + track.percent * 0.72 : 0)}px`,
                    "--branch-color": ACCENTS[track.color] || ACCENTS.blue,
                  }}
                >
                  <i className="growth-bough" />
                  {[0, 1, 2, 3].slice(0, twigCount).map((twig) => <i className={`growth-twig twig-${twig + 1}`} key={twig} />)}
                  {[0, 1, 2, 3, 4].slice(0, leafCount).map((leaf) => <i className={`growth-leaf leaf-${leaf + 1}`} key={leaf} />)}
                </span>
              );
            })}
          </div>
          <span className="tree-ground tree-ground-front" />
        </div>
      </div>

      <div className="progress-context" aria-label="Recent and suggested lessons">
        <ContextCard
          eyebrow={summary.recent ? `Recent · ${safeDateLabel(summary.recent.updatedAt)}` : "Recent activity"}
          lesson={summary.recent}
          empty={{ title: "Nothing here yet—and that is okay.", copy: "Choose one lesson and your first branch will begin to grow." }}
          state={state}
          actionLabel="Continue lesson"
        />
        <ContextCard
          eyebrow="Up next"
          lesson={summary.upNext}
          empty={{ title: "Your learning tree is fully grown.", copy: "You have completed every lesson currently in the curriculum." }}
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

        .tree-art { position: relative; min-height: 390px; filter: drop-shadow(0 16px 17px rgba(29, 73, 73, .15)); }
        .tree-sun { position: absolute; top: 19px; right: 18px; width: 66px; height: 62px; border-radius: 48% 52% 44% 56%; background: #f4cf6c; opacity: .82; transform: rotate(8deg); }
        .tree-trunk-main { position: absolute; bottom: 47px; left: calc(50% - 18px); width: 39px; height: 236px; border: 2px solid #644932; border-radius: 54% 46% 18px 13px / 23% 21% 11px 10px; background: linear-gradient(90deg,#826044 0 24%,#b28a61 25% 68%,#77553c 69%); transform: rotate(1deg); z-index: 2; }
        .tree-trunk-main::before,.tree-trunk-main::after { position: absolute; left: 8px; width: 15px; height: 2px; border-radius: 50%; background: rgba(75,49,31,.38); content: ""; transform: rotate(-16deg); }
        .tree-trunk-main::before { top: 62px; }.tree-trunk-main::after { top: 151px; }
        .tree-trunk-root { position: absolute; bottom: 42px; left: 50%; width: 72px; height: 17px; border-bottom: 9px solid #79583e; border-radius: 50%; z-index: 1; }
        .tree-root-left { transform: translateX(-67px) rotate(-11deg); }.tree-root-right { transform: translateX(-5px) rotate(11deg); }
        .tree-ground { position: absolute; right: 2%; left: 1%; border-radius: 50%; }
        .tree-ground-back { bottom: 26px; height: 43px; border-bottom: 4px solid #39785a; background: rgba(120,173,132,.16); }
        .tree-ground-front { right: 17%; bottom: 15px; left: 20%; height: 25px; border-bottom: 3px solid #75a586; transform: rotate(-1deg); }
        .growth-branches { position: absolute; inset: 27px 0 75px; z-index: 3; }
        .growth-branch { position: absolute; bottom: var(--branch-y); left: 50%; width: var(--branch-reach); height: 72px; transform-origin: left bottom; }
        .growth-branch[data-side="left"] { transform: scaleX(-1) rotate(-3deg); }
        .growth-branch[data-side="right"] { transform: translateX(3px) rotate(-5deg); }
        .growth-bough { position: absolute; bottom: 0; left: -2px; width: 100%; height: 42px; border-top: clamp(5px, .65vw, 9px) solid #75533b; border-radius: 57% 43% 0 0; transform: rotate(-14deg); transform-origin: left bottom; }
        .growth-bough::after { position: absolute; top: -5px; right: -4px; width: 10px; height: 8px; border-radius: 60%; background: #75533b; content: ""; }
        .growth-twig { position: absolute; width: 38%; height: 30px; border-top: 4px solid #75533b; border-radius: 55%; transform-origin: left center; }
        .twig-1 { bottom: 24px; left: 27%; transform: rotate(-39deg); }.twig-2 { bottom: 31px; left: 48%; transform: rotate(-52deg); }
        .twig-3 { bottom: 17px; left: 60%; transform: rotate(21deg); }.twig-4 { bottom: 27px; left: 75%; transform: rotate(-34deg); }
        .growth-leaf { position: absolute; width: 24px; height: 15px; border: 2px solid color-mix(in srgb,var(--branch-color) 70%,#315d4b); border-radius: 72% 28% 68% 32% / 61% 42% 58% 39%; background: color-mix(in srgb,var(--branch-color) 72%,#cbe4cf); }
        .leaf-1 { right: 0; bottom: 41px; transform: rotate(-16deg); }.leaf-2 { left: 31%; bottom: 48px; transform: rotate(27deg); }
        .leaf-3 { left: 51%; bottom: 62px; transform: rotate(-22deg); }.leaf-4 { left: 68%; bottom: 18px; transform: rotate(19deg); }
        .leaf-5 { right: 9%; bottom: 62px; transform: rotate(-35deg); }

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
