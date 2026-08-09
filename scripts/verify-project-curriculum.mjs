import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getCodeProject } from "../lib/code-projects.js";
import { buildLessonMission, hasMissionForLesson, LESSON_MISSION_COUNT } from "../lib/lesson-missions.js";
import { getVideoCurriculum } from "../lib/video-curriculum.js";

const contentDirectory = path.join(process.cwd(), "content", "lessons");
const lessons = fs.readdirSync(contentDirectory).filter((name) => name.endsWith(".md")).map((name) => {
  const { data } = matter(fs.readFileSync(path.join(contentDirectory, name), "utf8"));
  return { ...data, slug: data.slug || name.replace(/\.md$/, ""), week: Number(data.week || 1) };
});

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

check(LESSON_MISSION_COUNT === 42, `Mission manifest has ${LESSON_MISSION_COUNT} entries instead of 42.`);
check(lessons.length === 42, `Curriculum has ${lessons.length} lessons instead of 42.`);

const titles = new Set();
let codeProjects = 0;
let workbookProjects = 0;
let videoLessons = 0;

for (const lesson of lessons) {
  const mission = buildLessonMission(lesson);
  const video = getVideoCurriculum(lesson.slug);
  const projectId = mission.codeProjectId;
  const project = projectId ? getCodeProject(projectId) : null;
  check(hasMissionForLesson(lesson.slug), `${lesson.slug} is missing a tailored mission.`);
  check(!titles.has(mission.title), `${lesson.slug} reuses the project title “${mission.title}”.`);
  titles.add(mission.title);
  check(mission.steps.length === 3, `${lesson.slug} needs exactly three project phases.`);
  check(mission.criteria.length >= 3, `${lesson.slug} needs at least three definition-of-done criteria.`);
  check(mission.deliverable?.length >= 45, `${lesson.slug} needs a specific deliverable.`);

  if (mission.kind === "code") {
    codeProjects += 1;
    check(Boolean(project), `${lesson.slug} is a coding project without a code studio.`);
    check(project?.tests?.length >= 4, `${lesson.slug} needs at least four objective code checks.`);
  } else {
    workbookProjects += 1;
    check(!project, `${lesson.slug} incorrectly points to a coding studio.`);
  }

  if (video) {
    videoLessons += 1;
    check(video.chapters?.length >= 2, `${lesson.slug} needs a chapter map.`);
    check(video.guide?.length >= 4, `${lesson.slug} needs at least four deep teaching sections.`);
    check(video.checkpoints?.length >= 3, `${lesson.slug} needs at least three interactive video checkpoints.`);
  }
}

check(codeProjects === 18, `Expected 18 coding projects, found ${codeProjects}.`);
check(workbookProjects === 24, `Expected 24 project workbooks, found ${workbookProjects}.`);
check(videoLessons === 37, `Expected 37 integrated video lessons, found ${videoLessons}.`);

if (failures.length) {
  console.error(`Project curriculum verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Verified ${lessons.length} lessons: ${videoLessons} video notebooks, ${codeProjects} checked coding projects, and ${workbookProjects} private project workbooks.`);
