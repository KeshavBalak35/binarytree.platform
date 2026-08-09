"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { lessonProgressPercent, useProgressSnapshot } from "@/lib/progress-store";

const PLACEMENT_KEY = "binarytree-placement-v1";
const PLACEMENT_EVENT = "binarytree-placement-change";
const TYPING_KEY = "binarytree-typing-best-v1";
const TYPING_EVENT = "binarytree-typing-best";

function subscribe(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PLACEMENT_EVENT, onChange);
  window.addEventListener(TYPING_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(PLACEMENT_EVENT, onChange);
    window.removeEventListener(TYPING_EVENT, onChange);
  };
}

function readSignals() {
  let placement = -1;
  let typing = 0;
  try { placement = Number(JSON.parse(localStorage.getItem(PLACEMENT_KEY) || "null")?.percent ?? -1); } catch {}
  try { typing = Number(localStorage.getItem(TYPING_KEY) || 0); } catch {}
  return `${Number.isFinite(placement) ? placement : -1}:${Number.isFinite(typing) ? typing : 0}`;
}

export function PrerequisiteGate({ lessonSlug, nodes, children }) {
  const progress = useProgressSnapshot();
  const signal = useSyncExternalStore(subscribe, readSignals, () => "-1:0");
  const [placement, typing] = signal.split(":").map(Number);
  const target = nodes.find((node) => node.lessonSlugs.includes(lessonSlug));

  const result = useMemo(() => {
    const percentages = {};
    for (const node of nodes) {
      if (placement >= 80 && node.tier === 0) percentages[node.id] = 100;
      else if (node.id === "0.1") percentages[node.id] = Math.min(100, Math.round((typing / 40) * 100));
      else if (node.lessons.length) percentages[node.id] = Math.round(node.lessons.reduce((sum, lesson) => sum + lessonProgressPercent(lesson, progress), 0) / node.lessons.length);
      else percentages[node.id] = 0;
    }
    const missing = target?.prerequisites.filter((id) => (percentages[id] || 0) < 80) || [];
    return { percentages, missing };
  }, [nodes, placement, progress, target, typing]);

  if (!target || result.missing.length === 0) return children;

  return (
    <main id="main-content" className="prerequisite-page">
      <section className="prerequisite-card">
        <p className="eyebrow">TreePath prerequisite</p>
        <span className="prerequisite-lock" aria-hidden="true">○</span>
        <h1>This lesson comes later.</h1>
        <p>TreePath keeps the order simple. Reach 80% in {result.missing.length === 1 ? "this prerequisite" : "these prerequisites"} first:</p>
        <ul>{result.missing.map((id) => {
          const node = nodes.find((item) => item.id === id);
          return <li key={id}><span><strong>{node?.title || id}</strong><small>Node {id}</small></span><em>{result.percentages[id] || 0}% / 80%</em></li>;
        })}</ul>
        <div className="prerequisite-actions"><Link className="button button-primary" href="/tree-path">Go to my next step →</Link><Link className="button button-secondary" href="/learn">Browse course details</Link></div>
      </section>
    </main>
  );
}
