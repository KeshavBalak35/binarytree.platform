import { notFound } from "next/navigation";
import { LessonExperience } from "@/components/lesson-experience";
import { PrerequisiteGate } from "@/components/prerequisite-gate";
import { getAdjacentLessons, getAllLessons, getLessonBySlug, getTrackBySlug } from "@/lib/curriculum";
import { TREE_PATH_NODES } from "@/lib/tree-path";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return { title: "Lesson not found" };
  return { title: lesson.title, description: lesson.summary, openGraph: { title: `${lesson.title} · Binary Tree`, description: lesson.summary } };
}

function prerequisiteCatalog() {
  const lessonMap = new Map(getAllLessons().map((lesson) => [lesson.slug, lesson]));
  return TREE_PATH_NODES.map((node) => ({
    id: node.id,
    tier: node.tier,
    title: node.title,
    prerequisites: node.prerequisites,
    lessonSlugs: node.lessonSlugs,
    lessons: node.lessonSlugs.map((slug) => lessonMap.get(slug)).filter(Boolean).map((item) => ({
      slug: item.slug,
      videoCheckpointCount: item.video?.checkpoints?.length || 0,
      quizTotal: item.quiz?.length || 0,
      projectCheckCount: item.projectCheckCount || 0,
    })),
  }));
}

export default async function LessonPage({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();
  const track = getTrackBySlug(lesson.trackSlug);
  const { previous, next } = getAdjacentLessons(lesson.slug);
  return <PrerequisiteGate lessonSlug={slug} nodes={prerequisiteCatalog()}><LessonExperience lesson={lesson} track={track} previous={previous} next={next} /></PrerequisiteGate>;
}
