import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeLab } from "@/components/code-lab";
import { PythonLab } from "@/components/python-lab";
import { getAllLessons, getLessonBySlug } from "@/lib/curriculum";
import { getCodeProject } from "@/lib/code-projects";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllLessons().filter((lesson) => lesson.video?.projectId).map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson?.video?.projectId) return { title: "Project not found" };
  const project = getCodeProject(lesson.video.projectId);
  return { title: `${project.title} — Code Lab`, description: project.description };
}

export default async function LessonLabPage({ params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson?.video?.projectId) notFound();
  const project = getCodeProject(lesson.video.projectId);
  const isPython = project.language === "python";

  return (
    <main id="main-content" className="lesson-lab-page">
      <div className="lesson-lab-topline"><div className="container"><Link href={`/learn/${lesson.slug}`}>← Back to the lesson</Link><span>Your draft and checks save on this device</span><Link href="/progress">Progress tree →</Link></div></div>
      <header className="lesson-lab-header">
        <div className="container lesson-lab-heading" data-reveal>
          <div><p className="eyebrow">{lesson.track} · Week {lesson.week} project</p><h1>{project.title}</h1><p>{project.description}</p></div>
          <aside><span>Definition of done</span><ol>{project.tests.map((test) => <li key={test.id}>{test.title}</li>)}</ol></aside>
        </div>
      </header>
      <section className="lesson-lab-studio"><div className="container">{isPython ? <PythonLab projectId={project.id} lessonSlug={lesson.slug} embedded /> : <CodeLab projectId={project.id} lessonSlug={lesson.slug} embedded showProjectPicker={false} />}</div></section>
      <section className="lesson-lab-reflection"><div className="container"><div><p className="eyebrow">Do not skip the explanation</p><h2>Can you defend what your code does?</h2><p>After every check passes, explain one decision, one failure you corrected, and one test you would add. That explanation is part of the project—not extra credit.</p></div><Link className="button button-primary" href={`/learn/${lesson.slug}`}>Return to the interactive lesson</Link></div></section>
    </main>
  );
}
