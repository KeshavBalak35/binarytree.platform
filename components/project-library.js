"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getLessonProgress, useProgressSnapshot } from "@/lib/progress-store";

const FILTERS = [["all", "All projects"], ["code", "Code"], ["create", "Create"], ["analyze", "Analyze"], ["plan", "Plan"], ["practice", "Practice"]];

export function ProjectLibrary({ projects }) {
  const snapshot = useProgressSnapshot();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((item) => {
      if (filter !== "all" && item.kind !== filter) return false;
      return !needle || [item.title, item.lessonTitle, item.track, item.deliverable, item.format].join(" ").toLowerCase().includes(needle);
    });
  }, [filter, projects, query]);

  return (
    <div className="project-library">
      <div className="project-library-controls">
        <label><span className="sr-only">Search all projects</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, courses, or skills" /></label>
        <div className="project-filter-list" aria-label="Filter projects">{FILTERS.map(([value, label]) => <button className={filter === value ? "is-active" : ""} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div>
      </div>
      <p className="project-result-count" role="status">Showing {visible.length} of {projects.length} projects</p>
      <div className="project-library-grid">
        {visible.map((item) => {
          const progress = getLessonProgress(snapshot, item.slug);
          const passed = progress.project.passedCheckIds.length;
          const percent = progress.project.complete ? 100 : Math.round((Math.min(passed, item.checkCount) / item.checkCount) * 100);
          return (
            <Link className="project-library-card" href={`/lab/${item.slug}`} key={item.slug}>
              <div className="project-card-top"><span className={`project-kind project-kind-${item.kind}`}>{item.kind}</span><span>{percent ? `${percent}% complete` : `${item.estimatedMinutes} min`}</span></div>
              <small>{item.track} · Lesson {item.week}</small>
              <h3>{item.title}</h3>
              <p>{item.deliverable}</p>
              <div className="project-card-bottom"><span>{item.format}</span><strong>{item.hasCode ? "Open code studio" : "Open project workbook"} →</strong></div>
            </Link>
          );
        })}
      </div>
      {visible.length === 0 && <div className="project-library-empty"><h2>No projects match that search.</h2><p>Clear the search or choose a different project type.</p></div>}
    </div>
  );
}
