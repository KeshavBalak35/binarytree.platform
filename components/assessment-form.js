"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxFFr8a08b-4b_HZICjebMEIrec6wZHMxPFzldFqH0wBnvT-nMMqYRdlGOOzdQV5VcWOQ/exec";
const QUEUE_KEY = "binarytree-assessment-queue-v1";

const questions = [
  {
    id: "q1",
    prompt: "Which password is safest for an important account?",
    options: ["Keshav2026", "password123", "A long, unique passphrase", "The same password you use elsewhere"],
    answer: "A long, unique passphrase",
  },
  {
    id: "q2",
    prompt: "A message says your account will close unless you click a link now. What should you do first?",
    options: ["Click quickly", "Forward it to friends", "Verify the sender and visit the official site yourself", "Reply with your password"],
    answer: "Verify the sender and visit the official site yourself",
  },
  {
    id: "q3",
    prompt: "In a spreadsheet, what is the box where a row and column meet called?",
    options: ["A slide", "A cell", "A folder", "A browser"],
    answer: "A cell",
  },
  {
    id: "q4",
    prompt: "What does a variable do in a Python program?",
    options: ["Stores a value with a name", "Connects the computer to Wi-Fi", "Deletes every error", "Changes the keyboard layout"],
    answer: "Stores a value with a name",
  },
  {
    id: "q5",
    prompt: "Why should a machine-learning model be tested on data it did not train on?",
    options: ["To make the file larger", "To check whether it works on new examples", "To hide the labels", "To remove every pattern"],
    answer: "To check whether it works on new examples",
  },
  {
    id: "q6",
    prompt: "What helps a reader notice the most important information first?",
    options: ["Visual hierarchy", "More paragraphs", "Tiny type everywhere", "Using every color equally"],
    answer: "Visual hierarchy",
  },
  {
    id: "q7",
    prompt: "What is a useful early step when testing a business idea?",
    options: ["Build everything before talking to anyone", "Ask potential customers about the problem", "Copy the first competitor", "Spend the full budget on a logo"],
    answer: "Ask potential customers about the problem",
  },
  {
    id: "q8",
    prompt: "What is the main benefit of an offline-first learning tool?",
    options: ["It never needs a device", "Core learning can continue when the connection drops", "It makes every answer correct", "It removes the need to save work"],
    answer: "Core learning can continue when the connection drops",
  },
];

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function sendAssessment(payload) {
  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

function localLearningPlan(score) {
  return {
    title: score >= 7 ? "Strong foundation—choose a stretch lesson." : score >= 4 ? "You have a useful foundation to build on." : "Start with one small, practical skill.",
    summary: `You answered ${score} of ${questions.length} scored questions correctly. This is a starting point, not a label.`,
    nextSteps: ["Choose one lesson below.", "Complete its practice activity.", "Use the flashcards and quiz before moving on."],
    recommendations: [],
    offline: true,
  };
}

export function AssessmentForm() {
  const [online, setOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [learningPlan, setLearningPlan] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine) return;
    const queue = readQueue();
    if (!queue.length) {
      setQueueCount(0);
      return;
    }

    let sent = 0;
    for (const item of queue) {
      try {
        await sendAssessment(item);
        sent += 1;
      } catch {
        break;
      }
    }

    const remaining = queue.slice(sent);
    writeQueue(remaining);
    setQueueCount(remaining.length);
    if (sent > 0) setStatus(`${sent} saved ${sent === 1 ? "response" : "responses"} synced successfully.`);
  }, []);

  useEffect(() => {
    const updateConnection = () => {
      const nextOnline = navigator.onLine;
      setOnline(nextOnline);
      setQueueCount(readQueue().length);
      if (nextOnline) syncQueue();
    };
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, [syncQueue]);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const answers = Object.fromEntries(questions.map((question) => [question.id, data.get(question.id)]));
    answers.q9 = data.get("q9");
    const score = questions.reduce((total, question) => total + (answers[question.id] === question.answer ? 1 : 0), 0);
    const payload = {
      studentName: data.get("studentName"),
      cohort: data.get("cohort"),
      assessmentType: data.get("assessmentType"),
      score,
      total: questions.length,
      answers,
      submittedAt: new Date().toISOString(),
    };
    const missedSkills = questions.filter((question) => answers[question.id] !== question.answer).map((question) => question.prompt);
    const reflection = String(answers.q9 || "");

    setAssessmentResult({ score, total: questions.length });
    setLearningPlan(null);
    setSubmitting(true);
    setStatus("");
    try {
      if (navigator.onLine) {
        await sendAssessment(payload);
        setStatus("Assessment recorded. Thank you for taking the time to reflect.");
      } else {
        const queue = readQueue();
        queue.push(payload);
        writeQueue(queue);
        setQueueCount(queue.length);
        setStatus("Saved on this device. It will sync automatically when the internet returns.");
      }
      form.reset();
      document.querySelector(".assessment-status")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      const queue = readQueue();
      queue.push(payload);
      writeQueue(queue);
      setQueueCount(queue.length);
      setStatus("The connection wobbled, so your response is waiting safely on this device.");
      form.reset();
    } finally {
      setSubmitting(false);
    }

    setCoachLoading(true);
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "assessment", score, missedSkills, reflection }),
      });
      const plan = await response.json();
      if (!response.ok || !plan.title) throw new Error("unavailable");
      setLearningPlan(plan);
    } catch {
      setLearningPlan(localLearningPlan(score));
    } finally {
      setCoachLoading(false);
      window.setTimeout(() => document.querySelector(".assessment-ai-plan")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
  }

  return (
    <div className="assessment-shell" data-reveal>
      <div className={`connection-note ${online ? "is-online" : "is-offline"}`} role="status">
        <span aria-hidden="true">{online ? "●" : "↻"}</span>
        <div><strong>{online ? "Connected" : "Working offline"}</strong><small>{online ? "Your response can be recorded now." : "Submit normally—we will keep it on this device."}</small></div>
        {queueCount > 0 && <em>{queueCount} waiting to sync</em>}
      </div>

      {status && <div className="assessment-status" role="status" aria-live="polite"><span aria-hidden="true">✓</span><p>{status}</p></div>}

      {assessmentResult && (
        <section className="assessment-ai-plan" aria-live="polite">
          <div className="assessment-score-orb"><strong>{assessmentResult.score}</strong><span>out of {assessmentResult.total}</span></div>
          <div className="assessment-ai-content">
            <p className="eyebrow"><span aria-hidden="true">✦</span> Your AI learning plan</p>
            {coachLoading ? <div className="assessment-ai-loading"><span /><span /><span /> Building a private next-step plan from your results…</div> : learningPlan && (
              <>
                <h2>{learningPlan.title}</h2>
                <p>{learningPlan.summary}</p>
                <ol>{learningPlan.nextSteps?.map((step) => <li key={step}>{step}</li>)}</ol>
                {learningPlan.recommendations?.length > 0 ? (
                  <div className="assessment-recommendations">
                    {learningPlan.recommendations.map((lesson) => <Link href={`/learn/${lesson.slug}`} key={lesson.slug}><span><small>{lesson.track}</small><strong>{lesson.title}</strong><p>{lesson.reason}</p></span><span aria-hidden="true">→</span></Link>)}
                  </div>
                ) : <div className="assessment-plan-actions"><Link className="button button-primary button-small" href="/learn">Explore beginner lessons</Link><Link className="button button-secondary button-small" href="/study">Open study tools</Link></div>}
                <small className="assessment-ai-privacy">Your name and cohort are never sent to the AI. Only your score, missed topics, and learning goal are used for this plan.</small>
              </>
            )}
          </div>
        </section>
      )}

      <form className="assessment-form" onSubmit={handleSubmit}>
        <section className="assessment-paper assessment-identity">
          <span className="paper-tape" aria-hidden="true" />
          <div className="assessment-section-heading"><span>01</span><div><p className="eyebrow">About this check-in</p><h2>Start with the basics.</h2></div></div>
          <div className="assessment-field-grid">
            <label className="form-field"><span>Student full name</span><input name="studentName" autoComplete="name" required /></label>
            <label className="form-field"><span>Cohort ID or class name</span><input name="cohort" placeholder="e.g. Fall 2026" required /></label>
            <label className="form-field assessment-stage"><span>Assessment stage</span><select name="assessmentType" required defaultValue=""><option value="" disabled>Choose one</option><option value="Pre">Pre-assessment · Day 1</option><option value="Post">Post-assessment · Final day</option></select></label>
          </div>
        </section>

        <section className="assessment-paper assessment-questions">
          <div className="assessment-section-heading"><span>02</span><div><p className="eyebrow">Eight quick questions</p><h2>Choose the answer that feels right.</h2><p>Do this from what you know today. No searching needed.</p></div></div>
          <div className="question-stack">
            {questions.map((question, index) => (
              <fieldset className="assessment-question" key={question.id}>
                <legend><span>{String(index + 1).padStart(2, "0")}</span>{question.prompt}</legend>
                <div className="answer-options">
                  {question.options.map((option) => (
                    <label key={option}><input type="radio" name={question.id} value={option} required /><span>{option}</span></label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section className="assessment-paper assessment-reflection">
          <div className="assessment-section-heading"><span>03</span><div><p className="eyebrow">One last thought</p><h2>What would progress look like for you?</h2></div></div>
          <label className="form-field"><span className="sr-only">Reflection response</span><textarea name="q9" rows="5" placeholder="For example: I want to feel confident using a spreadsheet on my own…" required /></label>
          <p className="privacy-note"><span aria-hidden="true">⌁</span> If you submit offline, this response—including your name—stays in this browser until it can sync. Use a private device when possible.</p>
          <button className="button button-primary assessment-submit" type="submit" disabled={submitting}>{submitting ? "Saving your response…" : "Submit assessment"}<span aria-hidden="true">↗</span></button>
        </section>
      </form>
    </div>
  );
}
