import { Suspense } from "react";
import { CurriculumCatalog } from "@/components/curriculum-catalog";
import { ProgressPreview } from "@/components/progress-preview";
import { getAllLessons, getTracks } from "@/lib/curriculum";

export const metadata = {
  title: "Course library",
  description: "Browse Binary Tree’s complete offline-ready curriculum in digital literacy, Python, machine learning, and entrepreneurship.",
};

export const dynamic = "force-static";

export default function LearnPage() {
  const tracks = getTracks();
  const lessons = getAllLessons();
  const progressTracks = tracks.map((track) => ({ ...track, lessons: track.lessons.map((lesson) => ({ slug: lesson.slug, videoCheckpointCount: lesson.video?.checkpoints?.length || 0, quizTotal: lesson.quiz?.length || 0, projectCheckCount: lesson.projectCheckCount || 0 })) }));
  const videoCount = lessons.filter((lesson) => lesson.video).length;
  return (
    <main id="main-content">
      <section className="page-hero page-hero-compact">
        <div className="container page-hero-grid" data-reveal>
          <div><p className="eyebrow">Your course map</p><h1>Choose one course. We will show you what to do next.</h1><p>Follow the numbered lessons in order. Each one uses the same simple routine: watch, learn, practice, check, and continue.</p><div className="learn-hero-proof"><span><strong>{tracks.length}</strong> clear courses</span><span><strong>{lessons.length}</strong> detailed lessons</span><span><strong>{videoCount}</strong> embedded lectures</span></div></div>
          <ProgressPreview tracks={progressTracks} />
        </div>
      </section>
      <Suspense fallback={<div className="catalog-shell"><div className="container"><p className="catalog-count">Loading your course map…</p></div></div>}><CurriculumCatalog tracks={tracks} /></Suspense>
    </main>
  );
}
