"use client";

import { useSyncExternalStore } from "react";

export const PROGRESS_STORAGE_KEY = "binarytree-progress-v3";
export const PROGRESS_CHANGE_EVENT = "binarytree-progress-v3-change";

const LEGACY_PROGRESS_KEY = "binarytree-progress-v2";
const LEGACY_QUIZ_PREFIX = "binarytree-quiz-";
const UNSET = Symbol("unset-progress-cache");

const EMPTY_VIDEO = Object.freeze({ checkpointIds: [], totalCheckpoints: 0, seconds: 0, complete: false });
const EMPTY_QUIZ = Object.freeze({ score: 0, answered: 0, total: 0 });
const EMPTY_PROJECT = Object.freeze({ passedCheckIds: [], totalChecks: 0, complete: false });
const EMPTY_LESSON = Object.freeze({
  completed: false,
  video: EMPTY_VIDEO,
  quiz: EMPTY_QUIZ,
  project: EMPTY_PROJECT,
  updatedAt: null,
});
const EMPTY_STATE = Object.freeze({ version: 3, lessons: Object.freeze({}), migratedLegacyAt: null });

let cachedRaw = UNSET;
let cachedState = EMPTY_STATE;
let migrationAttempted = false;
let browserListenersInstalled = false;
const listeners = new Set();

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function boundedInteger(value, maximum = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(maximum, Math.max(0, Math.floor(number)));
}

function uniqueIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .map((item) => String(item || "").trim().slice(0, 180))
    .filter(Boolean))]
    .slice(0, 500);
}

function validSlug(value) {
  const slug = String(value || "").trim().slice(0, 180);
  if (!slug || ["__proto__", "prototype", "constructor"].includes(slug)) return "";
  return slug;
}

function validDate(value) {
  const text = String(value || "");
  return Number.isFinite(Date.parse(text)) ? text : null;
}

function latestDate(...values) {
  return values
    .map(validDate)
    .filter(Boolean)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] || null;
}

function normalizeLessonProgress(value) {
  const source = asRecord(value);
  const video = asRecord(source.video);
  const quiz = asRecord(source.quiz);
  const project = asRecord(source.project);
  const checkpointIds = uniqueIds(video.checkpointIds);
  const passedCheckIds = uniqueIds(project.passedCheckIds);

  return {
    completed: Boolean(source.completed),
    video: {
      checkpointIds,
      totalCheckpoints: Math.max(checkpointIds.length, boundedInteger(video.totalCheckpoints, 500)),
      seconds: boundedInteger(video.seconds, 24 * 60 * 60),
      complete: Boolean(video.complete),
    },
    quiz: {
      score: boundedInteger(quiz.score, 1000),
      answered: boundedInteger(quiz.answered, 1000),
      total: boundedInteger(quiz.total, 1000),
    },
    project: {
      passedCheckIds,
      totalChecks: Math.max(passedCheckIds.length, boundedInteger(project.totalChecks, 500)),
      complete: Boolean(project.complete),
    },
    updatedAt: validDate(source.updatedAt),
  };
}

function normalizeState(value) {
  const source = asRecord(value);
  const lessons = {};
  for (const [candidateSlug, progress] of Object.entries(asRecord(source.lessons))) {
    const slug = validSlug(candidateSlug);
    if (slug) lessons[slug] = normalizeLessonProgress(progress);
  }
  return {
    version: 3,
    lessons,
    migratedLegacyAt: validDate(source.migratedLegacyAt),
  };
}

function readState() {
  if (!isBrowser()) return EMPTY_STATE;
  let raw = null;
  try {
    raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  } catch {
    return EMPTY_STATE;
  }
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  if (!raw) {
    cachedState = EMPTY_STATE;
    return cachedState;
  }
  try {
    cachedState = normalizeState(JSON.parse(raw));
  } catch {
    cachedState = EMPTY_STATE;
  }
  return cachedState;
}

function emitChange(detail = {}) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGE_EVENT, { detail }));
}

function persistState(value, detail = {}) {
  if (!isBrowser()) return false;
  const state = normalizeState(value);
  const raw = JSON.stringify(state);
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, raw);
  } catch {
    return false;
  }
  cachedRaw = raw;
  cachedState = state;
  emitChange(detail);
  return true;
}

function legacyQuizEntries() {
  const entries = [];
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key?.startsWith(LEGACY_QUIZ_PREFIX)) continue;
      const slug = validSlug(key.slice(LEGACY_QUIZ_PREFIX.length));
      if (!slug) continue;
      try {
        entries.push([slug, asRecord(JSON.parse(window.localStorage.getItem(key) || "{}"))]);
      } catch {}
    }
  } catch {}
  return entries;
}

