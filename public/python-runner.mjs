import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.4/full/pyodide.mjs";

let runtimePromise;

function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.4/full/" }).then((runtime) => {
      self.fetch = () => Promise.reject(new Error("Network access is disabled inside Binary Tree Code Lab."));
      self.WebSocket = undefined;
      self.EventSource = undefined;
      return runtime;
    });
  }
  return runtimePromise;
}

function cleanValue(value) {
  if (value && typeof value.toJs === "function") {
    const converted = value.toJs({ dict_converter: Object.fromEntries });
    value.destroy?.();
    return converted;
  }
  return value;
}

self.addEventListener("message", async (event) => {
  const { id, code, tests = [] } = event.data || {};
  if (!id || typeof code !== "string") return;
  self.postMessage({ id, type: "status", status: "Loading the Python engine…" });
  const output = [];
  const errors = [];

  try {
    const pyodide = await getRuntime();
    pyodide.setStdout({ batched: (text) => output.push(text) });
    pyodide.setStderr({ batched: (text) => errors.push(text) });
    self.postMessage({ id, type: "status", status: "Running your program…" });
    await pyodide.runPythonAsync(code);

    const results = [];
    for (const test of tests) {
      if (test.kind !== "python-call-equals") continue;
      try {
        const actual = cleanValue(await pyodide.runPythonAsync(test.expression));
        results.push({ id: test.id, passed: String(actual) === String(test.expected), actual: String(actual) });
      } catch (error) {
        results.push({ id: test.id, passed: false, actual: String(error?.message || error) });
      }
    }

    self.postMessage({ id, type: "result", output: output.join("\n"), stderr: errors.join("\n"), results });
  } catch (error) {
    self.postMessage({ id, type: "error", error: String(error?.message || error), output: output.join("\n"), stderr: errors.join("\n") });
  }
});
