"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const SESSION_SECONDS = 60;
const BEST_SCORE_KEY = "binarytree-typing-best-v1";
const BEST_SCORE_EVENT = "binarytree-typing-best";

const PROMPTS = {
  easy: [
    "sad lad ask fall",
    "dad had a glass",
    "all fall fast",
    "a dad has a flag",
    "ask a lass",
    "flash a small flag",
  ],
  medium: [
    "the quick brown fox jumps",
    "learning a little every day",
    "kind hands make good friends",
    "a sunny day feels great",
    "practice makes progress",
    "look at the bright stars",
  ],
  hard: [
    "Bright ideas grow through patient practice.",
    "A curious mind can solve tricky puzzles!",
    "Typing calmly builds speed and confidence.",
    "Small steps today create stronger skills tomorrow.",
  ],
};

const LEVELS = [
  { id: "easy", name: "Easy", description: "Home-row words", sample: "sad · fall · glass" },
  { id: "medium", name: "Medium", description: "Everyday phrases", sample: "practice makes progress" },
  { id: "hard", name: "Hard", description: "Sentences and punctuation", sample: "Bright ideas grow…" },
];

const LEVEL_MESSAGES = {
  easy: "Strong foundation. Keep your hands relaxed and aim for accuracy first.",
  medium: "Good rhythm. Smooth, consistent typing will help your speed climb.",
  hard: "Excellent focus. Punctuation and capitals make this a serious challenge.",
};

function subscribeToBestScore(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(BEST_SCORE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(BEST_SCORE_EVENT, onStoreChange);
  };
}

function getBestScore() {
  const value = Number(window.localStorage.getItem(BEST_SCORE_KEY) || 0);
  return Number.isFinite(value) ? value : 0;
}

function pickPrompt(level, previous = "") {
  const options = PROMPTS[level].filter((item) => item !== previous);
  return options[Math.floor(Math.random() * options.length)] || PROMPTS[level][0];
}

function calculateStats(totalTyped, correctTyped, elapsedMs) {
  const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60);
  return {
    wpm: Math.max(0, Math.round((correctTyped / 5) / elapsedMinutes)),
    rawWpm: Math.max(0, Math.round((totalTyped / 5) / elapsedMinutes)),
    accuracy: totalTyped ? Math.round((correctTyped / totalTyped) * 100) : 100,
  };
}

function localTypingCoach(result) {
  const highAccuracy = result.accuracy >= 96;
  return {
    title: highAccuracy ? "Your accuracy is ready for a little more speed." : "Slow down slightly and protect accuracy.",
    summary: `You finished at ${result.wpm} WPM with ${result.accuracy}% accuracy. ${highAccuracy ? "That consistency gives you room to stretch." : "Clean keystrokes will raise your speed more reliably than rushing."}`,
    nextSteps: highAccuracy ? ["Repeat once at the same level.", "Keep your hands relaxed.", "Move up if accuracy stays above 94%."] : ["Repeat the same level.", "Pause after each mistake.", "Aim for 95% accuracy before moving up."],
    recommendedLevel: highAccuracy && result.level !== "hard" ? (result.level === "easy" ? "medium" : "hard") : result.level,
    offline: true,
  };
}

function CharacterPrompt({ prompt, typed }) {
  return (
    <p className="typing-prompt" aria-label={`Type: ${prompt}`}>
      {prompt.split("").map((character, index) => {
        let status = "is-pending";
        if (index === typed.length) status = "is-current";
        if (index < typed.length) status = typed[index] === character ? "is-done" : "is-wrong";
        return <span className={`typing-character ${status}`} key={`${index}-${character}`}>{character === " " ? "\u00a0" : character}</span>;
      })}
    </p>
  );
}

