import Link from "next/link";
import { getAllLessons } from "@/lib/curriculum";

export const metadata = {
  title: "For educators",
  description: "Low-resource teaching tools, offline curriculum, assessments, and a ready-to-teach lesson-plan generator from Patchwork.",
};

export default function EducatorsPage() {
  const lessons = getAllLessons();
  return (
    <main id="main-content">
      <section className="educator-hero">
        <div className="container educator-hero-grid" data-reveal>
          <div>
            <p className="eyebrow" style={{ color: "var(--mint-300)" }}>Built with instructors</p>
            <h1>Spend less time formatting. More time teaching.</h1>
            <p>Patchwork turns the current curriculum into dependable offline lesson notes and gives instructors practical tools for classrooms with shared devices, limited materials, and inconsistent connectivity.</p>
            <Link className="button button-primary" href="/educators/lesson-planner">Generate a lesson plan</Link>
          </div>
          <div className="educator-points">
            <div className="educator-point"><strong>{lessons.length}</strong><span>Drive-grounded lecture summaries</span></div>
            <div className="educator-point"><strong>60m</strong><span>complete low-resource lesson plans</span></div>
            <div className="educator-point"><strong>0</strong><span>coding required to add a Markdown lesson</span></div>
            <div className="educator-point"><strong>3</strong><span>learner-facing study languages</span></div>
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="container">
          <div className="section-heading-row">
            <div><p className="eyebrow">Instructor toolkit</p><h2 className="section-title">Tools that respect your constraints.</h2><p className="section-intro">Every feature has a useful fallback when an API, printer, projector, or stable connection is unavailable.</p></div>
          </div>
          <div className="tool-grid">
            <article className="tool-card" data-reveal><h2>AI lesson-plan generator</h2><p>Enter a topic and grade level. Receive objectives, a timed sequence, materials, a student exercise, assessment, and adaptations for no internet or shared devices.</p><Link className="button button-primary" href="/educators/lesson-planner">Build a plan</Link></article>
            <article className="tool-card" data-reveal><h2>Pre/post skills assessment</h2><p>Capture a consistent baseline on day one, repeat it on the final day, and keep collecting responses even when the classroom connection drops.</p><Link className="button button-secondary" href="/assessment">Open assessment</Link></article>
            <article className="tool-card" data-reveal><h2>Markdown curriculum</h2><p>Every published lecture summary lives in <code>content/lessons</code>. Add a properly formatted Markdown file and it appears in the course library at the next build—no page code required.</p><a className="button button-secondary" href="https://github.com/KeshavBalak35/binarytree.platform" target="_blank" rel="noreferrer">View curriculum source ↗</a></article>
            <article className="tool-card" data-reveal><h2>Offline study materials</h2><p>Lesson notes, localized summaries, flashcards, and quizzes are prepared on the first visit so students can continue after the network drops.</p><Link className="button button-secondary" href="/study">Preview study tools</Link></article>
            <article className="tool-card" data-reveal><h2>Translation review workflow</h2><p>Swahili and French drafts are shown beside English source material and clearly marked for native-speaker review. The platform never represents an unreviewed draft as approved.</p><Link className="button button-secondary" href="/learn">Review curriculum</Link></article>
          </div>
        </div>
      </section>
    </main>
  );
}
