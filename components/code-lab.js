"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_WEB_CODE_PROJECTS, DEFAULT_CODE_PROJECT_ID, getCodeProject } from "@/lib/code-projects";
import { recordProjectProgress } from "@/lib/progress-store";

const FILE_TABS = [
  { id: "html", label: "HTML", extension: "index.html" },
  { id: "css", label: "CSS", extension: "styles.css" },
  { id: "js", label: "JavaScript", extension: "script.js" },
];
const MESSAGE_CHANNEL = "binarytree-code-lab";

function copyFiles(files) {
  return {
    html: String(files?.html || ""),
    css: String(files?.css || ""),
    js: String(files?.js || ""),
  };
}

function escapeClosingScript(value) {
  return String(value || "").replace(/<\/script/gi, "<\\/script");
}

function previewBridge() {
  return `(function () {
    const channel = ${JSON.stringify(MESSAGE_CHANNEL)};
    const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

    async function runTest(test) {
      const element = test.selector ? document.querySelector(test.selector) : null;
      if (test.kind === "dom-exists") return Boolean(element);
      if (test.kind === "dom-count") return document.querySelectorAll(test.selector).length >= Number(test.minimum || 1);
      if (test.kind === "dom-attribute") return Boolean(element) && element.getAttribute(test.attribute) === String(test.expected);
      if (test.kind === "click-changes-text") {
        const target = document.querySelector(test.target);
        if (!element || !target) return false;
        const before = target.textContent.trim();
        element.click();
        await wait(80);
        const after = target.textContent.trim();
        return Boolean(after) && after !== before;
      }
      if (test.kind === "click-number-increases") {
        const target = document.querySelector(test.target);
        if (!element || !target) return false;
        const before = Number.parseFloat(target.textContent);
        element.click();
        await wait(80);
        const after = Number.parseFloat(target.textContent);
        return Number.isFinite(before) && Number.isFinite(after) && after > before;
      }
      return false;
    }

    window.addEventListener("message", async (event) => {
      const data = event.data || {};
      if (event.source !== window.parent || data.channel !== channel || data.type !== "run-tests") return;
      const results = [];
      for (const test of Array.isArray(data.tests) ? data.tests : []) {
        try {
          results.push({ id: test.id, passed: await runTest(test) });
        } catch {
          results.push({ id: test.id, passed: false });
        }
      }
      window.parent.postMessage({ channel, type: "test-results", requestId: data.requestId, results }, "*");
    });

    window.parent.postMessage({ channel, type: "ready" }, "*");
  })();`;
}

function buildDocument(files, { includeBridge = true, title = "Binary Tree Code Lab project" } = {}) {
  const bridge = includeBridge ? `<script>${escapeClosingScript(previewBridge())}</scr` + `ipt>` : "";
  const userScript = `<script>${escapeClosingScript(files.js)}</scr` + `ipt>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; font-src data:; media-src data: blob:">
  <title>${String(title).replace(/[<>&]/g, "")}</title>
  <style>${String(files.css || "").replace(/<\/style/gi, "<\\/style")}</style>
</head>
<body>
${files.html}
${userScript}
${bridge}
</body>
</html>`;
}

function obviousInfiniteLoop(code) {
  return /while\s*\(\s*(?:true|1)\s*\)|for\s*\(\s*;\s*;\s*\)/i.test(code);
}

function runSourceTests(tests, files) {
  return tests.filter((test) => test.kind === "source-regex").map((test) => {
    let passed = false;
    try {
      passed = new RegExp(test.pattern, test.flags || "").test(files[test.file] || "");
    } catch {}
    return { id: test.id, passed };
  });
}

function storageKey(projectId, lessonSlug) {
  return `binarytree-code-lab:${lessonSlug || projectId}:v1`;
}

