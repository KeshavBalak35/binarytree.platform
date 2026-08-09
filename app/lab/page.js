import { CodeLab } from "@/components/code-lab";
import { ProjectLibrary } from "@/components/project-library";
import { getAllLessons } from "@/lib/curriculum";

export const metadata = {
  title: "Project Library",
  description: "One practical project for every Binary Tree lesson, with private workbooks and checked browser coding studios.",
};

export const dynamic = "force-static";

export default function ProjectLibraryPage() {
  const projects = getAllLessons().map((lesson) => ({
    slug: lesson.slug,
    lessonTitle: lesson.title,
    track: lesson.track,
    week: lesson.week,
    title: lesson.mission.title,
    kind: lesson.mission.kind,
    format: lesson.mission.format,
    deliverable: lesson.mission.deliverable,
    estimatedMinutes: lesson.mission.estimatedMinutes,
    checkCount: lesson.project?.tests.length || lesson.mission.steps.length,
    hasCode: Boolean(lesson.project),
  }));
  const codeCount = projects.filter((project) => project.hasCode).length;

  return (
    <main id="main-content" className="lab-page project-library-page">
      <section className="page-hero lab-page-hero">
        <div className="container lab-hero-grid" data-reveal>
          <div><p className="eyebrow">Binary Tree Project Library</p><h1>42 lessons. 42 things you can actually make.</h1><p>Every lesson ends with a specific deliverable. Plan, design, analyze, or code it; save your work on this device; then prove it meets a visible definition of done.</p><div className="hero-actions"><a className="button button-primary" href="#all-projects">Find your lesson project</a><a className="button button-secondary" href="#playground">Open the free code playground</a></div></div>
          <div className="lab-hero-note"><span>One repeatable learning loop</span><ol><li>Learn the lecture</li><li>Open its matching project</li><li>Complete three evidence phases</li><li>Run checks or use the rubric</li><li>Finish the lesson</li></ol><p><strong>{codeCount}</strong> checked coding studios · <strong>{projects.length - codeCount}</strong> private project workbooks</p></div>
        </div>
      </section>
      <section className="lab-project-section" id="all-projects"><div className="container"><div className="section-heading-row"><div><p className="eyebrow">All curriculum projects</p><h2 className="section-title">Choose the lesson you are working on.</h2><p>Search by course, topic, or deliverable. Your progress appears on each card.</p></div></div><ProjectLibrary projects={projects} /></div></section>
      <section className="lab-playground-section" id="playground"><div className="container"><div className="lab-playground-intro"><p className="eyebrow">Open web playground</p><h2>Experiment outside a lesson.</h2><p>Choose a starter, change one layer at a time, and let the checks show what the browser can prove.</p></div><CodeLab /></div></section>
    </main>
  );
}
