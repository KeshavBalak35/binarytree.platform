import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeLab } from "@/components/code-lab";
import { LessonMission } from "@/components/lesson-mission";
import { PythonLab } from "@/components/python-lab";
import { getAllLessons, getLessonBySlug } from "@/lib/curriculum";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson?.mission) return { title: "Project not found" };
  return { title: `${lesson.mission.title} — Project Library`, description: lesson.mission.deliverable };
}

export default async function LessonProjectPage({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson?.mission) notFound();
  const project = lesson.project;
  const isPython = project?.language === "python";

  return (
    <main id="main-content" className="lesson-lab-page">
      <div className="lesson-lab-topline"><div className="container"><Link href={`/learn/${lesson.slug}`}>← Back to the lesson</Link><span>Your work saves on this device</span><Link href="/lab">All 42 projects →</Link></div></div>
      <header className="lesson-lab-header">
        <div className="container lesson-lab-heading" data-reveal>
          <div><p className="eyebrow">{lesson.track} · Lesson {lesson.week} project</p><h1>{lesson.mission.title}</h1><p>{lesson.mission.deliverable}</p></div>
          <aside><span>Three project phases</span><ol>{lesson.mission.steps.map((step) => <li key={step.id}><strong>{step.title}</strong><small>{step.prompt}</small></li>)}</ol></aside>
        </div>
      </header>
      {project ? <section className="lesson-lab-studio"><div className="container">{isPython ? <PythonLab projectId={project.id} lessonSlug={lesson.slug} embedded /> : <CodeLab projectId={project.id} lessonSlug={lesson.slug} embedded showProjectPicker={false} />}</div></section> : <div className="container lesson-project-workbook"><LessonMission lessonSlug={lesson.slug} mission={lesson.mission} standalone /></div>}
      <section className="lesson-lab-reflection"><div className="container"><div><p className="eyebrow">Close the loop</p><h2>Explain what changed.</h2><p>After the checks pass, name one decision, one failure you corrected, and one improvement you would make next. That explanation is part of the project.</p></div><Link className="button button-primary" href={`/learn/${lesson.slug}`}>Return to the lesson</Link></div></section>
    </main>
  );
}