export function TypingGame() {
  const [phase, setPhase] = useState("setup");
  const [level, setLevel] = useState("easy");
  const [prompt, setPrompt] = useState("");
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [liveStats, setLiveStats] = useState({ wpm: 0, accuracy: 100 });
  const [result, setResult] = useState(null);
  const [coach, setCoach] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const bestWpm = useSyncExternalStore(subscribeToBestScore, getBestScore, () => 0);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);
  const totalTypedRef = useRef(0);
  const correctTypedRef = useRef(0);
  const mistakesRef = useRef(0);
  const completedWordsRef = useRef(0);
  const inputRef = useRef(null);

  const requestTypingCoach = useCallback(async (sessionResult) => {
    setCoach(null);
    setCoachLoading(true);
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "typing", result: sessionResult }),
      });
      const data = await response.json();
      if (!response.ok || !data.title) throw new Error("unavailable");
      setCoach(data);
    } catch {
      setCoach(localTypingCoach(sessionResult));
    } finally {
      setCoachLoading(false);
    }
  }, []);

  const finishSession = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    const elapsedMs = Math.min(SESSION_SECONDS * 1000, Math.max(1000, Date.now() - startedAtRef.current));
    const stats = calculateStats(totalTypedRef.current, correctTypedRef.current, elapsedMs);
    const finalResult = {
      ...stats,
      words: completedWordsRef.current,
      mistakes: mistakesRef.current,
      level,
    };
    setResult(finalResult);
    setPhase("results");
    requestTypingCoach(finalResult);
    try {
      if (stats.wpm > getBestScore()) {
        window.localStorage.setItem(BEST_SCORE_KEY, String(stats.wpm));
        window.dispatchEvent(new Event(BEST_SCORE_EVENT));
      }
    } catch {}
  }, [level, requestTypingCoach]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    timerRef.current = window.setInterval(() => {
      const elapsedMs = Date.now() - startedAtRef.current;
      const nextTime = Math.max(0, SESSION_SECONDS - Math.floor(elapsedMs / 1000));
      setTimeLeft(nextTime);
      const stats = calculateStats(totalTypedRef.current, correctTypedRef.current, elapsedMs);
      setLiveStats({ wpm: stats.wpm, accuracy: stats.accuracy });
      if (nextTime === 0) finishSession();
    }, 250);
    inputRef.current?.focus();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [phase, finishSession]);

  function startSession() {
    totalTypedRef.current = 0;
    correctTypedRef.current = 0;
    mistakesRef.current = 0;
    completedWordsRef.current = 0;
    startedAtRef.current = Date.now();
    setPrompt(pickPrompt(level));
    setTyped("");
    setTimeLeft(SESSION_SECONDS);
    setLiveStats({ wpm: 0, accuracy: 100 });
    setResult(null);
    setCoach(null);
    setCoachLoading(false);
    setPhase("playing");
  }

  function handleTyping(event) {
    const nextValue = event.target.value;
    if (nextValue.length > typed.length) {
      for (let index = typed.length; index < nextValue.length; index += 1) {
        totalTypedRef.current += 1;
        if (nextValue[index] === prompt[index]) correctTypedRef.current += 1;
        else mistakesRef.current += 1;
      }
    }
    setTyped(nextValue);
    const stats = calculateStats(totalTypedRef.current, correctTypedRef.current, Date.now() - startedAtRef.current);
    setLiveStats({ wpm: stats.wpm, accuracy: stats.accuracy });
    if (nextValue === prompt) {
      completedWordsRef.current += prompt.trim().split(/\s+/).length;
      setPrompt((current) => pickPrompt(level, current));
      setTyped("");
    }
  }

  function returnToSetup() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setPhase("setup");
    setResult(null);
    setCoach(null);
    setCoachLoading(false);
    setTyped("");
    setTimeLeft(SESSION_SECONDS);
  }

  return (
    <section className="typing-game" data-reveal aria-label="Key Quest typing practice">
      <div className="typing-game-heading">
        <div><span className="typing-kicker">Key Quest</span><h2>{phase === "setup" ? "Choose your challenge" : phase === "playing" ? "Type the text exactly" : "Session complete"}</h2></div>
        <div className="typing-best"><span>Personal best</span><strong>{bestWpm} WPM</strong></div>
      </div>

      {phase === "setup" && (
        <div className="typing-setup">
          <p>Practice for one focused minute. Accuracy matters just as much as speed, and backspace is always allowed.</p>
          <div className="typing-levels" role="radiogroup" aria-label="Difficulty level">
            {LEVELS.map((item) => (
              <button className={`typing-level ${level === item.id ? "is-selected" : ""}`} type="button" role="radio" aria-checked={level === item.id} onClick={() => setLevel(item.id)} key={item.id}>
                <span className="typing-level-check" aria-hidden="true">{level === item.id ? "✓" : ""}</span>
                <strong>{item.name}</strong><span>{item.description}</span><small>{item.sample}</small>
              </button>
            ))}
          </div>
          <button className="button button-primary typing-start" type="button" onClick={startSession}>Start 1-minute quest</button>
          <p className="typing-hint">Tip: place your fingers on A S D F and J K L ; before you begin.</p>
        </div>
      )}

      {phase === "playing" && (
        <div className="typing-session">
          <div className="typing-hud" aria-live="polite">
            <div><span>Time</span><strong>{String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</strong></div>
            <div><span>Words/min</span><strong>{liveStats.wpm}</strong></div>
            <div><span>Accuracy</span><strong>{liveStats.accuracy}%</strong></div>
          </div>
          <div className="typing-stage" onClick={() => inputRef.current?.focus()}>
            <span className="typing-stage-label">Copy this text</span>
            <CharacterPrompt prompt={prompt} typed={typed} />
            <label className="typing-input-label" htmlFor="typing-input">Your typing</label>
            <input ref={inputRef} id="typing-input" className="typing-input" value={typed} onChange={handleTyping} autoComplete="off" autoCapitalize="none" spellCheck="false" placeholder="Start typing here…" maxLength={prompt.length + 8} />
          </div>
          <div className="typing-session-footer"><span>Level: <strong>{LEVELS.find((item) => item.id === level)?.name}</strong></span><button className="text-button" type="button" onClick={finishSession}>Finish session</button></div>
        </div>
      )}

      {phase === "results" && result && (
        <div className="typing-results">
          <div className="typing-score"><span>Your speed</span><strong>{result.wpm}</strong><em>words per minute</em></div>
          <div className="typing-result-grid">
            <div><span>Accuracy</span><strong>{result.accuracy}%</strong></div>
            <div><span>Raw speed</span><strong>{result.rawWpm} WPM</strong></div>
            <div><span>Words completed</span><strong>{result.words}</strong></div>
            <div><span>Mistakes</span><strong>{result.mistakes}</strong></div>
          </div>
          <p className="typing-result-message">{LEVEL_MESSAGES[result.level]}</p>
          <section className="typing-ai-coach" aria-live="polite">
            <div className="typing-ai-coach-heading"><span aria-hidden="true">✦</span><div><small>AI practice coach</small><strong>{coachLoading ? "Reading your session…" : coach?.title}</strong></div></div>
            {coachLoading ? <div className="typing-coach-loading"><span /><span /><span /> Building your next round…</div> : coach && (
              <>
                <p>{coach.summary}</p>
                <ol>{coach.nextSteps?.map((step) => <li key={step}>{step}</li>)}</ol>
                <button className="typing-coach-level" type="button" onClick={() => { setLevel(coach.recommendedLevel); returnToSetup(); }}><span>Recommended next level</span><strong>{LEVELS.find((item) => item.id === coach.recommendedLevel)?.name || "Easy"} →</strong></button>
              </>
            )}
          </section>
          <div className="typing-result-actions"><button className="button button-primary" type="button" onClick={startSession}>Try again</button><button className="button button-secondary" type="button" onClick={returnToSetup}>Change level</button><Link className="text-link" href="/learn">Browse courses →</Link></div>
        </div>
      )}
    </section>
  );
}
