import Link from "next/link";
import { getAllLessons } from "@/lib/curriculum";

export const dynamic = "force-static";

const steps = [
  { number: "01", title: "Take the assessment", copy: "A ten-minute baseline finds the right place to begin.", href: "/assessment", action: "Start assessment" },
  { number: "02", title: "Follow your TreePath", copy: "See one unlocked next step instead of guessing between courses.", href: "/tree-path", action: "Open TreePath" },
  { number: "03", title: "Learn, check, build", copy: "Reach 80% through video checks, practice, quizzes, and projects.", href: "/lab", action: "See projects" },
];

export default function HomePage() {
  const lessonCount = getAllLessons().length;
  return (
    <main id="main-content" className="guided-home">
      <section className="guided-hero">
        <div className="container guided-hero-grid">
          <div className="guided-hero-copy" data-reveal>
            <p className="eyebrow">Your guided learning path</p>
            <h1>Know exactly what to learn next.</h1>
            <p>Binary Tree turns practical digital skills into one connected path—from keyboard basics to design, coding, machine learning, and a final capstone.</p>
            <div className="guided-hero-actions"><Link className="button button-primary" href="/assessment">Take the starting assessment →</Link><Link className="button button-secondary" href="/tree-path">Open TreePath</Link></div>
            <ul><li>No account required</li><li>Works on phones and offline</li><li>80% unlocks the next node</li></ul>
          </div>
          <div className="home-tree-preview" aria-label="TreePath preview" data-reveal>
            <div className="home-tree-crown"><span>Design</span><span>Data + code</span><span>Personal brand</span></div>
            <div className="home-tree-tier"><small>Tier 4</small><strong>Crown</strong><em>Capstone</em></div>
            <div className="home-tree-tier"><small>Tier 3</small><strong>Canopy</strong><em>Advanced work</em></div>
            <div className="home-tree-tier"><small>Tier 2</small><strong>Branches</strong><em>Choose a direction</em></div>
            <div className="home-tree-tier is-trunk"><small>Tier 1</small><strong>Trunk</strong><em>Office core</em></div>
            <div className="home-tree-tier is-roots"><small>Tier 0</small><strong>Roots</strong><em>Start here</em></div>
          </div>
        </div>
      </section>
      <section className="guided-start" aria-labelledby="guided-start-title"><div className="container">
        <div className="guided-section-heading"><p className="eyebrow">The whole process</p><h2 id="guided-start-title">Three steps. No maze.</h2><p>You can always return to TreePath to find your next action.</p></div>
        <ol className="guided-step-grid">{steps.map((step) => <li key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p><Link href={step.href}>{step.action} →</Link></li>)}</ol>
      </div></section>
      <section className="guided-quick-links"><div className="container">
        <div className="guided-section-heading"><p className="eyebrow">Come here for something specific</p><h2>Everything else, kept out of your way.</h2></div>
        <div className="guided-link-grid">
          <Link href="/learn"><span>Course library</span><strong>Browse all {lessonCount} lessons</strong><em>→</em></Link>
          <Link href="/lab"><span>Project library</span><strong>Build and check your work</strong><em>→</em></Link>
          <Link href="/typing"><span>Typing practice</span><strong>Work toward 40 WPM</strong><em>→</em></Link>
          <Link href="/progress"><span>Progress</span><strong>Review your activity</strong><em>→</em></Link>
        </div>
      </div></section>
      <section className="guided-community"><div className="container guided-community-inner">
        <div><p className="eyebrow">The organization</p><h2>Built by people, strengthened by partners.</h2><p>Meet the team delivering practical digital education and the organizations helping it reach more communities.</p></div>
        <div><Link href="/team">Meet the team →</Link><Link href="/partners">See our partners →</Link><Link href="/apply">Apply to join →</Link></div>
      </div></section>
    </main>
  );
}
