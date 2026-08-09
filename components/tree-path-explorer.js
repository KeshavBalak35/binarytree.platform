"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { lessonProgressPercent, useProgressSnapshot } from "@/lib/progress-store";

const PLACEMENT_KEY = "binarytree-placement-v1";
const PLACEMENT_EVENT = "binarytree-placement-change";
const TYPING_KEY = "binarytree-typing-best-v1";
const TYPING_EVENT = "binarytree-typing-best";
const BRANCHES = [
  { id: "design", label: "Design", color: "purple" },
  { id: "data", label: "Data + code", color: "blue" },
  { id: "brand", label: "Personal brand", color: "orange" },
];

function subscribeToSignals(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PLACEMENT_EVENT, onStoreChange);
  window.addEventListener(TYPING_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PLACEMENT_EVENT, onStoreChange);
    window.removeEventListener(TYPING_EVENT, onStoreChange);
  };
}

function getPlacementPercent() {
  try {
    const value = JSON.parse(localStorage.getItem(PLACEMENT_KEY) || "null");
    return Number.isFinite(Number(value?.percent)) ? Math.max(0, Math.min(100, Number(value.percent))) : -1;
  } catch {
    return -1;
  }
}

function getTypingWpm() {
  const value = Number(localStorage.getItem(TYPING_KEY) || 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function ancestorsFor(nodeId, nodeMap, found = new Set()) {
  const node = nodeMap.get(nodeId);
  if (!node) return found;
  for (const prerequisite of node.prerequisites) {
    if (found.has(prerequisite)) continue;
    found.add(prerequisite);
    ancestorsFor(prerequisite, nodeMap, found);
  }
  return found;
}

function branchLabel(branch) {
  return BRANCHES.find((item) => item.id === branch)?.label || "Core pathway";
}

function NodeCard({ node, status, nodeMap, progressState, focusedNode, setFocusedNode }) {
  const pathIds = focusedNode ? ancestorsFor(focusedNode, nodeMap) : new Set();
  const highlighted = focusedNode === node.id || pathIds.has(node.id);
  const muted = Boolean(focusedNode) && !highlighted;
  const nextLesson = node.lessons.find((lesson) => lessonProgressPercent(lesson, progressState) < 80) || node.lessons[0];
  const href = node.toolHref || (nextLesson ? `/learn/${nextLesson.slug}` : "/tree-path");
  const missing = node.prerequisites.filter((id) => (status.percentById[id] || 0) < 80);
  const complete = status.percent >= 80;

  return (
    <article
      className={`treepath-node is-${node.branch} ${complete ? "is-complete" : ""} ${status.unlocked ? "is-unlocked" : "is-locked"} ${highlighted ? "is-path" : ""} ${muted ? "is-muted" : ""}`}
      tabIndex={0}
      onPointerEnter={() => setFocusedNode(node.id)}
      onPointerLeave={() => setFocusedNode("")}
      onFocus={() => setFocusedNode(node.id)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedNode(""); }}
      data-node={node.id}
    >
      <div className="treepath-node-top">
        <span className="treepath-node-id">{node.id}</span>
        <span className="treepath-node-status">{status.placedOut ? "Placed out" : complete ? "Complete" : status.unlocked ? "Ready" : "Locked"}</span>
      </div>
      <h3>{node.title}</h3>
      <p>{node.summary}</p>
      <div className="treepath-node-meter"><span style={{ width: `${status.percent}%` }} /></div>
      <div className="treepath-node-meta"><span>{status.percent}%</span><span>{node.lessons.length || 1} {node.lessons.length === 1 ? "activity" : "activities"}</span></div>

      {status.unlocked ? (
        <Link className="treepath-node-action" href={href}>{complete ? "Review node" : status.percent > 0 ? "Continue node" : "Start node"} <span aria-hidden="true">→</span></Link>
      ) : (
        <p className="treepath-lock-copy"><span aria-hidden="true">○</span> Finish {missing.map((id) => nodeMap.get(id)?.title || id).join(" + ")} to 80%</p>
      )}

      <details className="treepath-node-details">
        <summary>What this includes <span aria-hidden="true">⌄</span></summary>
        {node.prerequisites.length > 0 && <p><strong>Prerequisites:</strong> {node.prerequisites.map((id) => nodeMap.get(id)?.title || id).join(" · ")}</p>}
        {node.lessons.length > 0 ? <ul>{node.lessons.map((lesson) => <li key={lesson.slug}><span>{lesson.title}</span><em>{lessonProgressPercent(lesson, progressState)}%</em></li>)}</ul> : <p>Complete the 40-WPM typing target and shortcut practice.</p>}
      </details>
    </article>
  );
}

export function TreePathExplorer({ tiers, nodes }) {
  const progressState = useProgressSnapshot();
  const placementPercent = useSyncExternalStore(subscribeToSignals, getPlacementPercent, () => -1);
  const typingWpm = useSyncExternalStore(subscribeToSignals, getTypingWpm, () => 0);
  const [focusedNode, setFocusedNode] = useState("");
  const placementPassed = placementPercent >= 80;
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const status = useMemo(() => {
    const percentById = {};
    for (const node of nodes) {
      if (placementPassed && node.tier === 0) {
        percentById[node.id] = 100;
      } else if (node.id === "0.1") {
        percentById[node.id] = Math.min(100, Math.round((typingWpm / 40) * 100));
      } else if (node.lessons.length) {
        percentById[node.id] = Math.round(node.lessons.reduce((total, lesson) => total + lessonProgressPercent(lesson, progressState), 0) / node.lessons.length);
      } else {
        percentById[node.id] = 0;
      }
    }
    const rows = Object.fromEntries(nodes.map((node) => [node.id, {
      percent: percentById[node.id],
      placedOut: placementPassed && node.tier === 0,
      unlocked: node.prerequisites.every((id) => (percentById[id] || 0) >= 80),
    }]));
    return { rows, percentById };
  }, [nodes, placementPassed, progressState, typingWpm]);

  const completedCount = nodes.filter((node) => status.percentById[node.id] >= 80).length;
  const overallPercent = Math.round(nodes.reduce((total, node) => total + status.percentById[node.id], 0) / nodes.length);
  const nextNode = nodes.find((node) => status.rows[node.id].unlocked && status.percentById[node.id] < 80) || nodes[nodes.length - 1];
  const nextLesson = nextNode.lessons.find((lesson) => lessonProgressPercent(lesson, progressState) < 80) || nextNode.lessons[0];
  const nextHref = nextNode.toolHref || (nextLesson ? `/learn/${nextLesson.slug}` : "/tree-path");

  return (
    <div className="treepath-shell">
      <section className="treepath-start" aria-labelledby="treepath-next-title">
        <div className="treepath-next-card">
          <p className="eyebrow">Your one next step</p>
          {placementPercent < 0 ? (
            <>
              <h2 id="treepath-next-title">Begin with the placement assessment.</h2>
              <p>It takes about ten minutes. Score 80% or higher to place out of the Roots tier, or start from Keyboard Mastery.</p>
              <div><Link className="button button-primary" href="/assessment">Take assessment →</Link><Link className="button button-secondary" href="/typing">Skip it and start at the roots</Link></div>
            </>
          ) : (
            <>
              <span className={`treepath-tier-chip is-${nextNode.branch}`}>Node {nextNode.id} · {branchLabel(nextNode.branch)}</span>
              <h2 id="treepath-next-title">{nextNode.title}</h2>
              <p>{nextNode.summary}</p>
              <div><Link className="button button-primary" href={nextHref}>{status.percentById[nextNode.id] > 0 ? "Continue this node" : "Start this node"} →</Link><a className="button button-ghost" href={`#node-${nextNode.id}`}>See it on the tree</a></div>
            </>
          )}
        </div>
        <aside className="treepath-summary" aria-label="TreePath progress summary">
          <div><strong>{overallPercent}%</strong><span>whole path</span></div>
          <div><strong>{completedCount}/{nodes.length}</strong><span>nodes complete</span></div>
          <div><strong>{placementPercent < 0 ? "—" : `${placementPercent}%`}</strong><span>placement score</span></div>
          <p>{placementPassed ? "Placement passed. Roots count as complete." : `Typing best: ${typingWpm} WPM · node target: 40 WPM.`}</p>
        </aside>
      </section>

      <div className="treepath-legend" aria-label="TreePath colors"><span><i className="is-foundation" />Roots + trunk</span><span><i className="is-data" />Data + code</span><span><i className="is-design" />Design</span><span><i className="is-brand" />Personal brand</span></div>

      <section className="treepath-tree" aria-label="Complete prerequisite learning tree">
        {tiers.map((tier) => {
          const tierNodes = nodes.filter((node) => node.tier === tier.id);
          const tierComplete = tierNodes.filter((node) => status.percentById[node.id] >= 80).length;
          const branchMode = tier.id >= 2;
          return (
            <section className={`treepath-tier tier-${tier.id} ${branchMode ? "is-branches" : "is-trunk"}`} key={tier.id}>
              <header>
                <span>Tier {tier.id}</span>
                <div><h2>{tier.name}</h2><p>{tier.subtitle} · {tier.description}</p></div>
                <strong>{tierComplete}/{tierNodes.length}</strong>
              </header>
              {branchMode ? (
                <div className="treepath-branch-grid">
                  {BRANCHES.map((branch) => {
                    const branchNodes = tierNodes.filter((node) => node.branch === branch.id || (node.branch === "crown" && branch.id === "data"));
                    return (
                      <div className={`treepath-branch-lane is-${branch.id}`} key={branch.id}>
                        <h3><span />{branch.label}</h3>
                        <div>{branchNodes.map((node) => <div id={`node-${node.id}`} key={node.id}><NodeCard node={node} status={{ ...status.rows[node.id], percentById: status.percentById }} nodeMap={nodeMap} progressState={progressState} focusedNode={focusedNode} setFocusedNode={setFocusedNode} /></div>)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="treepath-trunk-nodes">{tierNodes.map((node) => <div id={`node-${node.id}`} key={node.id}><NodeCard node={node} status={{ ...status.rows[node.id], percentById: status.percentById }} nodeMap={nodeMap} progressState={progressState} focusedNode={focusedNode} setFocusedNode={setFocusedNode} /></div>)}</div>
              )}
            </section>
          );
        })}
      </section>
    </div>
  );
}


