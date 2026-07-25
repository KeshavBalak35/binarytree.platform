import { Suspense } from "react";
import { CurriculumCatalog } from "@/components/curriculum-catalog";
import { getAllLessons, getTracks } from "@/lib/curriculum";

export const metadata = {
  title: "Course library",
  description: "Browse BinaryTree’s complete offline-ready curriculum in digital literacy, Python, machine learning, and entrepreneurship.",
};

export const dynamic = "force-static";

export default function LearnPage() {
  const tracks = getTracks();
  const lessons = getAllLessons();
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <p className="eyebrow">Course library</p>
            <h1>Find your next useful skill.</h1>
            <p>Follow a complete pathway or choose the lesson you need today. Each lecture includes concise notes, practical work, flashcards, a quiz, and its original Drive source.</p>
          </div>
          <div className="page-hero-stat"><strong>{lessons.length}</strong><span>distinct current lectures</span></div>
        </div>
      </section>
      <Suspense fallback={<div className="catalog-shell"><div className="container"><p className="catalog-count">Loading the curriculum…</p></div></div>}>
        <CurriculumCatalog tracks={tracks} />
      </Suspense>
    </main>
  );
}
