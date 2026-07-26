import Link from "next/link";
import { formatDuration } from "@/lib/format";

const TRACK_ICONS = {
  "professional-foundations": "PF",
  "senegal-entrepreneurship": "SE",
  "personal-brand": "PB",
  "digital-literacy": "DL",
  "intermediate-python": "PY",
  "machine-learning": "ML",
  "data-and-design": "DD",
};

export function HomeCourseCard({ track, index }) {
  return (
    <Link
      className={`course-card reveal-delay-${index % 4}`}
      data-color={track.color}
      data-reveal
      href={`/learn?track=${track.slug}`}
    >
      <span className="course-card-orbit" aria-hidden="true" />
      <span className="course-icon" aria-hidden="true">{TRACK_ICONS[track.slug] || "BT"}</span>
      <span className="course-card-body">
        <span className="course-card-eyebrow">{track.eyebrow}</span>
        <h3>{track.title}</h3>
        <p>{track.description}</p>
        <span className="course-card-meta">{track.count} lessons · {formatDuration(track.totalMinutes)}</span>
      </span>
      <span className="course-card-link" aria-hidden="true">↗</span>
    </Link>
  );
}