export function CodeLab({
  projectId = DEFAULT_CODE_PROJECT_ID,
  lessonSlug = "",
  className = "",
  embedded = false,
  showProjectPicker = true,
}) {
  const initialProject = getCodeProject(projectId);
  const [activeProjectId, setActiveProjectId] = useState(initialProject.id);
  const project = useMemo(() => getCodeProject(activeProjectId), [activeProjectId]);
  const [files, setFiles] = useState(() => copyFiles(initialProject.files));
  const [renderedFiles, setRenderedFiles] = useState(() => copyFiles(initialProject.files));
  const [activeFile, setActiveFile] = useState("html");
  const [autoRun, setAutoRun] = useState(true);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [previewStatus, setPreviewStatus] = useState("Preview ready");
  const [saveStatus, setSaveStatus] = useState("Saved on this device");
  const [results, setResults] = useState([]);
  const [checkStatus, setCheckStatus] = useState("idle");
  const [visibleHintCount, setVisibleHintCount] = useState(0);
  const [aiStatus, setAIStatus] = useState("idle");
  const [aiFeedback, setAIFeedback] = useState("");
  const frameRef = useRef(null);
  const checkRequestRef = useRef(null);
  const checkTimerRef = useRef(null);

  const previewDocument = useMemo(
    () => buildDocument(renderedFiles, { title: project.title }),
    [project.title, renderedFiles],
  );
  const activeTab = FILE_TABS.find((tab) => tab.id === activeFile) || FILE_TABS[0];
  const passedCount = results.filter((result) => result.passed).length;
  const completion = results.length ? Math.round((passedCount / results.length) * 100) : 0;

  const loadProject = useCallback((nextProjectId) => {
    const nextProject = getCodeProject(nextProjectId);
    let nextFiles = copyFiles(nextProject.files);
    let restored = false;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(nextProject.id, lessonSlug)) || "null");
      if (saved?.files && ["html", "css", "js"].every((key) => typeof saved.files[key] === "string")) {
        nextFiles = copyFiles(saved.files);
        restored = true;
      }
    } catch {}
    setActiveProjectId(nextProject.id);
    setFiles(nextFiles);
    setRenderedFiles(nextFiles);
    setPreviewVersion((version) => version + 1);
    setResults([]);
    setCheckStatus("idle");
    setVisibleHintCount(0);
    setAIFeedback("");
    setAIStatus("idle");
    setSaveStatus(restored ? "Local draft restored" : "Starter loaded");
  }, [lessonSlug]);


  useEffect(() => {
    const timer = setTimeout(() => loadProject(projectId), 0);
    return () => clearTimeout(timer);
  }, [loadProject, projectId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey(project.id, lessonSlug), JSON.stringify({
          files,
          updatedAt: new Date().toISOString(),
        }));
        setSaveStatus("Saved on this device");
      } catch {
        setSaveStatus("Draft could not be saved");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [files, lessonSlug, project.id]);

  const runProject = useCallback(() => {
    if (obviousInfiniteLoop(files.js)) {
      setPreviewStatus("Preview paused: remove the obvious infinite loop first.");
      return false;
    }
    setRenderedFiles(copyFiles(files));
    setPreviewVersion((version) => version + 1);
    setPreviewStatus("Refreshing preview…");
    return true;
  }, [files]);

  useEffect(() => {
    if (!autoRun) return undefined;
    const timer = setTimeout(runProject, 700);
    return () => clearTimeout(timer);
  }, [autoRun, runProject]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        runProject();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [runProject]);

  const finishCheck = useCallback((request, previewResults) => {
    if (!request || request.id !== checkRequestRef.current?.id) return;
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    const byId = new Map([...request.sourceResults, ...previewResults].map((result) => [result.id, result]));
    const ordered = request.tests.map((test) => ({
      ...test,
      passed: Boolean(byId.get(test.id)?.passed),
    }));
    const passed = ordered.filter((test) => test.passed).length;
    const percent = Math.round((passed / Math.max(ordered.length, 1)) * 100);
    setResults(ordered);
    setCheckStatus(passed === ordered.length ? "passed" : "needs-work");
    setPreviewStatus(passed === ordered.length ? "All checks passed" : `${passed} of ${ordered.length} checks passed`);
    checkRequestRef.current = null;
    recordProjectProgress(lessonSlug || project.id, ordered.filter((result) => result.passed).map((result) => result.id), ordered.length);
    try {
      localStorage.setItem(`binarytree-code-progress:${lessonSlug || project.id}`, JSON.stringify({
        projectId: project.id,
        passed,
        total: ordered.length,
        percent,
        completed: passed === ordered.length,
        updatedAt: new Date().toISOString(),
      }));
      window.dispatchEvent(new CustomEvent("binarytree:code-progress", { detail: {
        lessonSlug: lessonSlug || null,
        projectId: project.id,
        passed,
        total: ordered.length,
        percent,
      } }));
    } catch {}
  }, [lessonSlug, project.id]);

  const sendPendingTests = useCallback(() => {
    const request = checkRequestRef.current;
    const frameWindow = frameRef.current?.contentWindow;
    if (!request || request.sent || !frameWindow) return;
    request.sent = true;
    frameWindow.postMessage({
      channel: MESSAGE_CHANNEL,
      type: "run-tests",
      requestId: request.id,
      tests: request.previewTests,
    }, "*");
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== frameRef.current?.contentWindow || event.data?.channel !== MESSAGE_CHANNEL) return;
      if (event.data.type === "ready") {
        setPreviewStatus("Preview ready");
        sendPendingTests();
      }
      if (event.data.type === "test-results") {
        const request = checkRequestRef.current;
        if (!request || event.data.requestId !== request.id) return;
        finishCheck(request, Array.isArray(event.data.results) ? event.data.results : []);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [finishCheck, sendPendingTests]);

  useEffect(() => () => {
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
  }, []);

  const checkProject = () => {
    if (obviousInfiniteLoop(files.js)) {
      setPreviewStatus("Check paused: remove the obvious infinite loop first.");
      return;
    }
    const sourceResults = runSourceTests(project.tests, files);
    const previewTests = project.tests.filter((test) => test.kind !== "source-regex");
    const request = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      tests: project.tests,
      sourceResults,
      previewTests,
      sent: false,
    };
    checkRequestRef.current = request;
    setResults([]);
    setCheckStatus("checking");
    setRenderedFiles(copyFiles(files));
    setPreviewVersion((version) => version + 1);
    setPreviewStatus("Running project checks…");
    if (!previewTests.length) {
      finishCheck(request, []);
      return;
    }
    checkTimerRef.current = setTimeout(() => {
      const pending = checkRequestRef.current;
      if (!pending || pending.id !== request.id) return;
      finishCheck(pending, previewTests.map((test) => ({ id: test.id, passed: false })));
      setPreviewStatus("Preview checks timed out. Check the JavaScript for a loop or error.");
    }, 4000);
  };

  const updateFile = (value) => {
    setFiles((current) => ({ ...current, [activeFile]: value }));
    setSaveStatus("Saving…");
    setResults([]);
    setCheckStatus("idle");
    setAIFeedback("");
    setAIStatus("idle");
  };

  const handleEditorKeyDown = (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const nextValue = `${editor.value.slice(0, start)}  ${editor.value.slice(end)}`;
    updateFile(nextValue);
    requestAnimationFrame(() => editor.setSelectionRange(start + 2, start + 2));
  };

  const handleFileTabKeyDown = (event, tabIndex) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? FILE_TABS.length - 1
        : (tabIndex + (event.key === "ArrowRight" ? 1 : -1) + FILE_TABS.length) % FILE_TABS.length;
    setActiveFile(FILE_TABS[nextIndex].id);
    const tabs = event.currentTarget.parentElement?.querySelectorAll('[role="tab"]');
    requestAnimationFrame(() => tabs?.[nextIndex]?.focus());
  };

  const revealHint = () => {
    setVisibleHintCount((count) => Math.min(count + 1, project.hints.length));
  };

  const askAICoach = async () => {
    if (aiStatus === "loading") return;
    setAIStatus("loading");
    setAIFeedback("");
    try {
      const response = await fetch("/api/ai/code-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          title: project.title,
          description: project.description,
          files,
          results: results.map(({ id, title, passed, failure }) => ({ id, title, passed, failure })),
          hintLevel: visibleHintCount + 1,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The AI coach is unavailable right now.");
      setAIFeedback(data.feedback);
      setAIStatus("done");
    } catch (error) {
      setAIFeedback(error.message || "The AI coach is unavailable right now.");
      setAIStatus("error");
    }
  };

  const resetProject = () => {
    if (!window.confirm("Reset this project to its starter code? Your saved draft will be replaced.")) return;
    const starter = copyFiles(project.files);
    try {
      localStorage.removeItem(storageKey(project.id, lessonSlug));
    } catch {}
    setFiles(starter);
    setRenderedFiles(starter);
    setPreviewVersion((version) => version + 1);
    setResults([]);
    setCheckStatus("idle");
    setVisibleHintCount(0);
    setAIFeedback("");
    setAIStatus("idle");
    setSaveStatus("Starter restored");
  };

  const downloadProject = () => {
    const documentText = buildDocument(files, { includeBridge: false, title: project.title });
    const url = URL.createObjectURL(new Blob([documentText], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.id}.html`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <section className={`code-lab ${embedded ? "code-lab-embedded" : ""} ${className}`.trim()} aria-labelledby="code-lab-title">
      <header className="code-lab-header">
        <div className="code-lab-heading">
          <span className="code-lab-kicker">{project.eyebrow}</span>
          <h2 id="code-lab-title">{project.title}</h2>
          <p>{project.description}</p>
          <ul className="code-lab-skills" aria-label="Skills practiced">
            {project.skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </div>
        {showProjectPicker && (
          <label className="code-lab-project-select">
            <span>Choose a project</span>
            <select value={activeProjectId} onChange={(event) => loadProject(event.target.value)}>
              {ALL_WEB_CODE_PROJECTS.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
            </select>
          </label>
        )}
      </header>

      <div className="code-lab-toolbar" aria-label="Project controls">
        <div className="code-lab-toolbar-primary">
          <button className="code-lab-button code-lab-run" type="button" onClick={runProject}>▶ Run</button>
          <button className="code-lab-button code-lab-check" type="button" onClick={checkProject} disabled={checkStatus === "checking"}>
            {checkStatus === "checking" ? "Checking…" : "✓ Check project"}
          </button>
          <label className="code-lab-auto-run">
            <input type="checkbox" checked={autoRun} onChange={(event) => setAutoRun(event.target.checked)} />
            <span>Auto-run</span>
          </label>
        </div>
        <div className="code-lab-toolbar-secondary">
          <button type="button" onClick={downloadProject}>Download</button>
          <button type="button" onClick={resetProject}>Reset</button>
        </div>
      </div>

      <div className="code-lab-workspace">
        <div className="code-lab-editor-panel">
          <div className="code-lab-tabs" role="tablist" aria-label="Project files">
            {FILE_TABS.map((tab, tabIndex) => (
              <button
                id={`code-lab-tab-${tab.id}`}
                className={activeFile === tab.id ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={activeFile === tab.id}
                aria-controls="code-lab-editor"
                tabIndex={activeFile === tab.id ? 0 : -1}
                onClick={() => setActiveFile(tab.id)}
                onKeyDown={(event) => handleFileTabKeyDown(event, tabIndex)}
                key={tab.id}
              >
                <span>{tab.label}</span>
                <small>{tab.extension}</small>
              </button>
            ))}
          </div>
          <div className="code-lab-editor-heading">
            <span>{activeTab.extension}</span>
            <small>{files[activeFile].split("\n").length} lines · Tab inserts two spaces</small>
          </div>
          <label className="code-lab-editor-label" htmlFor="code-lab-editor">Edit {activeTab.label}</label>
          <textarea
            id="code-lab-editor"
            className="code-lab-editor"

            value={files[activeFile]}
            onChange={(event) => updateFile(event.target.value)}
            onKeyDown={handleEditorKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <div className="code-lab-editor-footer">
            <span aria-live="polite">{saveStatus}</span>
            <kbd>Ctrl</kbd><span>+</span><kbd>Enter</kbd><span> to run</span>
          </div>
        </div>

        <div className="code-lab-preview-panel">
          <div className="code-lab-panel-heading">
            <div><span className="code-lab-status-dot" aria-hidden="true" /> <strong>Live preview</strong></div>
            <small aria-live="polite">{previewStatus}</small>
          </div>
          <iframe
            key={previewVersion}
            ref={frameRef}
            className="code-lab-preview"
            title={`${project.title} preview`}
            sandbox="allow-scripts"
            srcDoc={previewDocument}
            onLoad={sendPendingTests}
          />
          <p className="code-lab-safety-note">The preview is isolated from your account and cannot make network requests.</p>
        </div>
      </div>

      <div className="code-lab-coaching">
        <section className="code-lab-checks" aria-labelledby="code-lab-checks-title">
          <div className="code-lab-section-heading">
            <div>
              <span className="code-lab-kicker">Project checks</span>
              <h3 id="code-lab-checks-title">Turn your idea into working code</h3>
            </div>
            {results.length > 0 && <strong className={completion === 100 ? "is-complete" : ""}>{completion}%</strong>}
          </div>
          {results.length ? (
            <ul className="code-lab-result-list" aria-live="polite">
              {results.map((result) => (
                <li className={result.passed ? "is-passed" : "is-failed"} key={result.id}>
                  <span aria-hidden="true">{result.passed ? "✓" : "→"}</span>
                  <div><strong>{result.title}</strong>{!result.passed && <p>{result.failure}</p>}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="code-lab-empty-checks">Run your project, try it in the preview, then choose <strong>Check project</strong> for clear, testable feedback.</p>
          )}
        </section>

        <aside className="code-lab-help" aria-labelledby="code-lab-help-title">
          <span className="code-lab-kicker">When you get stuck</span>
          <h3 id="code-lab-help-title">One hint at a time—never the solution</h3>
          {visibleHintCount > 0 && (
            <ol className="code-lab-hints">
              {project.hints.slice(0, visibleHintCount).map((hint) => <li key={hint}>{hint}</li>)}
            </ol>
          )}
          <div className="code-lab-help-actions">
            <button className="code-lab-button code-lab-hint" type="button" onClick={revealHint} disabled={visibleHintCount >= project.hints.length}>
              {visibleHintCount ? "Show another hint" : "Show a hint"}
            </button>
            <button className="code-lab-button code-lab-ai" type="button" onClick={askAICoach} disabled={aiStatus === "loading"}>
              {aiStatus === "loading" ? "Coach is reviewing…" : "Get one coaching hint"}
            </button>
          </div>
          {aiFeedback && <div className={`code-lab-ai-feedback ${aiStatus === "error" ? "is-error" : ""}`} aria-live="polite"><strong>{aiStatus === "error" ? "Coach unavailable" : "Your next hint"}</strong><p>{aiFeedback}</p></div>}
        </aside>
      </div>

      <style jsx>{`
        .code-lab { overflow: hidden; border: 1px solid var(--line, #d8dce2); border-radius: 22px 10px 26px 14px; background: #fff; box-shadow: 0 22px 60px rgba(20, 57, 91, .12); color: var(--ink, #20242c); }
        .code-lab-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 28px; padding: 30px 32px 27px; border-bottom: 1px solid var(--line, #d8dce2); background: linear-gradient(135deg, #f4f9fd 0%, #edf6fb 52%, #f1f9f6 100%); }
        .code-lab-heading { max-width: 700px; }
        .code-lab-kicker { display: block; margin-bottom: 8px; color: var(--blue-700, #125a92); font-size: .72rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        .code-lab h2, .code-lab h3 { color: var(--navy-dark, #0c2942); }
        .code-lab h2 { margin: 0 0 9px; font-size: clamp(1.65rem, 3vw, 2.25rem); }
        .code-lab h3 { margin: 0; font-size: 1.2rem; }
        .code-lab-heading > p { max-width: 660px; margin: 0; color: var(--muted, #626873); }
        .code-lab-skills { display: flex; flex-wrap: wrap; gap: 7px; margin: 18px 0 0; padding: 0; list-style: none; }
        .code-lab-skills li { padding: 5px 10px; border: 1px solid #cbdde9; border-radius: 999px; background: rgba(255,255,255,.72); color: #31566f; font-size: .75rem; font-weight: 700; }
        .code-lab-project-select { display: grid; min-width: 235px; gap: 6px; }
        .code-lab-project-select span { color: #466173; font-size: .72rem; font-weight: 750; }
        .code-lab-project-select select { width: 100%; min-height: 46px; padding: 9px 34px 9px 11px; border: 1px solid #b9cbd8; border-radius: 8px; background: #fff; }
        .code-lab-toolbar { display: flex; min-height: 64px; align-items: center; justify-content: space-between; gap: 18px; padding: 9px 16px; border-bottom: 1px solid #293a49; background: #102f49; color: #fff; }
        .code-lab-toolbar-primary, .code-lab-toolbar-secondary { display: flex; align-items: center; gap: 9px; }
        .code-lab-button, .code-lab-toolbar-secondary button { min-height: 40px; padding: 8px 14px; border: 1px solid transparent; border-radius: 7px; cursor: pointer; font-weight: 750; }
        .code-lab-button:disabled { cursor: not-allowed; opacity: .55; }
        .code-lab-run { background: #f8fbfd; color: #14395b; }
        .code-lab-check { background: #1b9678; color: #fff; }
        .code-lab-toolbar-secondary button { border-color: rgba(255,255,255,.28); background: transparent; color: #dbe7ef; font-size: .82rem; }
        .code-lab-auto-run { display: flex; align-items: center; gap: 7px; margin-left: 4px; color: #cfdae4; cursor: pointer; font-size: .78rem; }
        .code-lab-auto-run input { width: 17px; height: 17px; accent-color: #64d9bb; }
        .code-lab-workspace { display: grid; grid-template-columns: minmax(0, 1.06fr) minmax(360px, .94fr); min-height: 570px; background: #f4f7f9; }
        .code-lab-editor-panel, .code-lab-preview-panel { min-width: 0; }
        .code-lab-editor-panel { display: flex; min-height: 570px; flex-direction: column; border-right: 1px solid #263c4e; background: #102536; color: #dce8f0; }
        .code-lab-tabs { display: flex; overflow-x: auto; border-bottom: 1px solid #2c4355; background: #0c1f2e; }
        .code-lab-tabs button { display: flex; min-width: 132px; min-height: 61px; flex-direction: column; align-items: flex-start; justify-content: center; padding: 8px 18px; border: 0; border-right: 1px solid #263b4d; border-bottom: 3px solid transparent; background: transparent; color: #aabcc9; cursor: pointer; }
        .code-lab-tabs button.is-active { border-bottom-color: #65c9ac; background: #102536; color: #fff; }
        .code-lab-tabs span { font-weight: 750; }
        .code-lab-tabs small { margin-top: 2px; color: #829aaa; font-size: .66rem; }
        .code-lab-editor-heading, .code-lab-editor-footer { display: flex; min-height: 42px; align-items: center; justify-content: space-between; gap: 12px; padding: 7px 15px; color: #8fa6b6; font-size: .69rem; }
        .code-lab-editor-heading { border-bottom: 1px solid #263b4d; }
        .code-lab-editor-heading > span { color: #c8d8e2; font-family: Consolas, "Courier New", monospace; }
        .code-lab-editor-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .code-lab-editor { width: 100%; min-height: 420px; flex: 1; padding: 19px 20px; border: 0; border-radius: 0; outline: 0; resize: none; background: #102536; color: #e7f0f5; caret-color: #79e2c4; font: 14px/1.68 Consolas, "SFMono-Regular", "Courier New", monospace; tab-size: 2; }
        .code-lab-editor:focus { box-shadow: inset 0 0 0 2px rgba(101, 201, 172, .5); }
        .code-lab-editor-footer { border-top: 1px solid #263b4d; }
        .code-lab-editor-footer kbd { padding: 1px 5px; border: 1px solid #536a7b; border-bottom-width: 2px; border-radius: 4px; background: #1a3448; color: #dce8f0; font: inherit; }
        .code-lab-editor-footer > span:nth-last-child(2) { margin-left: auto; }
        .code-lab-preview-panel { display: flex; min-height: 570px; flex-direction: column; padding: 0 18px 13px; background: #eaf0f4; }
        .code-lab-panel-heading { display: flex; min-height: 61px; align-items: center; justify-content: space-between; gap: 12px; color: #40576a; font-size: .78rem; }
        .code-lab-panel-heading > div { display: flex; align-items: center; gap: 6px; }
        .code-lab-panel-heading small { overflow: hidden; max-width: 55%; color: #667b8a; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
        .code-lab-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #1b9678; box-shadow: 0 0 0 4px rgba(27,150,120,.12); }
        .code-lab-preview { width: 100%; min-height: 450px; flex: 1; border: 1px solid #ccd8e0; border-radius: 14px 7px 18px 9px; background: #fff; box-shadow: 0 8px 25px rgba(20,57,91,.08); }
        .code-lab-safety-note { margin: 9px 2px 0; color: #6e808d; font-size: .67rem; }
        .code-lab-coaching { display: grid; grid-template-columns: 1.15fr .85fr; border-top: 1px solid var(--line, #d8dce2); }
        .code-lab-checks, .code-lab-help { padding: 28px 30px 31px; }
        .code-lab-help { border-left: 1px solid var(--line, #d8dce2); background: #f7fafb; }
        .code-lab-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
        .code-lab-section-heading > strong { display: grid; width: 58px; height: 58px; flex: 0 0 auto; place-items: center; border-radius: 50%; background: #edf3f6; color: #496172; font-size: .9rem; }
        .code-lab-section-heading > strong.is-complete { background: #e6f6f0; color: #12765e; }
        .code-lab-empty-checks { max-width: 600px; margin: 20px 0 0; color: var(--muted, #626873); }
        .code-lab-result-list, .code-lab-hints { margin: 20px 0 0; padding: 0; list-style: none; }
        .code-lab-result-list { display: grid; gap: 8px; }
        .code-lab-result-list li { display: flex; gap: 11px; padding: 11px 13px; border: 1px solid #d9e1e6; border-radius: 9px; }
        .code-lab-result-list li > span { display: grid; width: 23px; height: 23px; flex: 0 0 auto; place-items: center; border-radius: 50%; background: #edf1f3; color: #5a6b78; font-size: .76rem; font-weight: 800; }
        .code-lab-result-list li.is-passed { border-color: #bee2d7; background: #f1faf7; }
        .code-lab-result-list li.is-passed > span { background: #168267; color: #fff; }
        .code-lab-result-list strong { color: #243c4f; font-size: .87rem; }
        .code-lab-result-list p { margin: 2px 0 0; color: #687986; font-size: .76rem; }
        .code-lab-help > h3 { margin-bottom: 8px; }
        .code-lab-hints { counter-reset: hints; }
        .code-lab-hints li { position: relative; margin-top: 10px; padding: 11px 12px 11px 40px; border-left: 3px solid #d1ad47; background: #fffaf0; color: #5d5542; font-size: .82rem; }
        .code-lab-hints li::before { position: absolute; top: 10px; left: 13px; counter-increment: hints; content: counter(hints); color: #8a6b19; font-weight: 800; }
        .code-lab-help-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 18px; }
        .code-lab-hint { border-color: #c9d5dd; background: #fff; color: #20455f; }
        .code-lab-ai { background: #1769aa; color: #fff; }
        .code-lab-ai-feedback { margin-top: 15px; padding: 17px 18px; border: 1px solid #b8d5e3; border-left: 4px solid #1769aa; border-radius: 7px 14px 8px 11px; background: #f3f9fc; color: #294b63; font-family: var(--font-body), Arial, sans-serif; }
        .code-lab-ai-feedback.is-error { border-left-color: #a96e16; background: #fff8e8; }
        .code-lab-ai-feedback strong { display: block; color: #174a68; font-family: var(--font-body), Arial, sans-serif; font-size: .77rem; font-weight: 850; letter-spacing: .07em; text-transform: uppercase; }
        .code-lab-ai-feedback p { margin: 8px 0 0; white-space: pre-wrap; font-family: var(--font-body), Arial, sans-serif; font-size: .94rem; line-height: 1.65; letter-spacing: 0; }
        .code-lab button:focus-visible, .code-lab select:focus-visible, .code-lab textarea:focus-visible, .code-lab input:focus-visible { outline: 3px solid rgba(79, 166, 220, .38); outline-offset: 2px; }

        @media (max-width: 920px) {
          .code-lab-header { flex-direction: column; }
          .code-lab-project-select { width: min(100%, 420px); }
          .code-lab-workspace, .code-lab-coaching { grid-template-columns: 1fr; }
          .code-lab-editor-panel { border-right: 0; border-bottom: 1px solid #263c4e; }
          .code-lab-preview-panel { min-height: 500px; }
          .code-lab-help { border-top: 1px solid var(--line, #d8dce2); border-left: 0; }
        }

        @media (max-width: 620px) {
          .code-lab { border-right: 0; border-left: 0; border-radius: 0; }
          .code-lab-header { padding: 24px 17px; }
          .code-lab-toolbar { align-items: stretch; flex-direction: column; padding: 12px; }
          .code-lab-toolbar-primary { display: grid; grid-template-columns: 1fr 1fr; }
          .code-lab-auto-run { grid-column: 1 / -1; min-height: 38px; margin: 0; }
          .code-lab-toolbar-secondary { display: grid; grid-template-columns: 1fr 1fr; }
          .code-lab-tabs button { min-width: 112px; padding-inline: 13px; }
          .code-lab-editor-heading small { display: none; }
          .code-lab-editor { min-height: 380px; padding: 16px 14px; font-size: 16px; }
          .code-lab-editor-footer > span:nth-last-child(-n+3), .code-lab-editor-footer kbd { display: none; }
          .code-lab-preview-panel { min-height: 460px; padding-inline: 10px; }
          .code-lab-preview { min-height: 390px; }
          .code-lab-checks, .code-lab-help { padding: 24px 17px; }
          .code-lab-help-actions { display: grid; }
          .code-lab-button { width: 100%; }
        }
      `}</style>
    </section>
  );
}
