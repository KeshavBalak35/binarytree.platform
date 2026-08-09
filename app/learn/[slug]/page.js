import { notFound } from "next/navigation";
import { LessonExperience } from "@/components/lesson-experience";
import { getAdjacentLessons, getAllLessons, getLessonBySlug, getTrackBySlug } from "@/lib/curriculum";

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

export default async function LessonPage({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();
  const track = getTrackBySlug(lesson.trackSlug);
  const { previous, next } = getAdjacentLessons(lesson.slug);
  return <LessonExperience lesson={lesson} track={track} previous={previous} next={next} />;
}
