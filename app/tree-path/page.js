import Link from "next/link";
import "./tree-path.css";
import { TreePathExplorer } from "@/components/tree-path-explorer";
import { getAllLessons } from "@/lib/curriculum";
import { TREE_PATH_NODES, TREE_PATH_TIERS } from "@/lib/tree-path";

export const metadata = {
  title: "TreePath curriculum",
  description: "Follow one prerequisite-driven Binary Tree curriculum from keyboard skills through machine learning and a final capstone.",
};

export const dynamic = "force-static";

function treePathCatalog() {
  const lessonMap = new Map(getAllLessons().map((lesson) => [lesson.slug, lesson]));
  return TREE_PATH_NODES.map((node) => ({
    ...node,
    lessons: node.lessonSlugs.map((slug) => lessonMap.get(slug)).filter(Boolean).map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      videoCheckpointCount: lesson.video?.checkpoints?.length || 0,
      quizTotal: lesson.quiz?.length || 0,
      projectCheckCount: lesson.projectCheckCount || 0,
    })),
  }));
}

export default function TreePathPage() {
  const nodes = treePathCatalog();
  return (
    <main id="main-content" className="treepath-page">
      <section className="treepath-hero">
        <div className="container">
          <div className="lesson-breadcrumb"><Link href="/">Home</Link><span>/</span><span>TreePath</span></div>
          <p className="eyebrow">One curriculum · prerequisites enforced</p>
          <h1>One tree. One clear next step.</h1>
          <p>Start with the roots and grow toward design, data, Python, machine learning, and personal brand. A node unlocks only when every prerequisite reaches 80%.</p>
          <div className="treepath-hero-rules"><span><strong>80%</strong> unlock threshold</span><span><strong>5</strong> connected tiers</span><span><strong>{nodes.length}</strong> prerequisite nodes</span></div>
        </div>
      </section>
      <section className="treepath-content"><div className="container"><TreePathExplorer tiers={TREE_PATH_TIERS} nodes={nodes} /></div></section>
    </main>
  );
}


