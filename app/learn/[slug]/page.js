import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ProgressButton } from "@/components/progress-button";
import { StudyCompanion } from "@/components/study-companion";
import { getAdjacentLessons, getAllLessons, getLessonBySlug, getTrackBySlug } from "@/lib/curriculum";
import { formatDuration } from "@/lib/format";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: lesson.title,
    description: lesson.summary,
    openGraph: { title: `${lesson.title} · BinaryTree`, description: lesson.summary },
  };
}

export default async function LessonPage({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();
  const track = getTrackBySlug(lesson.trackSlug);
  const { previous, next } = getAdjacentLessons(lesson.slug);
  const studyLesson = {
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary,
    summarySw: lesson.summarySw,
    summaryFr: lesson.summaryFr,
    activity: lesson.activity,
    keyIdeas: lesson.keyIdeas,
    flashcards: lesson.flashcards,
    quiz: lesson.quiz,
  };

  return (
    <main className="lesson-page" id="main-content">
      <div className="lesson-topline">
        <div className="container lesson-topline-inner">
          <span>Offline lesson · progress saves to this device</span>
          <Link href="/study">Open full study workspace →</Link>
        </div>
      </div>
      <div className="lesson-layout">
        <aside className="lesson-sidebar" aria-label="Course outline">
          <Link className="lesson-sidebar-back" href={`/learn?track=${track.slug}`}>← Course library</Link>
          <h2>{track.title}</h2>
          <p>{track.count} lessons in this track</p>
          <nav className="lesson-outline">
            {track.lessons.map((item) => (
              <Link className={`outline-link ${item.slug === lesson.slug ? "is-current" : ""}`} href={`/learn/${item.slug}`} aria-current={item.slug === lesson.slug ? "page" : undefined} key={item.slug}>
                <span className="outline-index">{String(item.week).padStart(2, "0")}</span>
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="lesson-main">
          <header className="lesson-heading">
            <div className="lesson-breadcrumb"><Link href="/learn">Courses</Link><span>/</span><span>{track.shortTitle}</span><span>/</span><span>Week {lesson.week}</span></div>
            <h1>{lesson.title}</h1>
            <p className="lesson-summary">{lesson.summary}</p>
            <div className="lesson-heading-meta">
              <span>{formatDuration(lesson.duration)}</span>
              <span>{lesson.level}</span>
              <span>Notes · flashcards · quiz</span>
              <span>English · Kiswahili · Français</span>
            </div>
          </header>

          <div className="lesson-content-layout">
            <div>
              <article className="lesson-article">
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
                <div className="translation-note"><strong>Translation status:</strong> {lesson.translationStatus}. The English notes are grounded in the source deck; localized summaries are clearly marked as drafts.</div>
                <div className="lesson-actions">
                  <a className="button button-secondary button-small" href={lesson.sourceUrl} target="_blank" rel="noreferrer">Open original lecture deck ↗</a>
                  <Link className="button button-ghost button-small" href="/study">Study in focused mode</Link>
                </div>
              </article>
              <nav className="lesson-nav" aria-label="Adjacent lessons">
                {previous ? <Link href={`/learn/${previous.slug}`}><span>Previous lesson</span><strong>← {previous.title}</strong></Link> : <span />}
                {next ? <Link href={`/learn/${next.slug}`}><span>Next lesson</span><strong>{next.title} →</strong></Link> : <span />}
              </nav>
            </div>

            <aside className="lesson-tools" aria-label="Lesson tools">
              <div className="lesson-tools-sticky">
                <div className="objectives-card">
                  <h2>By the end, you can…</h2>
                  <ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
                </div>
                <ProgressButton lessonSlug={lesson.slug} />
                <StudyCompanion lesson={studyLesson} />
                <div className="source-card">
                  <strong>Grounded curriculum</strong>
                  <p>These notes were written from the current BinaryTree Drive lecture. Use the source when you need the complete slide sequence.</p>
                  <a href={lesson.sourceUrl} target="_blank" rel="noreferrer">View source lecture ↗</a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
