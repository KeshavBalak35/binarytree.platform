import { Suspense } from "react";
import { CurriculumCatalog } from "@/components/curriculum-catalog";
import { getAllLessons, getTracks } from "@/lib/curriculum";

export const metadata = {
  title: "Course library",
  description: "Browse Patchwork’s complete offline-ready curriculum in digital literacy, Python, machine learning, and entrepreneurship.",
};

export const dynamic = "force-static";

export default function LearnPage() {
  const tracks = getTracks();
  const lessons = getAllLessons();
  return (
    <main id="main-content">
      <section className="page-hero page-hero-compact">
        <div className="container page-hero-grid" data-reveal>
          <div><p className="eyebrow">Course library</p><h1>Learn a useful skill, step by step.</h1><p>Choose a complete pathway or find the lesson you need today. Every course includes clear notes, practical work, flashcards, and feedback.</p></div>
          <div className="page-hero-stat"><strong>{lessons.length}</strong><span>lessons ready on any device</span></div>
        </div>
      </section>
      <Suspense fallback={<div className="catalog-shell"><div className="container"><p className="catalog-count">Loading the curriculum…</p></div></div>}><CurriculumCatalog tracks={tracks} /></Suspense>
    </main>
  );
}
