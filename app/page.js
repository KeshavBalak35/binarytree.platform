import Link from "next/link";
import { HomeCourseCard } from "@/components/home-course-card";
import { LearningNotebook } from "@/components/learning-notebook";
import { getAllLessons, getTracks } from "@/lib/curriculum";
import { PARTNERS, TEAM } from "@/lib/organization";

export const dynamic = "force-static";

function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

export default function HomePage() {
  const tracks = getTracks();
  const lessons = getAllLessons();
  const totalHours = Math.round(lessons.reduce((total, lesson) => total + lesson.duration, 0) / 60);

  return (
    <main id="main-content">
      <section className="hero">
        <span className="hero-ambient hero-ambient-one" aria-hidden="true" />
        <span className="hero-ambient hero-ambient-two" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-visual" data-reveal><LearningNotebook lessonCount={lessons.length} /></div>
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">Learning for real life</p>
            <h1 className="display-title">Useful skills, <span className="hero-word-highlight">one honest step at a time.</span></h1>
            <p className="lead">Free lessons in digital literacy, Python, machine learning, and entrepreneurship—made for real people, real classrooms, and internet that does not always cooperate.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/learn">Start learning <span aria-hidden="true">→</span></Link>
              <Link className="button button-secondary" href="/educators">For educators</Link>
            </div>
            <ul className="hero-benefits" aria-label="Platform benefits">
              <li><CheckIcon /> Begin without an account</li>
              <li><CheckIcon /> Keep progress on your device</li>
              <li><CheckIcon /> Use a phone or shared computer</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="trust-bar" aria-label="Curriculum summary">
        <div className="container trust-grid" data-reveal>
          <div><strong>{lessons.length}</strong><span>lessons made to use</span></div>
          <div><strong>{tracks.length}</strong><span>guided courses</span></div>
          <div><strong>{totalHours}+</strong><span>hours of learning</span></div>
          <div><strong>3</strong><span>study languages</span></div>
        </div>
      </section>

      <section className="home-section course-section" aria-labelledby="courses-heading">
        <span className="section-doodle section-doodle-one" aria-hidden="true">✦</span>
        <span className="section-doodle section-doodle-two" aria-hidden="true">~</span>
        <div className="container">
          <div className="section-heading-row" data-reveal>
            <div><p className="eyebrow">Choose a loose thread</p><h2 className="section-title" id="courses-heading">What do you want to get better at?</h2><p className="section-intro">Pick a path. Wander a little. Come back tomorrow. The lessons will meet you where you are.</p></div>
            <Link className="text-link" href="/learn">Explore every course <span aria-hidden="true">→</span></Link>
          </div>
          <div className="course-grid">{tracks.map((track, index) => <HomeCourseCard key={track.slug} track={track} index={index} />)}</div>
        </div>
      </section>

      <section className="home-section home-organization" aria-labelledby="home-organization-heading">
        <div className="container">
          <div className="section-heading-row" data-reveal><div><p className="eyebrow">The organization behind the lessons</p><h2 className="section-title" id="home-organization-heading">Built by people. Strengthened by partners.</h2><p className="section-intro">Binary Tree is more than a course library. It is a growing team and partner network working to make practical digital education reachable.</p></div></div>
          <div className="home-organization-grid">
            <Link className="home-organization-card home-team-card" href="/team" data-reveal><span className="organization-card-label">Our team</span><strong>{TEAM.length} leaders across education, technology, and international programs</strong><p>Meet the people responsible for the mission and the work.</p><span className="organization-card-link">Meet the team →</span></Link>
            <Link className="home-organization-card home-partner-card" href="/partners" data-reveal><span className="organization-card-label">Our partners</span><strong>{PARTNERS.length} organizations connecting learning with communities</strong><p>See the schools, nonprofits, and initiatives making delivery possible.</p><span className="organization-card-link">Explore the network →</span></Link>
            <Link className="home-organization-card home-apply-card" href="/apply" data-reveal><span className="organization-card-label">Join Binary Tree</span><strong>Have a skill that could move the mission forward?</strong><p>Apply directly through the official form on the website.</p><span className="organization-card-link">Start an application →</span></Link>
          </div>
        </div>
      </section>

      <section className="home-section assessment-invitation" aria-labelledby="assessment-invitation-heading">
        <div className="container assessment-invitation-inner" data-reveal>
          <span className="assessment-pencil-note" aria-hidden="true">before + after</span>
          <div>
            <p className="eyebrow">A useful starting point</p>
            <h2 className="section-title" id="assessment-invitation-heading">See what you know now. Notice what changes.</h2>
            <p className="section-intro">Take the same short skills check at the beginning and end of your program. If the connection drops, your response waits safely on this device.</p>
          </div>
          <Link className="button button-secondary" href="/assessment">Take the skills assessment <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="home-section home-section-soft typing-feature-section" aria-labelledby="typing-heading">
        <div className="organic-divider organic-divider-top" aria-hidden="true" />
        <div className="container typing-feature">
          <div className="typing-feature-copy" data-reveal>
            <p className="eyebrow">Skill practice</p>
            <h2 className="section-title" id="typing-heading">Find your rhythm at the keyboard.</h2>
            <p className="section-intro">Key Quest turns typing practice into a focused one-minute challenge with live speed, accuracy, and personal-best tracking. It works offline too.</p>
            <Link className="button button-primary" href="/typing">Start typing practice <span aria-hidden="true">→</span></Link>
          </div>
          <div className="typing-feature-demo" data-reveal aria-hidden="true">
            <span className="typing-demo-glow" />
            <div className="typing-demo-header"><span>KEY QUEST</span><span>00:42</span></div>
            <div className="typing-demo-metrics"><div><strong>31</strong><span>WPM</span></div><div><strong>97%</strong><span>ACCURACY</span></div></div>
            <p><span className="typed-text">learning a little </span><mark>e</mark>very day</p>
            <div className="typing-demo-caret" />
            <div className="typing-key-row"><span>A</span><span>S</span><span>D</span><span>F</span><span>J</span><span>K</span><span>L</span></div>
          </div>
        </div>
      </section>

      <section className="home-section approach-section" aria-labelledby="approach-heading">
        <div className="container approach-grid">
          <div data-reveal>
            <p className="eyebrow">A complete learning loop</p>
            <h2 className="section-title" id="approach-heading">Keep moving, without getting lost.</h2>
            <p className="section-intro">Every course follows a familiar rhythm, while each activity gives you room to explore.</p>
            <div className="approach-flourish" aria-hidden="true"><span /><span /><span /></div>
          </div>
          <ol className="approach-list">
            <li className="approach-item reveal-delay-1" data-reveal><span className="approach-number">1</span><div><small>Understand</small><h3>Learn the idea</h3><p>Read concise notes grounded in the original curriculum lecture.</p></div></li>
            <li className="approach-item reveal-delay-2" data-reveal><span className="approach-number">2</span><div><small>Experiment</small><h3>Practice it</h3><p>Complete a realistic activity with a phone, paper, or shared computer.</p></div></li>
            <li className="approach-item reveal-delay-3" data-reveal><span className="approach-number">3</span><div><small>Remember</small><h3>Check your understanding</h3><p>Use flashcards, quizzes, and the lesson-grounded study companion.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="cta-band"><div className="container cta-band-inner" data-reveal><span className="cta-orb cta-orb-one" aria-hidden="true" /><span className="cta-orb cta-orb-two" aria-hidden="true" /><div><p className="eyebrow">Your next step</p><h2>Turn curiosity into a skill.</h2><p>Pick something useful and begin with one focused lesson.</p></div><div className="cta-band-actions"><Link className="button button-light" href="/learn">Explore courses</Link><Link className="button button-outline-light" href="/study">Open study tools</Link></div></div></section>
    </main>
  );
}
