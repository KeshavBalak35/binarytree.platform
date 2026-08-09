"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { recordVideoCheckpoint, recordVideoComplete, useLessonProgress } from "@/lib/progress-store";

let youtubeApiPromise;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("YouTube requires a browser."));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("The YouTube player did not initialize."));
    };

    let script = document.querySelector("script[data-binarytree-youtube-api]");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.binarytreeYoutubeApi = "true";
      script.onerror = () => reject(new Error("The video player could not be loaded."));
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, "0")}`;
}

export function InteractiveVideo({ lessonSlug, video }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const handledRef = useRef(new Set());
  const activeRef = useRef(null);
  const reactId = useId();
  const [mode, setMode] = useState("interactive");
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [playerError, setPlayerError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const progress = useLessonProgress(lessonSlug);
  const completedIds = useMemo(() => new Set(progress.video?.checkpointIds || []), [progress.video?.checkpointIds]);
  const checkpoints = useMemo(() => video.checkpoints || [], [video.checkpoints]);

  useEffect(() => {
    const updateNetwork = () => setOnline(navigator.onLine);
    updateNetwork();
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let player;
    const resetState = window.setTimeout(() => {
      if (cancelled) return;
      setReady(false);
      setPlayerError("");
    }, 0);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return;
        player = new YT.Player(mountRef.current, {
          host: "https://www.youtube-nocookie.com",
          videoId: video.youtubeId,
          playerVars: {
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => !cancelled && setReady(true),
            onStateChange: (event) => {
              if (event.data === 0) recordVideoComplete(lessonSlug, true);
            },
            onError: () => !cancelled && setPlayerError("This video could not be played here. Open it on YouTube or use the lecture guide below."),
          },
        });
        playerRef.current = player;
      })
      .catch(() => !cancelled && setPlayerError("The video player is unavailable. The complete lecture guide below still works offline."));

    return () => {
      cancelled = true;
      window.clearTimeout(resetState);
      playerRef.current = null;
      try { player?.destroy?.(); } catch {}
    };
  }, [lessonSlug, video.youtubeId, checkpoints.length]);

  useEffect(() => {
    if (!ready) return undefined;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;
      const time = Number(player.getCurrentTime()) || 0;
      setCurrentTime(time);
      if (mode !== "interactive" || activeRef.current) return;
      const next = checkpoints.find((checkpoint) => (
        time >= checkpoint.time
        && time < checkpoint.time + 2.5
        && !handledRef.current.has(checkpoint.id)
        && !completedIds.has(checkpoint.id)
      ));
      if (!next) return;
      handledRef.current.add(next.id);
      activeRef.current = next;
      player.pauseVideo?.();
      setSelectedChoice(null);
      setShowExplanation(false);
      setActiveCheckpoint(next);
    }, 500);
    return () => window.clearInterval(timer);
  }, [checkpoints, completedIds, mode, ready]);

  const seekTo = (seconds) => {
    if (!playerRef.current?.seekTo) return;
    playerRef.current.seekTo(seconds, true);
    playerRef.current.playVideo?.();
  };

  const chooseAnswer = (choiceIndex) => {
    if (!activeCheckpoint || showExplanation) return;
    setSelectedChoice(choiceIndex);
    setShowExplanation(true);
    if (choiceIndex === activeCheckpoint.answer) {
      recordVideoCheckpoint(lessonSlug, activeCheckpoint.id, checkpoints.length);
    }
  };

  const continueVideo = () => {
    if (selectedChoice !== activeCheckpoint?.answer) {
      setSelectedChoice(null);
      setShowExplanation(false);
      return;
    }
    activeRef.current = null;
    setActiveCheckpoint(null);
    setSelectedChoice(null);
    setShowExplanation(false);
    playerRef.current?.playVideo?.();
  };

  const completedCount = checkpoints.filter((checkpoint) => completedIds.has(checkpoint.id)).length;
  const progressPercent = checkpoints.length ? Math.round((completedCount / checkpoints.length) * 100) : 0;
  const titleId = `${reactId.replace(/:/g, "")}-title`;

  return (
    <section className="interactive-video" aria-labelledby={titleId}>
      <div className="interactive-video-heading">
        <div>
          <p className="eyebrow">Interactive lecture</p>
          <h2 id={titleId}>Watch, pause, think, apply.</h2>
          <p>{video.learningPromise}</p>
        </div>
        <div className="video-mode-switch" aria-label="Video mode">
          <button type="button" className={mode === "interactive" ? "is-active" : ""} aria-pressed={mode === "interactive"} onClick={() => setMode("interactive")}>Interactive</button>
          <button type="button" className={mode === "watch" ? "is-active" : ""} aria-pressed={mode === "watch"} onClick={() => setMode("watch")}>Watch only</button>
        </div>
      </div>

      <div className="video-learning-shell">
        <div className="video-player-column">
          <div className="video-player-frame">
            <div ref={mountRef} />
            {activeCheckpoint && (
              <div className="video-checkpoint-overlay" role="dialog" aria-modal="true" aria-labelledby={`${titleId}-checkpoint`}>
                <div className="video-checkpoint-card">
                  <span className="checkpoint-label">Quick checkpoint · {formatTime(activeCheckpoint.time)}</span>
                  <h3 id={`${titleId}-checkpoint`}>{activeCheckpoint.prompt}</h3>
                  <div className="checkpoint-choices">
                    {activeCheckpoint.choices.map((choice, index) => {
                      const chosen = selectedChoice === index;
                      const correct = showExplanation && index === activeCheckpoint.answer;
                      const wrong = showExplanation && chosen && index !== activeCheckpoint.answer;
                      return <button type="button" className={`${chosen ? "is-chosen" : ""} ${correct ? "is-correct" : ""} ${wrong ? "is-wrong" : ""}`} onClick={() => chooseAnswer(index)} disabled={showExplanation} key={choice}>{choice}</button>;
                    })}
                  </div>
                  {showExplanation && (
                    <div className={`checkpoint-feedback ${selectedChoice === activeCheckpoint.answer ? "is-correct" : "is-wrong"}`} role="status">
                      <strong>{selectedChoice === activeCheckpoint.answer ? "That’s it." : "Not quite yet."}</strong>
                      <p>{activeCheckpoint.explanation}</p>
                      <button type="button" onClick={continueVideo}>{selectedChoice === activeCheckpoint.answer ? "Continue the lecture →" : "Try again"}</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="video-status-row">
            <span className={`video-live-dot ${online && ready ? "is-live" : ""}`} aria-hidden="true" />
            <span>{online ? (ready ? `Playing from ${formatTime(currentTime)}` : "Connecting to the lecture…") : "Offline — use the complete guide below"}</span>
            <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noreferrer">Open on YouTube ↗</a>
          </div>
          {playerError && <p className="video-player-error" role="status">{playerError}</p>}
        </div>

        <aside className="video-chapter-panel" aria-label="Lecture chapters">
          <div className="video-progress-summary">
            <span><strong>{completedCount}</strong> / {checkpoints.length} checks</span>
            <span>{progressPercent}%</span>
            <div><span style={{ width: `${progressPercent}%` }} /></div>
          </div>
          <h3>Lecture map</h3>
          <ol>
            {video.chapters.map((chapter) => (
              <li key={`${chapter.time}-${chapter.title}`}>
                <button type="button" onClick={() => seekTo(chapter.time)} disabled={!ready}>
                  <span>{formatTime(chapter.time)}</span>
                  <strong>{chapter.title}</strong>
                </button>
              </li>
            ))}
          </ol>
          <p className="video-mode-note">{mode === "interactive" ? "The video pauses at the marked thinking points. Correct answers grow your progress tree." : "Watch-only mode skips automatic pauses; your chapters and notes remain available."}</p>
        </aside>
      </div>
    </section>
  );
}
