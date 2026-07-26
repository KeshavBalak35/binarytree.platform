import Link from "next/link";
import { getAllLessons, getTracks } from "@/lib/curriculum";

export const metadata = {
  title: "Our approach",
  description: "How Binary Tree designs practical, offline-first technology education for low-resource classrooms.",
};

export default function AboutPage() {
  const lessons = getAllLessons();
  const tracks = getTracks();
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="container page-hero-grid" data-reveal>
          <div><p className="eyebrow">Our approach</p><h1>Access is part of the curriculum.</h1><p>A lesson is not accessible if it disappears with the network, assumes one computer per learner, or needs equipment the classroom does not have. Binary Tree starts with those realities.</p></div>
          <div className="page-hero-stat"><strong>{tracks.length}</strong><span>practical learning pathways</span></div>
        </div>
      </section>
      <section className="home-section">
        <div className="container about-grid" data-reveal>
          <div className="about-card"><strong>{lessons.length}</strong><span>current, distinct lecture decks transformed into searchable notes, practice, flashcards, and quizzes—with direct source links for instructors.</span></div>
          <div><p className="eyebrow">Design principles</p><h2 className="section-title">Human learning is rarely a straight line.</h2><p className="section-intro">Binary Tree leaves room for wrong turns, shared screens, slower connections, and the small wins that make a skill stick.</p></div>
        </div>
      </section>
      <section className="home-section home-section-soft">
        <div className="container principles-grid">
          <article className="principle" data-reveal><strong>Offline by default</strong><p>The service worker prepares the course library and reusable study assets after the first online visit. Progress stays in local storage.</p></article>
          <article className="principle" data-reveal><strong>Grounded, not generic</strong><p>The study companion receives the selected lesson’s summary, key ideas, and activity. It is instructed to stay within that context.</p></article>
          <article className="principle" data-reveal><strong>Practice in the real setting</strong><p>Activities include paper-first and pair-work alternatives so the learning goal survives a missing device, printer, or connection.</p></article>
          <article className="principle" data-reveal><strong>Honest localization</strong><p>English notes include Swahili and French summary drafts. Every draft is visibly marked for native-speaker review before formal approval.</p></article>
          <article className="principle" data-reveal><strong>Maintainable content</strong><p>Lessons live as Markdown in the repository. New files are discovered at build time, keeping curriculum work separate from interface code.</p></article>
          <article className="principle" data-reveal><strong>Respectful AI</strong><p>AI features have fast deterministic fallbacks, protect server keys, constrain response length, and retain a meaningful offline experience.</p></article>
        </div>
      </section>
      <section className="cta-band"><div className="container cta-band-inner"><div><h2>Ready to see the complete curriculum?</h2><p>Choose any lesson—no sign-in required.</p></div><div className="cta-band-actions"><Link className="button button-dark" href="/learn">Browse courses</Link><Link className="button button-secondary" href="/educators">Educator tools</Link></div></div></section>
    </main>
  );
}
