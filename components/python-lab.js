"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCodeProject } from "@/lib/code-projects";
import { recordProjectProgress } from "@/lib/progress-store";

function sourceResults(tests, code) {
  return tests.filter((test) => test.kind === "source-regex").map((test) => {
    let passed = false;
    try { passed = new RegExp(test.pattern, test.flags || "").test(code); } catch {}
    return { id: test.id, passed };
  });
}

function mergeResults(project, sources, runtime) {
  const byId = new Map([...sources, ...runtime].map((result) => [result.id, result]));
  return project.tests.map((test) => ({ ...test, ...byId.get(test.id), passed: Boolean(byId.get(test.id)?.passed) }));
}

export function PythonLab({ projectId = "python-opportunity", lessonSlug = "", embedded = false }) {
  const project = useMemo(() => getCodeProject(projectId), [projectId]);
  const draftKey = `binarytree-python-lab:${lessonSlug || project.id}:v1`;
  const [code, setCode] = useState(project.starter || "");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Python engine loads when you first run the project.");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [hintCount, setHintCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState("Saved on this device");
  const [aiStatus, setAIStatus] = useState("idle");
  const [aiFeedback, setAIFeedback] = useState("");
  const workerRef = useRef(null);
  const pendingRef = useRef(null);
  const timeoutRef = useRef(null);
  const engineReadyRef = useRef(false);

  const passedCount = results.filter((result) => result.passed).length;
  const completion = results.length ? Math.round((passedCount / results.length) * 100) : 0;

  const stopWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    engineReadyRef.current = false;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(draftKey) || "null");
        if (typeof saved?.code === "string") {
          setCode(saved.code);
          setSaveStatus("Local draft restored");
        } else {
          setCode(project.starter || "");
        }
      } catch { setCode(project.starter || ""); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draftKey, project.starter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ code, updatedAt: new Date().toISOString() }));
        setSaveStatus("Saved on this device");
      } catch { setSaveStatus("Draft could not be saved"); }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [code, draftKey]);

  useEffect(() => () => stopWorker(), [stopWorker]);

  const getWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker("/python-runner.mjs", { type: "module" });
    workerRef.current = worker;
    return worker;
  }, []);

  const finish = useCallback((runtimeResults, runOutput, error = "") => {
    const pending = pendingRef.current;
    if (!pending) return;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    pendingRef.current = null;
    setRunning(false);
    setOutput([runOutput, error].filter(Boolean).join("\n"));
    if (!pending.check) {
      setStatus(error ? "Python stopped with an error." : "Program finished.");
      return;
    }
    const ordered = mergeResults(project, pending.sources, runtimeResults || []);
    const passedIds = ordered.filter((result) => result.passed).map((result) => result.id);
    setResults(ordered);
    recordProjectProgress(lessonSlug || project.id, passedIds, ordered.length);
    setStatus(passedIds.length === ordered.length ? "All project checks passed." : `${passedIds.length} of ${ordered.length} checks passed.`);
  }, [lessonSlug, project]);

  const execute = useCallback((check = false) => {
    if (running) return;
    if (/while\s+True\s*:/i.test(code)) {
      setOutput("The lab paused an obvious infinite loop. Replace `while True` with a bounded condition before running.");
      setStatus("Run paused for safety.");
      return;
    }
    const worker = getWorker();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sources = check ? sourceResults(project.tests, code) : [];
    pendingRef.current = { id, check, sources };
    setRunning(true);
    setOutput("");
    setStatus(engineReadyRef.current ? "Running your program…" : "Loading Python for the first run…");
    if (check) setResults([]);

    worker.onmessage = (event) => {
      if (event.data?.id !== id) return;
      if (event.data.type === "status") {
        setStatus(event.data.status);
        if (event.data.status?.startsWith("Running")) engineReadyRef.current = true;
      }
      if (event.data.type === "result") finish(event.data.results, [event.data.output, event.data.stderr].filter(Boolean).join("\n"));
      if (event.data.type === "error") finish([], [event.data.output, event.data.stderr].filter(Boolean).join("\n"), event.data.error);
    };
    worker.onerror = (event) => {
      finish([], "", event.message || "The Python worker could not start.");
      stopWorker();
    };
    worker.postMessage({ id, code, tests: check ? project.tests.filter((test) => test.kind === "python-call-equals") : [] });
    timeoutRef.current = window.setTimeout(() => {
      if (pendingRef.current?.id !== id) return;
      finish([], "", "Execution timed out. The worker was stopped; check for a long or endless loop.");
      stopWorker();
    }, engineReadyRef.current ? 9000 : 40000);
  }, [code, finish, getWorker, project.tests, running, stopWorker]);

  useEffect(() => {
    const keydown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        execute(false);
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [execute]);

  const updateCode = (value) => {
    setCode(value);
    setSaveStatus("Saving…");
    setResults([]);
    setAIStatus("idle");
    setAIFeedback("");
  };

  const editorKeyDown = (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const next = `${target.value.slice(0, start)}    ${target.value.slice(target.selectionEnd)}`;
    updateCode(next);
    requestAnimationFrame(() => target.setSelectionRange(start + 4, start + 4));
  };

  const reset = () => {
    if (!window.confirm("Reset to the Python starter? Your saved draft will be replaced.")) return;
    stopWorker();
    setCode(project.starter || "");
    setOutput("");
    setResults([]);
    setHintCount(0);
    setStatus("Starter restored.");
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([code], { type: "text/x-python;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.id}.py`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const askCoach = async () => {
    if (aiStatus === "loading") return;
    setAIStatus("loading");
    setAIFeedback("");
    try {
      const response = await fetch("/api/ai/code-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, title: project.title, description: project.description, language: "python", files: { python: code }, results, hintLevel: hintCount + 1 }),
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

  return (
    <section className={`python-lab ${embedded ? "is-embedded" : ""}`} aria-labelledby="python-lab-title">
      <header className="python-lab-header">
        <div><span className="code-lab-kicker">{project.eyebrow}</span><h2 id="python-lab-title">{project.title}</h2><p>{project.description}</p><ul>{project.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>
        <div className="python-engine-note"><span aria-hidden="true">●</span><strong>Runs in this browser</strong><small>Isolated worker · no account secrets · first engine load needs internet</small></div>
      </header>
      <div className="python-toolbar">
        <div><button type="button" onClick={() => execute(false)} disabled={running}>▶ {running ? "Running…" : "Run Python"}</button><button type="button" onClick={() => execute(true)} disabled={running}>✓ Check project</button></div>
        <div><button type="button" onClick={download}>Download .py</button><button type="button" onClick={reset}>Reset</button></div>
      </div>
      <div className="python-workspace">
        <div className="python-editor-panel">
          <div className="python-file-heading"><span>main.py</span><small>{code.split("\n").length} lines · Ctrl/⌘ + Enter runs</small></div>
          <label className="code-lab-editor-label" htmlFor="python-editor">Python source</label>
          <textarea id="python-editor" value={code} onChange={(event) => updateCode(event.target.value)} onKeyDown={editorKeyDown} spellCheck={false} autoCapitalize="off" autoCorrect="off" />
          <div className="python-save-row"><span aria-live="polite">{saveStatus}</span><span>Python 3 · browser runtime</span></div>
        </div>
        <div className="python-output-panel">
          <div><strong>Console</strong><small aria-live="polite">{status}</small></div>
          <pre aria-label="Python output">{output || "Your program output and errors will appear here."}</pre>
        </div>
      </div>
      <div className="python-coaching">
        <section><div className="python-result-heading"><div><span className="code-lab-kicker">Deterministic checks</span><h3>Prove the behavior</h3></div>{results.length > 0 && <strong className={completion === 100 ? "is-complete" : ""}>{completion}%</strong>}</div>
          {results.length ? <ul className="python-results" aria-live="polite">{results.map((result) => <li className={result.passed ? "is-passed" : ""} key={result.id}><span>{result.passed ? "✓" : "→"}</span><div><strong>{result.title}</strong>{!result.passed && <p>{result.failure}{result.actual ? ` Actual: ${result.actual}` : ""}</p>}</div></li>)}</ul> : <p>Predict first, run the program, then check normal, boundary, and invalid inputs.</p>}
        </section>
        <aside><span className="code-lab-kicker">Coaching ladder</span><h3>One hint at a time—never the solution</h3>{hintCount > 0 && <ol>{project.hints.slice(0, hintCount).map((hint) => <li key={hint}>{hint}</li>)}</ol>}<div><button type="button" onClick={() => setHintCount((count) => Math.min(count + 1, project.hints.length))} disabled={hintCount >= project.hints.length}>{hintCount ? "Another hint" : "Show a hint"}</button><button type="button" onClick={askCoach} disabled={aiStatus === "loading"}>{aiStatus === "loading" ? "Coach is reviewing…" : "Get one coaching hint"}</button></div>{aiFeedback && <div className={`python-ai-feedback ${aiStatus === "error" ? "is-error" : ""}`} aria-live="polite"><strong>{aiStatus === "error" ? "Coach unavailable" : "Your next hint"}</strong><p>{aiFeedback}</p></div>}</aside>
      </div>
    </section>
  );
}
