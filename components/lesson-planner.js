"use client";

import { useMemo, useState } from "react";

function createLocalPlan(topic, grade, resources) {
  return {
    title: `${topic}: a practical 60-minute lesson`,
    overview: `A low-resource lesson for ${grade} that moves from prior knowledge to a shared demonstration, paired practice, and an individual exit check.`,
    objectives: [`Explain the central idea of ${topic} in plain language.`, `Apply ${topic} to one realistic example.`, "Show understanding through a short independent response."],
    materials: ["Board or large paper", "Pens or pencils", resources || "One shared device per small group (optional)", "Scrap paper for each learner"],
    timeline: [
      { minutes: "0–7", title: "Warm-up", description: `Ask learners where they have already encountered ${topic}. Collect three examples without correcting them yet.` },
      { minutes: "7–17", title: "Mini lesson", description: "Explain the core idea with one familiar local example. Keep devices closed so attention stays on the model and vocabulary." },
      { minutes: "17–27", title: "Shared demonstration", description: `Model one complete ${topic} task. Think aloud, pause before each step, and ask pairs to predict what comes next.` },
      { minutes: "27–45", title: "Paired practice", description: "Pairs rotate driver and navigator roles. With no devices, complete the same steps on paper and annotate each decision." },
      { minutes: "45–54", title: "Student exercise", description: `Each learner solves a new ${topic} example independently, then explains one decision to a partner.` },
      { minutes: "54–60", title: "Exit check", description: "Learners answer: What is it? When would you use it? What mistake should you avoid?" },
    ],
    exercise: `Create or analyze one small example of ${topic}. Label the important parts, explain your process in three steps, and write one way to check your result.`,
    assessment: "Use a three-point check: correct idea, workable process, and clear explanation. Re-teach any point missed by more than one-third of the group.",
    adaptations: ["No internet: use downloaded notes and paper examples.", "Shared computers: rotate driver and navigator roles.", "No printer: copy the task to the board.", "Mixed levels: give a worked example and an open-ended extension."],
  };
}

function planToText(plan) {
  return [
    plan.title,
    plan.overview,
    "\nOBJECTIVES",
    ...plan.objectives.map((item) => `- ${item}`),
    "\nMATERIALS",
    ...plan.materials.map((item) => `- ${item}`),
    "\nTIMELINE",
    ...plan.timeline.map((item) => `${item.minutes} | ${item.title}\n${item.description}`),
    "\nSTUDENT EXERCISE",
    plan.exercise,
    "\nASSESSMENT",
    plan.assessment,
    "\nLOW-RESOURCE ADAPTATIONS",
    ...plan.adaptations.map((item) => `- ${item}`),
  ].join("\n");
}

export function LessonPlanner() {
  const [topic, setTopic] = useState("Introduction to spreadsheets");
  const [grade, setGrade] = useState("Age 14 / Grade 8");
  const [resources, setResources] = useState("Shared computers, board, paper, pencils");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const planText = useMemo(() => plan ? planToText(plan) : "", [plan]);

  const generate = async (event) => {
    event.preventDefault();
    if (!topic.trim() || !grade.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await fetch("/api/ai/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, grade, resources }),
      });
      if (!response.ok) throw new Error("unavailable");
      const data = await response.json();
      setPlan(data.plan);
      setMessage(data.offline ? "Generated from the built-in low-resource template." : "Generated with AI and constrained for a low-resource classroom. Review before teaching.");
    } catch {
      setPlan(createLocalPlan(topic, grade, resources));
      setMessage("You are offline, so this plan uses the built-in low-resource template. It is ready to edit, copy, or print.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(planText);
      setMessage("Lesson plan copied to your clipboard.");
    } catch {
      setMessage("Copy was blocked by the browser. Select the plan text and copy it manually.");
    }
  };

  return (
    <div className="planner-layout" data-reveal>
      <form className="planner-form" onSubmit={generate}>
        <p className="eyebrow">60-minute plan</p>
        <h1>Build a ready-to-teach lesson.</h1>
        <p>The generator assumes limited internet, shared computers, and no guaranteed printer or projector.</p>
        <div className="form-field">
          <label htmlFor="topic">Topic</label>
          <input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Intro to spreadsheets" maxLength={180} required />
        </div>
        <div className="form-field">
          <label htmlFor="grade">Grade or age</label>
          <input id="grade" value={grade} onChange={(event) => setGrade(event.target.value)} placeholder="e.g. Age 14 / Grade 8" maxLength={80} required />
        </div>
        <div className="form-field">
          <label htmlFor="resources">Available resources</label>
          <textarea id="resources" value={resources} onChange={(event) => setResources(event.target.value)} placeholder="Shared computers, board, paper…" maxLength={500} />
          <span className="form-help">Be honest about what the classroom has. The activities adapt to these limits.</span>
        </div>
        <button className="button button-primary button-wide" disabled={loading} type="submit">{loading ? "Building your plan…" : "Generate lesson plan"}</button>
        {message && <div className="plan-notice" role="status">{message}</div>}
      </form>

      <section className="plan-output" aria-live="polite">
        {!plan ? (
          <div className="plan-empty"><div><div className="plan-empty-icon">✦</div><strong>Your complete lesson plan will appear here.</strong><p>Objectives, timing, activities, exercise, assessment, and low-resource adaptations are included every time.</p></div></div>
        ) : (
          <>
            <div className="plan-output-header">
              <div><p className="eyebrow">Binary Tree lesson plan</p><h2>{plan.title}</h2><p className="plan-output-subtitle">{plan.overview}</p></div>
              <div className="plan-toolbar"><button className="button button-secondary button-small" onClick={copy}>Copy</button><button className="button button-dark button-small" onClick={() => window.print()}>Print</button></div>
            </div>
            <div className="plan-section"><h3>Learning objectives</h3><ul>{plan.objectives.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="plan-section"><h3>Materials</h3><ul>{plan.materials.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="plan-section"><h3>60-minute sequence</h3><div className="timeline">{plan.timeline.map((item) => <div className="timeline-row" key={`${item.minutes}-${item.title}`}><span className="timeline-time">{item.minutes}</span><span className="timeline-title">{item.title}</span><p>{item.description}</p></div>)}</div></div>
            <div className="plan-section"><h3>Student exercise</h3><p>{plan.exercise}</p></div>
            <div className="plan-section"><h3>Assessment</h3><p>{plan.assessment}</p></div>
            <div className="plan-section"><h3>Low-resource adaptations</h3><ul>{plan.adaptations.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </>
        )}
      </section>
    </div>
  );
}
