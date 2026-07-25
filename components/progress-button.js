"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "binarytree-progress-v2";

function readCompletion(lessonSlug) {
  if (typeof window === "undefined") return false;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Boolean(stored[lessonSlug]?.complete);
  } catch {
    return false;
  }
}

export function ProgressButton({ lessonSlug }) {
  const complete = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("binarytree-progress", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("binarytree-progress", onStoreChange);
      };
    },
    () => readCompletion(lessonSlug),
    () => false,
  );

  const toggle = () => {
    const next = !complete;
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      stored[lessonSlug] = { ...(stored[lessonSlug] || {}), complete: next, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent("binarytree-progress", { detail: { lessonSlug, complete: next } }));
    } catch {}
  };

  return <button type="button" className={`progress-button ${complete ? "is-complete" : ""}`} onClick={toggle}>{complete ? "✓ Lesson complete" : "Mark lesson complete"}</button>;
}
