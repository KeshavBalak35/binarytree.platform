import { APPLICATION_URL } from "@/lib/organization";

const EMBED_URL = `${APPLICATION_URL}?embedded=true`;

export const metadata = {
  title: "Apply to join",
  description: "Apply to contribute to Binary Tree’s education, curriculum, technology, open-source, partnership, and community programs.",
};

export default function ApplyPage() {
  return (
    <main id="main-content">
      <section className="organization-hero apply-hero">
        <div className="container organization-hero-grid" data-reveal>
          <div>
            <p className="eyebrow">Join Binary Tree</p>
            <h1>Bring the skill you have. Grow the impact with us.</h1>
            <p>We’re looking for thoughtful people who want to contribute to education, curriculum, international partnerships, AI, open source, hackathons, and community programs.</p>
          </div>
          <div className="apply-side-note"><span>Before you begin</span><ol><li>Tell us about yourself.</li><li>Share how you want to help.</li><li>Submit the form below.</li></ol></div>
        </div>
      </section>

      <section className="apply-intro">
        <div className="container apply-intro-grid">
          <article data-reveal><span>01</span><h2>Education and curriculum</h2><p>Help shape clear lessons, practice activities, translations, and learning experiences that work in real classrooms.</p></article>
          <article data-reveal><span>02</span><h2>Technology and open source</h2><p>Contribute to offline tools, AI features, accessible interfaces, and public projects other learners can build on.</p></article>
          <article data-reveal><span>03</span><h2>Programs and partnerships</h2><p>Support international relationships, community delivery, events, mentorship, and hackathons.</p></article>
        </div>
      </section>

      <section className="application-section" aria-labelledby="application-form-heading">
        <div className="container application-layout">
          <aside className="application-copy" data-reveal><p className="eyebrow">Official application</p><h2 id="application-form-heading">Apply to join Binary Tree.</h2><p>The application is embedded directly from our official Google Form. It requires an internet connection to load and submit.</p><a className="button button-secondary" href={APPLICATION_URL} target="_blank" rel="noreferrer">Open the form in a new tab ↗</a><p className="application-privacy">Your responses are collected through Google Forms and handled by the Binary Tree team.</p></aside>
          <div className="application-frame-wrap" data-reveal>
            <iframe className="application-frame" src={EMBED_URL} title="Binary Tree team application form" loading="lazy">Loading the Binary Tree application form…</iframe>
          </div>
        </div>
      </section>
    </main>
  );
}
