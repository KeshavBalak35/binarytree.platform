import Link from "next/link";
import { getAllLessons, getTracks } from "@/lib/curriculum";
import { formatDuration } from "@/lib/format";

export const dynamic = "force-static";

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CourseCard({ track }) {
  return (
    <Link className="course-card" data-color={track.color} href={`/learn?track=${track.slug}`}>
      <span className="course-card-eyebrow">{track.eyebrow}</span>
      <h3>{track.title}</h3>
      <p>{track.description}</p>
      <div className="course-card-meta">
        <span>{track.count} lessons</span>
        <span>{formatDuration(track.totalMinutes)}</span>
      </div>
      <span className="course-card-link">Explore this course →</span>
    </Link>
  );
}

export default function HomePage() {
  const tracks = getTracks();
  const lessons = getAllLessons();
  const totalHours = Math.round(lessons.reduce((total, lesson) => total + lesson.duration, 0) / 60);

  return (
    <main id="main-content">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Offline-first technology education</p>
            <h1 className="display-title">Skills that keep opening doors.</h1>
            <p className="lead">
              Learn digital literacy, Python, machine learning, and entrepreneurship through practical lessons designed for shared computers and unreliable internet.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/learn">Browse all courses</Link>
              <Link className="button button-secondary" href="/educators">I’m an educator</Link>
            </div>
            <div className="hero-note"><CheckIcon /> Load it once. Keep every lesson, flashcard, and practice quiz available offline.</div>
          </div>
          <div className="learning-map" aria-label="A learning map showing a path from digital foundations to Python and artificial intelligence">
            <div className="map-orbit" />
            <span className="map-branch map-branch-one" />
            <span className="map-branch map-branch-two" />
            <span className="map-branch map-branch-three" />
            <div className="map-card map-card-one">
              <strong>Digital foundations</strong>
              <span>Research · files · online safety</span>
              <em>Start here</em>
            </div>
            <div className="map-card map-card-two">
              <strong>Build with Python</strong>
              <span>Logic · data · APIs · projects</span>
              <em>Practice by doing</em>
            </div>
            <div className="map-card map-card-three">
              <strong>Understand AI</strong>
              <span>Data · models · responsible use</span>
              <em>Go further</em>
            </div>
            <div className="map-center"><div><strong>{lessons.length}</strong><span>real lessons</span></div></div>
          </div>
        </div>
      </section>

      <section className="trust-bar" aria-label="Curriculum summary">
        <div className="container trust-grid">
          <div className="trust-statement">One complete library, built from BinaryTree’s current curriculum decks—not demo content.</div>
          <div><strong>{tracks.length}</strong><span>guided learning tracks</span></div>
          <div><strong>{totalHours}+</strong><span>hours of instruction</span></div>
          <div><strong>3</strong><span>supported study languages</span></div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="courses-heading">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Choose your path</p>
              <h2 className="section-title" id="courses-heading">A curriculum with a next step.</h2>
              <p className="section-intro">Each track turns a set of classroom decks into concise notes, grounded practice, flashcards, and feedback you can use on your own.</p>
            </div>
            <Link className="button button-secondary" href="/learn">View the full library</Link>
          </div>
          <div className="course-grid">
            {tracks.map((track) => <CourseCard key={track.slug} track={track} />)}
          </div>
        </div>
      </section>

      <section className="home-section home-section-soft" aria-labelledby="approach-heading">
        <div className="container approach-grid">
          <div className="approach-visual" aria-hidden="true">
            <div className="approach-screen">
              <div className="approach-screen-top"><span /><span /><span /></div>
              <div className="approach-screen-content">
                <div className="screen-sidebar">
                  <span className="screen-line short" /><span className="screen-line" /><span className="screen-line" /><span className="screen-line short" />
                </div>
                <div className="screen-main">
                  <span className="screen-line short" /><span className="screen-line blue" /><span className="screen-line" /><span className="screen-line mint" />
                </div>
              </div>
            </div>
            <div className="offline-badge"><span /> Ready without internet</div>
          </div>
          <div>
            <p className="eyebrow">Designed for the real classroom</p>
            <h2 className="section-title" id="approach-heading">Serious learning, even when connectivity is not.</h2>
            <div className="approach-list">
              <div className="approach-item"><span className="approach-number">01</span><div><h3>Grounded in the lesson</h3><p>Every summary and study prompt stays tied to the selected BinaryTree lecture, with a direct link back to its source deck.</p></div></div>
              <div className="approach-item"><span className="approach-number">02</span><div><h3>Practice before polish</h3><p>Short explanations lead into a realistic task that works with paper, a phone, or a shared computer—not expensive equipment.</p></div></div>
              <div className="approach-item"><span className="approach-number">03</span><div><h3>Built to come back to</h3><p>Progress, flashcards, and quiz results stay on the device. The whole learning library is warmed for offline use after the first visit.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2>Start with one lesson. Leave with a skill you can use.</h2>
            <p>No account required. Progress is saved on this device.</p>
          </div>
          <div className="cta-band-actions">
            <Link className="button button-dark" href="/learn">Start learning</Link>
            <Link className="button button-secondary" href="/study">Open study tools</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
