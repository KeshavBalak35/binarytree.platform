import { StudyWorkspace } from "@/components/study-workspace";
import { getAllLessons } from "@/lib/curriculum";

export const metadata = {
  title: "Study companion",
  description: "Ask grounded questions, review offline flashcards, and take practice quizzes for every Binary Tree lesson.",
};

export const dynamic = "force-static";

export default function StudyPage() {
  const lessons = getAllLessons().map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
    track: lesson.track,
    week: lesson.week,
    summary: lesson.summary,
    summarySw: lesson.summarySw,
    summaryFr: lesson.summaryFr,
    activity: lesson.activity,
    keyIdeas: lesson.keyIdeas,
    flashcards: lesson.flashcards,
    quiz: lesson.quiz,
  }));
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="container page-hero-grid" data-reveal>
          <div>
            <p className="eyebrow">Binary Tree study companion</p>
            <h1>Review the lesson. Then make it stick.</h1>
            <p>Ask a short grounded question when you are online. Flashcards, localized summaries, and instant-feedback quizzes remain available when you are not.</p>
          </div>
          <div className="page-hero-stat"><strong>{lessons.length}</strong><span>lesson contexts ready</span></div>
        </div>
      </section>
      <section className="study-page"><div className="container"><StudyWorkspace lessons={lessons} /></div></section>
    </main>
  );
}
