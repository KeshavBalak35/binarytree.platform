import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { InteractiveVideo } from "@/components/interactive-video";
import { LectureGuide } from "@/components/lecture-guide";
import { LessonLanguageSwitcher } from "@/components/lesson-language-switcher";
import { LessonMission } from "@/components/lesson-mission";
import { LessonRoute } from "@/components/lesson-route";
import { ProgressButton } from "@/components/progress-button";
import { StudyCompanion } from "@/components/study-companion";
import { formatDuration } from "@/lib/format";

function CourseOutline({ track, lesson, mobile = false }) {
  return (
    <nav className={mobile ? "lesson-mobile-outline-links" : "lesson-outline"}>
      {track.lessons.map((item) => (
        <Link className={`${mobile ? "mobile-outline-link" : "outline-link"} ${item.slug === lesson.slug ? "is-current" : ""}`} href={`/learn/${item.slug}`} aria-current={item.slug === lesson.slug ? "page" : undefined} key={item.slug}>
          <span className="outline-index">{String(item.week).padStart(2, "0")}</span><span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}

export function LessonExperience({ lesson, track, previous, next }) {
  const studyLesson = {
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary,
    summarySw: lesson.summarySw,
    summaryFr: lesson.summaryFr,
    activity: lesson.activity,
    keyIdeas: lesson.keyIdeas,
    flashcards: lesson.flashcards,
    quiz: lesson.quiz,
    lectureGuide: lesson.video?.guide?.map(({ title, paragraphs, practice }) => ({ title, paragraphs, practice })) || [],
  };

  return (
    <main className="lesson-page" id="main-content">
      <div className="lesson-topline"><div className="container lesson-topline-inner"><span>Offline-ready notes · progress saves on this device</span><div><Link href="/lab">Project Library</Link><Link href="/study">Study workspace →</Link></div></div></div>
      <div className="lesson-layout">
        <aside className="lesson-sidebar" aria-label="Course outline">
          <Link className="lesson-sidebar-back" href={`/learn?track=${track.slug}`}>← Back to course</Link>
          <span className="lesson-sidebar-label">Course</span><h2>{track.title}</h2><p>{track.count} lessons</p>
          <CourseOutline track={track} lesson={lesson} />
        </aside>

        <div className="lesson-main">
          <header className="lesson-heading" data-reveal>
            <div className="lesson-breadcrumb"><Link href="/learn">Courses</Link><span>/</span><span>{track.shortTitle}</span><span>/</span><span>Lesson {lesson.week}</span></div>
            <p className="eyebrow">Lesson {lesson.week} of {track.count}</p><h1>{lesson.title}</h1>
            <LessonLanguageSwitcher summary={lesson.summary} summarySw={lesson.summarySw} summaryFr={lesson.summaryFr} translationStatus={lesson.translationStatus} />
            <div className="lesson-heading-meta"><span>{lesson.video ? `${lesson.video.durationLabel} lecture` : formatDuration(lesson.duration)}</span><span>{lesson.level}</span><span>{lesson.video ? `${lesson.video.chapters.length} video chapters` : "Detailed notes"}</span><span>1 project + {lesson.quiz.length} questions</span></div>
            {lesson.video && <div className="lesson-source-banner"><span>Official Binary Tree upload</span><strong>{lesson.video.title}</strong><small>Published {lesson.video.publishedAt} · embedded with chapters, checkpoints, deep notes, and a project</small></div>}
          </header>

          <LessonRoute lessonSlug={lesson.slug} hasVideo={Boolean(lesson.video)} quizTotal={lesson.quiz.length} projectTitle={lesson.mission.title} nextLesson={next ? { slug: next.slug, title: next.title } : null} />

          <details className="lesson-mobile-outline" data-reveal>
            <summary><span><small>Course outline</small><strong>{track.title}</strong></span><span aria-hidden="true">⌄</span></summary>
            <CourseOutline track={track} lesson={lesson} mobile />
          </details>

          {lesson.video && <div className="lesson-video-learning" id="watch" data-reveal><InteractiveVideo lessonSlug={lesson.slug} video={lesson.video} /></div>}
          {lesson.video ? <LectureGuide video={lesson.video} /> : <section className="lesson-reading-intro" id="guide"><p className="eyebrow">Detailed lesson</p><h2>Learn the ideas, then use them.</h2><p>Read the classroom walkthrough below. The project that follows turns the lesson into a concrete result.</p></section>}
          <LessonMission key={lesson.slug} lessonSlug={lesson.slug} mission={lesson.mission} project={lesson.project} />

          <div className="lesson-content-layout" data-reveal>
            <div>
              <article className="lesson-article">
                <details className="lesson-reference-notes" open={!lesson.video}>
                  <summary><span><small>{lesson.video ? "Offline reference" : "Complete walkthrough"}</small><strong>{lesson.video ? "Read the independent walkthrough and practice notes" : "Detailed notes, examples, and guided practice"}</strong></span><span aria-hidden="true">⌄</span></summary>
                  <div className="lesson-reference-notes-body"><ReactMarkdown>{lesson.content}</ReactMarkdown></div>
                </details>
                <div className="lesson-actions">{lesson.video && <a className="button button-secondary button-small" href={lesson.video.watchUrl} target="_blank" rel="noreferrer">Open lecture on YouTube ↗</a>}<a className="button button-ghost button-small" href={lesson.sourceUrl} target="_blank" rel="noreferrer">Open lecture deck ↗</a><Link className="button button-ghost button-small" href="/study">Study in focused mode</Link></div>
              </article>
              <nav className="lesson-nav" aria-label="Adjacent lessons">
                {previous ? <Link href={`/learn/${previous.slug}`}><span>Previous lesson</span><strong>← {previous.title}</strong></Link> : <span />}
                {next ? <Link href={`/learn/${next.slug}`}><span>Next lesson</span><strong>{next.title} →</strong></Link> : <span />}
              </nav>
            </div>

            <aside className="lesson-tools" id="study-tools" aria-label="Lesson tools"><div className="lesson-tools-sticky">
              <div className="objectives-card"><span className="card-kicker">Learning goals</span><h2>By the end, you can…</h2><ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></div>
              <div id="complete"><ProgressButton lessonSlug={lesson.slug} /></div>
              <StudyCompanion lesson={studyLesson} />
              <div className="source-card"><strong>Grounded curriculum</strong><p>{lesson.video ? "This chapter notebook and guide are mapped to the current Binary Tree video, with examples and practice added for independent learning." : "These notes were written from the current source lecture."}</p><a href={lesson.video?.watchUrl || lesson.sourceUrl} target="_blank" rel="noreferrer">View source lecture ↗</a></div>
            </div></aside>
          </div>
        </div>
      </div>
    </main>
  );
}
