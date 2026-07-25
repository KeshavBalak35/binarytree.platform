import Link from "next/link";
import { getAllLessons, getTracks } from "@/lib/curriculum";
import { formatDuration } from "@/lib/format";

export const dynamic = "force-static";

const trackIcons = {
  "professional-foundations": "PF",
  "senegal-entrepreneurship": "SE",
  "personal-brand": "PB",
  "digital-literacy": "DL",
  "intermediate-python": "PY",
  "machine-learning": "ML",
  "data-and-design": "DD",
};

function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

function LearningPreview({ lessonCount }) {
  return (
    <div className="academy-preview" aria-label="Preview of a structured BinaryTree learning pathway">
      <div className="academy-preview-top">
        <span className="preview-brand-dot">B</span>
        <div><strong>Digital Literacy</strong><span>Foundational course</span></div>
        <span className="preview-progress-label">40%</span>
      </div>
      <div className="preview-progress"><span /></div>
      <div className="preview-unit-label">UNIT 1 · DIGITAL FOUNDATIONS</div>
      <div className="preview-lesson is-complete"><span><CheckIcon /></span><div><strong>Understanding the web</strong><small>Lesson complete</small></div></div>
      <div className="preview-lesson is-current"><span>2</span><div><strong>Files and folders</strong><small>Continue learning · 45 min</small></div><em>Continue</em></div>
      <div className="preview-lesson"><span>3</span><div><strong>Research and online safety</strong><small>Lesson · 60 min</small></div></div>
      <div className="preview-library-note"><strong>{lessonCount} lessons</strong><span>available online and offline</span></div>
    </div>
  );
}

function CourseCard({ track }) {
  return (
    <Link className="course-card" data-color={track.color} href={`/learn?track=${track.slug}`}>
      <span className="course-icon" aria-hidden="true">{trackIcons[track.slug] || "BT"}</span>
      <span className="course-card-body">
        <span className="course-card-eyebrow">{track.eyebrow}</span>
        <h3>{track.title}</h3>
        <p>{track.description}</p>
        <span className="course-card-meta">{track.count} lessons · {formatDuration(track.totalMinutes)}</span>
      </span>
      <span className="course-card-link" aria-hidden="true">›</span>
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
          <div className="hero-visual"><LearningPreview lessonCount={lessons.length} /></div>
          <div className="hero-copy">
            <p className="eyebrow">Practical learning for everyone</p>
            <h1 className="display-title">Learn skills that move you forward.</h1>
            <p className="lead">Free, structured lessons in digital literacy, Python, machine learning, and entrepreneurship—designed to work on any device and keep working offline.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/learn">Start learning</Link>
              <Link className="button button-secondary" href="/educators">For educators</Link>
            </div>
            <ul className="hero-benefits" aria-label="Platform benefits">
              <li><CheckIcon /> No account required</li>
              <li><CheckIcon /> Progress stays on your device</li>
              <li><CheckIcon /> Built for phones and shared computers</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="trust-bar" aria-label="Curriculum summary">
        <div className="container trust-grid">
          <div><strong>{lessons.length}</strong><span>complete lessons</span></div>
          <div><strong>{tracks.length}</strong><span>guided courses</span></div>
          <div><strong>{totalHours}+</strong><span>hours of learning</span></div>
          <div><strong>3</strong><span>study languages</span></div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="courses-heading">
        <div className="container">
          <div className="section-heading-row">
            <div><p className="eyebrow">Courses</p><h2 className="section-title" id="courses-heading">What do you want to learn?</h2><p className="section-intro">Choose a pathway and work through it one practical lesson at a time.</p></div>
            <Link className="text-link" href="/learn">Browse the full library <span aria-hidden="true">→</span></Link>
          </div>
          <div className="course-grid">{tracks.map((track) => <CourseCard key={track.slug} track={track} />)}</div>
        </div>
      </section>

      <section className="home-section home-section-soft" aria-labelledby="typing-heading">
        <div className="container typing-feature">
          <div className="typing-feature-copy">
            <p className="eyebrow">Skill practice</p>
            <h2 className="section-title" id="typing-heading">Build speed and confidence at the keyboard.</h2>
            <p className="section-intro">Key Quest turns typing practice into a focused one-minute challenge with live speed, accuracy, and personal-best tracking. It works offline too.</p>
            <Link className="button button-primary" href="/typing">Start typing practice</Link>
          </div>
          <div className="typing-feature-demo" aria-hidden="true">
            <div className="typing-demo-header"><span>KEY QUEST</span><span>00:42</span></div>
            <div className="typing-demo-metrics"><div><strong>31</strong><span>WPM</span></div><div><strong>97%</strong><span>ACCURACY</span></div></div>
            <p><span className="typed-text">learning a little </span><mark>e</mark>very day</p>
            <div className="typing-demo-caret" />
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="approach-heading">
        <div className="container approach-grid">
          <div>
            <p className="eyebrow">A complete learning loop</p>
            <h2 className="section-title" id="approach-heading">A clear path from lesson to practice.</h2>
            <p className="section-intro">Every course uses the same dependable rhythm, so you always know what to do next.</p>
          </div>
          <ol className="approach-list">
            <li className="approach-item"><span className="approach-number">1</span><div><h3>Learn the idea</h3><p>Read concise notes grounded in the original BinaryTree lecture.</p></div></li>
            <li className="approach-item"><span className="approach-number">2</span><div><h3>Practice it</h3><p>Complete a realistic activity with a phone, paper, or shared computer.</p></div></li>
            <li className="approach-item"><span className="approach-number">3</span><div><h3>Check your understanding</h3><p>Use flashcards, quizzes, and the lesson-grounded study companion.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="cta-band"><div className="container cta-band-inner"><div><h2>Anyone can make progress.</h2><p>Pick a useful skill and start with the first lesson.</p></div><div className="cta-band-actions"><Link className="button button-light" href="/learn">Explore courses</Link><Link className="button button-outline-light" href="/study">Open study tools</Link></div></div></section>
    </main>
  );
}
