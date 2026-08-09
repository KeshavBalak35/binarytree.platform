import Link from "next/link";
import { Suspense } from "react";
import { CurriculumCatalog } from "@/components/curriculum-catalog";
import { getAllLessons, getTracks } from "@/lib/curriculum";

export const metadata = { title: "Course library", description: "Find a specific Binary Tree course or lesson." };
export const dynamic = "force-static";

export default function LearnPage() {
  const tracks = getTracks();
  const lessons = getAllLessons();
  return <main id="main-content">
    <section className="page-hero page-hero-compact simple-library-hero"><div className="container"><p className="eyebrow">Optional course library</p><h1>Looking for one specific subject?</h1><p>Browse all {tracks.length} courses and {lessons.length} lessons here. If you want Binary Tree to decide what comes next, use TreePath.</p><Link className="text-link" href="/tree-path">Follow my TreePath →</Link></div></section>
    <Suspense fallback={<div className="catalog-shell"><div className="container"><p>Loading courses…</p></div></div>}><CurriculumCatalog tracks={tracks} /></Suspense>
  </main>;
}
