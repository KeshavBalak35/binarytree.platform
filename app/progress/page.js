import { ProgressTree } from "@/components/progress-tree";
import { getTracks } from "@/lib/curriculum";

export const metadata = {
  title: "Learning progress",
  description: "See your Binary Tree course and lesson progress grow in one private, device-based learning tree.",
};

export const dynamic = "force-static";

function progressCatalog() {
  return getTracks().map((track) => ({
    slug: track.slug,
    title: track.title,
    shortTitle: track.shortTitle,
    eyebrow: track.eyebrow,
    color: track.color,
    lessons: track.lessons.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title,
      week: lesson.week,
      videoCheckpointCount: Array.isArray(lesson.video?.checkpoints) ? lesson.video.checkpoints.length : 0,
      quizTotal: Array.isArray(lesson.quiz) ? lesson.quiz.length : 0,
      projectCheckCount: Array.isArray(lesson.project?.tests)
        ? lesson.project.tests.length
        : Array.isArray(lesson.project?.checks)
          ? lesson.project.checks.length
          : 0,
      mastery: lesson.mastery && typeof lesson.mastery === "object" ? {
        videoWeight: Number(lesson.mastery.videoWeight) || undefined,
        quizWeight: Number(lesson.mastery.quizWeight) || undefined,
        projectWeight: Number(lesson.mastery.projectWeight) || undefined,
      } : undefined,
    })),
  }));
}

export default function ProgressPage() {
  const tracks = progressCatalog();
  const lessonCount = tracks.reduce((total, track) => total + track.lessons.length, 0);

  return (
    <main id="main-content">
      <section className="page-hero page-hero-compact">
        <div className="container page-hero-grid" data-reveal>
          <div>
            <p className="eyebrow">Your progress</p>
            <h1>Watch your learning tree grow.</h1>
            <p>Every checkpoint, quiz, project check, and completed lesson adds color to your tree. No account is required—this view is private to this device.</p>
          </div>
          <div className="page-hero-stat"><strong>{lessonCount}</strong><span>lessons across {tracks.length} branches</span></div>
        </div>
      </section>
      <section className="study-page" aria-label="Learning progress dashboard">
        <div className="container"><ProgressTree tracks={tracks} /></div>
      </section>
    </main>
  );
}