function ensureLegacyMigration() {
  if (!isBrowser() || migrationAttempted) return;
  migrationAttempted = true;
  const current = readState();
  if (current.migratedLegacyAt) return;

  const lessons = { ...current.lessons };
  let legacyCompletion = {};
  try {
    legacyCompletion = asRecord(JSON.parse(window.localStorage.getItem(LEGACY_PROGRESS_KEY) || "{}"));
  } catch {}

  for (const [candidateSlug, legacy] of Object.entries(legacyCompletion)) {
    const slug = validSlug(candidateSlug);
    if (!slug) continue;
    const previous = normalizeLessonProgress(lessons[slug]);
    const source = asRecord(legacy);
    lessons[slug] = normalizeLessonProgress({
      ...previous,
      completed: previous.completed || Boolean(source.complete),
      updatedAt: latestDate(previous.updatedAt, source.updatedAt),
    });
  }

  for (const [slug, legacy] of legacyQuizEntries()) {
    const previous = normalizeLessonProgress(lessons[slug]);
    const score = Math.max(previous.quiz.score, boundedInteger(legacy.score, 1000));
    const answered = Math.max(previous.quiz.answered, boundedInteger(legacy.answered, 1000));
    lessons[slug] = normalizeLessonProgress({
      ...previous,
      quiz: { ...previous.quiz, score, answered, total: Math.max(previous.quiz.total, answered) },
      updatedAt: latestDate(previous.updatedAt, legacy.updatedAt),
    });
  }

  persistState({ version: 3, lessons, migratedLegacyAt: new Date().toISOString() }, { type: "legacy-migration" });
}

function notifySubscribers() {
  for (const listener of [...listeners]) listener();
}

function handleProgressEvent() {
  cachedRaw = UNSET;
  notifySubscribers();
}

function handleStorageEvent(event) {
  if (event.key !== PROGRESS_STORAGE_KEY && event.key !== LEGACY_PROGRESS_KEY && !event.key?.startsWith(LEGACY_QUIZ_PREFIX)) return;
  cachedRaw = UNSET;
  notifySubscribers();
}

function installBrowserListeners() {
  if (!isBrowser() || browserListenersInstalled) return;
  window.addEventListener("storage", handleStorageEvent);
  window.addEventListener(PROGRESS_CHANGE_EVENT, handleProgressEvent);
  browserListenersInstalled = true;
}

function removeBrowserListeners() {
  if (!isBrowser() || !browserListenersInstalled || listeners.size > 0) return;
  window.removeEventListener("storage", handleStorageEvent);
  window.removeEventListener(PROGRESS_CHANGE_EVENT, handleProgressEvent);
  browserListenersInstalled = false;
}

function subscribe(listener) {
  if (!isBrowser()) return () => {};
  listeners.add(listener);
  installBrowserListeners();
  ensureLegacyMigration();
  queueMicrotask(listener);
  return () => {
    listeners.delete(listener);
    removeBrowserListeners();
  };
}

function getServerSnapshot() {
  return EMPTY_STATE;
}

function updateLesson(lessonSlug, updater, changeType) {
  const slug = validSlug(lessonSlug);
  if (!slug || !isBrowser()) return EMPTY_LESSON;
  ensureLegacyMigration();
  const currentState = readState();
  const previous = normalizeLessonProgress(currentState.lessons[slug]);
  const nextLesson = normalizeLessonProgress({
    ...updater(previous),
    updatedAt: new Date().toISOString(),
  });
  persistState({
    ...currentState,
    lessons: { ...currentState.lessons, [slug]: nextLesson },
  }, { type: changeType, lessonSlug: slug });
  return nextLesson;
}

export function setLessonCompleted(lessonSlug, completed = true) {
  return updateLesson(lessonSlug, (previous) => ({ ...previous, completed: Boolean(completed) }), "lesson-completed");
}

export function recordVideoCheckpoint(lessonSlug, checkpointId, options = {}) {
  const id = String(checkpointId || "").trim().slice(0, 180);
  if (!id) return EMPTY_LESSON;
  const settings = typeof options === "number" ? { totalCheckpoints: options } : asRecord(options);
  return updateLesson(lessonSlug, (previous) => {
    const checkpointIds = uniqueIds([...previous.video.checkpointIds, id]);
    return {
      ...previous,
      video: {
        checkpointIds,
        totalCheckpoints: Math.max(checkpointIds.length, previous.video.totalCheckpoints, boundedInteger(settings.totalCheckpoints, 500)),
        seconds: Math.max(previous.video.seconds, boundedInteger(settings.seconds, 24 * 60 * 60)),
        complete: previous.video.complete,
      },
    };
  }, "video-checkpoint");
}

