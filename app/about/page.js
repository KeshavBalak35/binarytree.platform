import Link from "next/link";
import { getAllLessons, getTracks } from "@/lib/curriculum";

export const metadata = {
  title: "Our approach",
  description: "How BinaryTree designs practical, offline-first technology education for low-resource classrooms.",
};

export default function AboutPage() {
  const lessons = getAllLessons();
  const tracks = getTracks();
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div><p className="eyebrow">Our approach</p><h1>Access is part of the curriculum.</h1><p>A lesson is not accessible if it disappears with the network, assumes one computer per learner, or needs equipment the classroom does not have. BinaryTree starts with those realities.</p></div>
          <div className="page-hero-stat"><strong>{tracks.length}</strong><span>practical learning pathways</span></div>
        </div>
      </section>
      <section className="home-section">
        <div className="container about-grid">
          <div className="about-card"><strong>{lessons.length}</strong><span>current, distinct lecture decks transformed into searchable notes, practice, flashcards, and quizzes—with direct source links for instructors.</span></div>
          <div><p className="eyebrow">Design principles</p><h2 className="section-title">A professional platform, built around the learner.</h2><p className="section-intro">The visual system is deliberately calm and structured. The product behavior is optimized for small screens, slower connections, and independent review.</p></div>
        </div>
      </section>
      <section className="home-section home-section-soft">
        <div className="container principles-grid">
          <article className="principle"><strong>Offline by default</strong><p>The service worker prepares the course library and reusable study assets after the first online visit. Progress stays in local storage.</p></article>
          <article className="principle"><strong>Grounded, not generic</strong><p>The study companion receives the selected lesson’s summary, key ideas, and activity. It is instructed to stay within that context.</p></article>
          <article className="principle"><strong>Practice in the real setting</strong><p>Activities include paper-first and pair-work alternatives so the learning goal survives a missing device, printer, or connection.</p></article>
          <article className="principle"><strong>Honest localization</strong><p>English notes include Swahili and French summary drafts. Every draft is visibly marked for native-speaker review before formal approval.</p></article>
          <article className="principle"><strong>Maintainable content</strong><p>Lessons live as Markdown in the repository. New files are discovered at build time, keeping curriculum work separate from interface code.</p></article>
          <article className="principle"><strong>Respectful AI</strong><p>AI features have fast deterministic fallbacks, protect server keys, constrain response length, and retain a meaningful offline experience.</p></article>
        </div>
      </section>
      <section className="cta-band"><div className="container cta-band-inner"><div><h2>Ready to see the complete curriculum?</h2><p>Choose any lesson—no sign-in required.</p></div><div className="cta-band-actions"><Link className="button button-dark" href="/learn">Browse courses</Link><Link className="button button-secondary" href="/educators">Educator tools</Link></div></div></section>
    </main>
  );
}
