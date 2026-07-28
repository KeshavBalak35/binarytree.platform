"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function pageWelcome(pathname) {
  if (pathname.startsWith("/learn/")) return "I’m grounded in Binary Tree’s curriculum. Ask me to find a related lesson, explain how the study tools work, or help choose your next step.";
  if (pathname === "/learn") return "Tell me what you want to be able to do—not just a course name—and I’ll find a sensible place to begin.";
  if (pathname === "/typing") return "I can help you understand your typing results or choose the right next challenge.";
  if (pathname === "/assessment") return "Take the assessment for a private learning plan, or ask me how the check-in works.";
  if (pathname.startsWith("/educators")) return "I can take you to the lesson planner, assessment, curriculum, or the right classroom tool.";
  return "I can find a course, explain this page, or take you directly to the right Binary Tree tool.";
}

function suggestionsFor(pathname) {
  if (pathname === "/learn") return ["I’m completely new—where should I start?", "Find Python lessons", "Help me choose one course"];
  if (pathname.startsWith("/learn/")) return ["What should I study next?", "Show me the focused study tools", "Find a related lesson"];
  if (pathname === "/typing") return ["How should I improve accuracy?", "What typing level should I use?", "Find a beginner course"];
  if (pathname === "/assessment") return ["What happens to my answers?", "How does the AI learning plan work?", "Show me beginner lessons"];
  if (pathname.startsWith("/educators")) return ["Build a lesson plan", "Show me classroom assessment", "What works offline?"];
  return ["Help me find a course", "What should I do first?", "Show me what works offline"];
}

export function AiCopilot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => [{ role: "assistant", text: pageWelcome(pathname), actions: [] }]);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const hidden = pathname.startsWith("/auth");


  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(value) {
    const prompt = String(value ?? question).trim();
    if (prompt.length < 2 || loading) return;
    const nextMessages = [...messages, { role: "user", text: prompt, actions: [] }];
    setMessages(nextMessages);
    setQuestion("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, pathname, history: nextMessages.slice(-6).map(({ role, text }) => ({ role, text })) }),
      });
      const data = await response.json();
      if (!response.ok || !data.answer) throw new Error(data.error || "The live AI is unavailable.");
      setMessages((current) => [...current, { role: "assistant", text: data.answer, actions: data.actions || [] }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "The live AI could not answer that request right now. Please try again in a moment.", actions: [], error: true }]);
    } finally {
      setLoading(false);
    }
  }

  if (hidden) return null;

  return (
    <aside className={`ai-copilot ${open ? "is-open" : ""}`} aria-label="Binary Tree AI guide">
      {open && <button className="ai-copilot-scrim" type="button" aria-label="Close AI guide" onClick={() => setOpen(false)} />}
      <button className="ai-copilot-toggle" type="button" aria-expanded={open} aria-controls="binary-tree-ai-panel" onClick={() => setOpen((value) => !value)}>
        <span className="ai-copilot-spark" aria-hidden="true">✦</span>
        <span><strong>Ask Binary Tree AI</strong><small>Find it. Learn it. Do it.</small></span>
        <span aria-hidden="true">{open ? "×" : "↑"}</span>
      </button>

      {open && (
        <section className="ai-copilot-panel" id="binary-tree-ai-panel">
          <header className="ai-copilot-header">
            <div><span aria-hidden="true">✦</span><div><strong>Binary Tree AI</strong><small>Grounded in this website</small></div></div>
            <button type="button" aria-label="Close AI guide" onClick={() => setOpen(false)}>×</button>
          </header>

          <div className="ai-copilot-log" ref={logRef} aria-live="polite">
            {messages.map((message, index) => (
              <div className={`ai-copilot-message ${message.role === "user" ? "is-user" : ""}`} key={`${message.role}-${index}`}>
                <p>{message.text}</p>
                {message.error && <small className="ai-copilot-offline">Live AI unavailable</small>}
                {message.actions?.length > 0 && (
                  <div className="ai-copilot-actions">
                    {message.actions.map((action) => (
                      <Link href={action.href} onClick={() => setOpen(false)} key={`${action.href}-${action.label}`}>
                        <span><strong>{action.label}</strong><small>{action.detail}</small></span><span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="ai-copilot-thinking"><span /><span /><span /><em>Looking through Binary Tree…</em></div>}
          </div>

          {messages.length === 1 && <div className="ai-copilot-suggestions">{suggestionsFor(pathname).map((suggestion) => <button type="button" onClick={() => ask(suggestion)} key={suggestion}>{suggestion}</button>)}</div>}

          <form className="ai-copilot-form" onSubmit={(event) => { event.preventDefault(); ask(); }}>
            <label htmlFor="binary-tree-ai-question">Ask about courses, this page, or your next step</label>
            <div><textarea ref={inputRef} id="binary-tree-ai-question" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); ask(); } }} placeholder="What do you want to accomplish?" rows="2" maxLength={700} /><button type="submit" disabled={loading || question.trim().length < 2} aria-label="Send question">→</button></div>
            <small>AI can make mistakes. Course links and organization facts are restricted to Binary Tree’s published content.</small>
          </form>
        </section>
      )}
    </aside>
  );
}