export function recordVideoComplete(lessonSlug, complete = true) {
  return updateLesson(lessonSlug, (previous) => ({
    ...previous,
    video: { ...previous.video, complete: Boolean(complete) },
  }), "video-completed");
}

export function setVideoProgress(lessonSlug, videoProgress = {}) {
  return updateLesson(lessonSlug, (previous) => {
    const checkpointIds = uniqueIds(videoProgress.checkpointIds ?? previous.video.checkpointIds);
    return {
      ...previous,
      video: {
        checkpointIds,
        totalCheckpoints: Math.max(checkpointIds.length, boundedInteger(videoProgress.totalCheckpoints ?? previous.video.totalCheckpoints, 500)),
        seconds: boundedInteger(videoProgress.seconds ?? previous.video.seconds, 24 * 60 * 60),
        complete: typeof videoProgress.complete === "boolean" ? videoProgress.complete : previous.video.complete,
      },
    };
  }, "video-progress");
}

export function setQuizProgress(lessonSlug, quizProgress = {}) {
  return updateLesson(lessonSlug, (previous) => ({
    ...previous,
    quiz: {
      score: boundedInteger(quizProgress.score ?? previous.quiz.score, 1000),
      answered: boundedInteger(quizProgress.answered ?? previous.quiz.answered, 1000),
      total: boundedInteger(quizProgress.total ?? previous.quiz.total, 1000),
    },
  }), "quiz-progress");
}

export function recordQuizProgress(lessonSlug, score, answered, total) {
  return setQuizProgress(lessonSlug, { score, answered, total });
}

export function recordProjectCheck(lessonSlug, checkId, options = {}) {
  const id = String(checkId || "").trim().slice(0, 180);
  if (!id) return EMPTY_LESSON;
  return updateLesson(lessonSlug, (previous) => {
    const passed = new Set(previous.project.passedCheckIds);
    if (options.passed === false) passed.delete(id);
    else passed.add(id);
    const passedCheckIds = uniqueIds([...passed]);
    const totalChecks = Math.max(passedCheckIds.length, previous.project.totalChecks, boundedInteger(options.totalChecks, 500));
    return {
      ...previous,
      project: {
        passedCheckIds,
        totalChecks,
        complete: typeof options.complete === "boolean"
          ? options.complete
          : totalChecks > 0 && passedCheckIds.length >= totalChecks,
      },
    };
  }, "project-check");
}

export function setProjectProgress(lessonSlug, projectProgress = {}) {
  return updateLesson(lessonSlug, (previous) => {
    const passedCheckIds = uniqueIds(projectProgress.passedCheckIds ?? previous.project.passedCheckIds);
    const totalChecks = Math.max(passedCheckIds.length, boundedInteger(projectProgress.totalChecks ?? previous.project.totalChecks, 500));
    return {
      ...previous,
      project: {
        passedCheckIds,
        totalChecks,
        complete: typeof projectProgress.complete === "boolean"
          ? projectProgress.complete
          : previous.project.complete,
      },
    };
  }, "project-progress");
}

export function recordProjectProgress(lessonSlug, passedCheckIds, totalChecks) {
  const ids = uniqueIds(passedCheckIds);
  const total = Math.max(ids.length, boundedInteger(totalChecks, 500));
  return setProjectProgress(lessonSlug, {
    passedCheckIds: ids,
    totalChecks: total,
    complete: total > 0 && ids.length >= total,
  });
}

export function toggleLessonComplete(lessonSlug) {
  return updateLesson(lessonSlug, (previous) => ({ ...previous, completed: !previous.completed }), "lesson-completed");
}

export function resetLessonProgress(lessonSlug) {
  const slug = validSlug(lessonSlug);
  if (!slug || !isBrowser()) return false;
  ensureLegacyMigration();
  const current = readState();
  const lessons = { ...current.lessons };
  delete lessons[slug];
  return persistState({ ...current, lessons }, { type: "lesson-reset", lessonSlug: slug });
}

export function resetAllProgress() {
  if (!isBrowser()) return false;
  migrationAttempted = true;
  return persistState({ version: 3, lessons: {}, migratedLegacyAt: new Date().toISOString() }, { type: "all-reset" });
}

export const progressActions = Object.freeze({
  setLessonCompleted,
  toggleLessonComplete,
  recordVideoCheckpoint,
  recordVideoComplete,
  setVideoProgress,
  setQuizProgress,
  recordQuizProgress,
  recordProjectCheck,
  setProjectProgress,
  recordProjectProgress,
  resetLessonProgress,
  resetAllProgress,
});

export function useProgressSnapshot() {
  return useSyncExternalStore(subscribe, readState, getServerSnapshot);
}

