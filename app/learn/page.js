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
  const progressTracks = tracks.map((track) => ({ ...track, lessons: track.lessons.map((lesson) => ({ slug: lesson.slug, videoCheckpointCount: lesson.video?.checkpoints?.length || 0, quizTotal: lesson.quiz?.length || 0, projectCheckCount: lesson.project?.tests?.length || 0 })) }));
  return (
    <main id="main-content">
      <section className="page-hero page-hero-compact">
        <div className="container page-hero-grid" data-reveal>
          <div><p className="eyebrow">Course library</p><h1>Learn a useful skill, step by step.</h1><p>Choose a complete pathway or find the lesson you need today. Every course includes clear notes, practical work, flashcards, and feedback.</p></div>
          <ProgressPreview tracks={progressTracks} />
        </div>
      </section>
      <Suspense fallback={<div className="catalog-shell"><div className="container"><p className="catalog-count">Loading the curriculum…</p></div></div>}><CurriculumCatalog tracks={tracks} /></Suspense>
    </main>
  );
}
