"use client";

import Link from "next/link";
import { useOverallProgress } from "@/lib/progress-store";

export function ProgressPreview({ tracks }) {
  const percent = useOverallProgress(tracks);
  const leaves = Array.from({ length: 12 }, (_, index) => index < Math.round(percent / (100 / 12)));
  return (
    <Link className="progress-preview" href="/progress" aria-label={`Open your progress tree, currently ${percent} percent complete`}>
      <div className="progress-preview-tree" aria-hidden="true">
        <span className="progress-preview-ground" />
        <span className="progress-preview-trunk" />
        <span className="progress-preview-branch branch-one" />
        <span className="progress-preview-branch branch-two" />
        <span className="progress-preview-branch branch-three" />
        <span className="progress-preview-leaves">{leaves.map((filled, index) => <i className={filled ? "is-grown" : ""} key={index} />)}</span>
      </div>
      <div><small>Your learning tree</small><strong>{percent}% grown</strong><span>See every branch →</span></div>
    </Link>
  );
}