export function useLessonProgress(lessonSlug) {
  const snapshot = useProgressSnapshot();
  return snapshot.lessons[validSlug(lessonSlug)] || EMPTY_LESSON;
}

export function useProgressActions() {
  return progressActions;
}

export function useOverallProgress(catalog) {
  const snapshot = useProgressSnapshot();
  const tracks = Array.isArray(catalog) ? catalog : Array.isArray(catalog?.tracks) ? catalog.tracks : [];
  return overallProgressPercent(tracks, snapshot);
}

export function getLessonProgress(state, lessonSlug) {
  return normalizeLessonProgress(asRecord(state).lessons?.[validSlug(lessonSlug)]);
}

function configuredTotal(lesson, compactKey, nestedCollection, storedTotal) {
  const explicit = boundedInteger(lesson?.[compactKey], 1000);
  const nested = Array.isArray(nestedCollection) ? nestedCollection.length : 0;
  return Math.max(explicit, nested, boundedInteger(storedTotal, 1000));
}

function activityWeight(lesson, name) {
  const configured = Number(lesson?.mastery?.[`${name}Weight`]);
  return Number.isFinite(configured) && configured > 0 ? configured : 1;
}

export function lessonProgressBreakdown(lesson, state) {
  const progress = getLessonProgress(state, lesson?.slug);
  const videoTotal = configuredTotal(lesson, "videoCheckpointCount", lesson?.video?.checkpoints, progress.video.totalCheckpoints);
  const quizTotal = configuredTotal(lesson, "quizTotal", lesson?.quiz, progress.quiz.total);
  const projectTotal = configuredTotal(lesson, "projectCheckCount", lesson?.project?.tests, progress.project.totalChecks);

  return {
    completed: progress.completed,
    video: {
      complete: progress.video.complete ? videoTotal : Math.min(progress.video.checkpointIds.length, videoTotal),
      total: videoTotal,
      percent: videoTotal ? Math.round(((progress.video.complete ? videoTotal : Math.min(progress.video.checkpointIds.length, videoTotal)) / videoTotal) * 100) : null,
    },
    quiz: {
      score: Math.min(progress.quiz.score, quizTotal || progress.quiz.score),
      answered: Math.min(progress.quiz.answered, quizTotal || progress.quiz.answered),
      total: quizTotal,
      percent: quizTotal ? Math.round((Math.min(progress.quiz.answered, quizTotal) / quizTotal) * 100) : null,
    },
    project: {
      complete: progress.project.complete,
      passed: Math.min(progress.project.passedCheckIds.length, projectTotal || progress.project.passedCheckIds.length),
      total: projectTotal,
      percent: projectTotal
        ? Math.round(((progress.project.complete ? projectTotal : Math.min(progress.project.passedCheckIds.length, projectTotal)) / projectTotal) * 100)
        : null,
    },
    updatedAt: progress.updatedAt,
  };
}

export function lessonProgressPercent(lesson, state) {
  const breakdown = lessonProgressBreakdown(lesson, state);
  if (breakdown.completed) return 100;
  const activities = [
    ["video", breakdown.video.percent],
    ["quiz", breakdown.quiz.percent],
    ["project", breakdown.project.percent],
  ].filter(([, percent]) => percent !== null);
  if (!activities.length) return 0;
  const totalWeight = activities.reduce((total, [name]) => total + activityWeight(lesson, name), 0);
  return Math.round(activities.reduce((total, [name, percent]) => total + percent * activityWeight(lesson, name), 0) / totalWeight);
}

export function trackProgressPercent(track, state) {
  const lessons = Array.isArray(track?.lessons) ? track.lessons : [];
  if (!lessons.length) return 0;
  return Math.round(lessons.reduce((total, lesson) => total + lessonProgressPercent(lesson, state), 0) / lessons.length);
}

export function overallProgressPercent(tracks, state) {
  const seen = new Set();
  const lessons = [];
  for (const track of Array.isArray(tracks) ? tracks : []) {
    for (const lesson of Array.isArray(track?.lessons) ? track.lessons : []) {
      if (!lesson?.slug || seen.has(lesson.slug)) continue;
      seen.add(lesson.slug);
      lessons.push(lesson);
    }
  }
  if (!lessons.length) return 0;
  return Math.round(lessons.reduce((total, lesson) => total + lessonProgressPercent(lesson, state), 0) / lessons.length);
}

export function isLessonStarted(lesson, state) {
  const progress = getLessonProgress(state, lesson?.slug);
  return Boolean(
    progress.completed
    || progress.video.complete
    || progress.video.checkpointIds.length
    || progress.video.seconds
    || progress.quiz.answered
    || progress.project.passedCheckIds.length
    || progress.project.complete,
  );
}
