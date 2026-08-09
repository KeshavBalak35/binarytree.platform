import Link from "next/link";
import { CodeLab } from "@/components/code-lab";
import { getAllLessons } from "@/lib/curriculum";
import { getCodeProject } from "@/lib/code-projects";

export const metadata = {
  title: "Code Lab",
  description: "Build real Binary Tree curriculum projects in the browser, run them, check behavior, and get grounded coaching.",
};

export const dynamic = "force-static";

export default function CodeLabPage() {
  const projectLessons = getAllLessons()
    .filter((lesson) => lesson.video?.projectId)
    .map((lesson) => ({ lesson, project: getCodeProject(lesson.video.projectId) }));

  return (
    <main id="main-content" className="lab-page">
      <section className="page-hero lab-page-hero">
        <div className="container lab-hero-grid" data-reveal>
          <div><p className="eyebrow">Binary Tree Code Lab</p><h1>Learn it. Build it. Prove it works.</h1><p>Write real HTML, CSS, JavaScript, and Python in your browser. Every project has visible requirements, deterministic checks, progressive hints, and an AI coach that responds to your actual code.</p><div className="hero-actions"><a className="button button-primary" href="#curriculum-projects">Choose a curriculum project</a><a className="button button-secondary" href="#playground">Open the web playground</a></div></div>
          <div className="lab-hero-note"><span>How the studio works</span><ol><li>Predict before running</li><li>Build one behavior</li><li>Run objective checks</li><li>Use a hint from the failure</li><li>Explain the final result</li></ol></div>
        </div>
      </section>

      <section className="lab-project-section" id="curriculum-projects">
        <div className="container">
          <div className="section-heading-row"><div><p className="eyebrow">Lecture projects</p><h2 className="section-title">Projects tied to what you just learned.</h2></div><Link className="text-link" href="/progress">See your progress tree →</Link></div>
          <div className="lab-project-grid">
            {projectLessons.map(({ lesson, project }, index) => (
              <Link className="lab-project-card" href={`/lab/${lesson.slug}`} key={lesson.slug}>
                <span className="lab-project-number">{String(index + 1).padStart(2, "0")}</span>
                <div><small>{lesson.track} · Week {lesson.week}</small><h3>{project.title}</h3><p>{project.description}</p><ul>{project.skills.slice(0, 3).map((skill) => <li key={skill}>{skill}</li>)}</ul></div>
                <span className="lab-project-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="lab-playground-section" id="playground">
        <div className="container"><div className="lab-playground-intro"><p className="eyebrow">Open playground</p><h2>Experiment without waiting for a lesson.</h2><p>Choose a starter, change one layer at a time, and let the checks tell you what the browser can actually prove.</p></div><CodeLab /></div>
      </section>
    </main>
  );
}
