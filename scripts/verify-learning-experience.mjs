import { access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const videoModule = await import(pathToFileURL(path.join(root, "lib", "video-curriculum.js")));
const projectModule = await import(pathToFileURL(path.join(root, "lib", "code-projects.js")));
const videos = videoModule.VIDEO_CURRICULUM;
const projects = new Map(projectModule.CODE_PROJECTS.map((project) => [project.id, project]));
const errors = [];

const expected = {
  "professional-01-resumes-and-email": "lzYrX2LuPt0",
  "professional-02-social-media-safety": "U8sJOg0l8ZU",
  "professional-03-google-workspace": "8UJJE5f725A",
  "professional-04-workflow-automation": "rfx58lr4j6c",
  "professional-05-good-websites": "eRhl4WbfOvU",
  "professional-06-python-introduction": "ziOMNBODis0",
  "senegal-01-computer-skills": "od89YjT7TWU",
  "senegal-02-understanding-users": "q7zbSsHaNJc",
  "senegal-03-social-media-presence": "NAX9KoIdlR8",
  "senegal-04-ai-concepts": "85BPONtMbN0",
  "senegal-05-canva-design": "w4uuHq5Qex4",
  "senegal-06-personal-portfolio": "Bo1bYZhGwiY",
  "senegal-07-copyright": "0SxulzVBHe8",
  "senegal-08-cybersecurity": "3x8Rn4wNROk",
  "senegal-09-task-automation": "nlcbhV8r9hQ",
};

if (Object.keys(videos).length !== 15) errors.push(`expected 15 mapped recent videos, found ${Object.keys(videos).length}`);
const videoIds = new Set();

for (const [slug, youtubeId] of Object.entries(expected)) {
  const video = videos[slug];
  if (!video) {
    errors.push(`${slug}: missing video curriculum`);
    continue;
  }
  if (video.youtubeId !== youtubeId) errors.push(`${slug}: expected YouTube id ${youtubeId}, found ${video.youtubeId}`);
  if (videoIds.has(video.youtubeId)) errors.push(`${slug}: duplicate YouTube id ${video.youtubeId}`);
  videoIds.add(video.youtubeId);
  if (!/^2026-08-0[78]$/.test(video.publishedAt)) errors.push(`${slug}: unexpected publish date ${video.publishedAt}`);
  if (!Number.isInteger(video.durationSeconds) || video.durationSeconds < 60) errors.push(`${slug}: invalid duration`);
  if (!Array.isArray(video.chapters) || video.chapters.length < 7) errors.push(`${slug}: needs at least 7 timestamped chapters`);
  if (video.chapters?.some((chapter, index) => chapter.time < 0 || chapter.time >= video.durationSeconds || (index && chapter.time < video.chapters[index - 1].time))) errors.push(`${slug}: chapters must be sorted and inside the video`);
  if (!Array.isArray(video.checkpoints) || video.checkpoints.length < 3) errors.push(`${slug}: needs at least 3 interactive checkpoints`);
  if (video.checkpoints?.some((checkpoint) => checkpoint.choices?.length !== 4 || checkpoint.answer < 0 || checkpoint.answer > 3 || !checkpoint.explanation)) errors.push(`${slug}: malformed checkpoint`);
  if (!Array.isArray(video.guide) || video.guide.length < 4) errors.push(`${slug}: needs at least 4 deep-dive sections`);
  if (video.guide?.some((section) => section.paragraphs?.length < 2 || !section.example?.text || !section.practice)) errors.push(`${slug}: guide sections need explanation, example, and practice`);
  if (!Array.isArray(video.glossary) || video.glossary.length < 6) errors.push(`${slug}: needs at least 6 glossary terms`);
  if (!Array.isArray(video.misconceptions) || video.misconceptions.length < 3) errors.push(`${slug}: needs at least 3 misconception corrections`);
  if (!video.transferChallenge) errors.push(`${slug}: missing transfer challenge`);
  if (video.projectId) {
    const project = projects.get(video.projectId);
    if (!project) errors.push(`${slug}: unknown project ${video.projectId}`);
    else if (!Array.isArray(project.tests) || project.tests.length < 4) errors.push(`${slug}: project ${video.projectId} needs at least 4 deterministic checks`);
  }
  try { await access(path.join(root, "content", "lessons", `${slug}.md`)); } catch { errors.push(`${slug}: matching lesson file missing`); }
}

for (const slug of ["professional-02-social-media-safety", "professional-03-google-workspace"]) {
  if (!videos[slug]?.sourceNote?.includes("captions are disabled")) errors.push(`${slug}: visual-only evidence must be disclosed`);
}
if (!videos["senegal-07-copyright"]?.references?.some((reference) => reference.url.includes("senegalservices"))) errors.push("senegal-07-copyright: current official legal reference missing");
if (!projects.get("python-opportunity") || projects.get("python-opportunity")?.language !== "python") errors.push("runnable Python project missing");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Verified ${Object.keys(videos).length} recent videos, ${videoIds.size} unique YouTube ids, ${projects.size} code projects, detailed guides, interactive checkpoints, and lesson mappings.`);
