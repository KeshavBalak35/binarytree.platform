"use client";

import { useMemo, useState } from "react";

const LANGUAGE_LABELS = { en: "English", sw: "Kiswahili", fr: "Français" };
const STARTERS = {
  en: "Ask a question about this lesson. I’ll keep the answer short and grounded in these notes.",
  sw: "Uliza swali kuhusu somo hili. Jibu litakuwa fupi na litatumia maelezo ya somo.",
  fr: "Posez une question sur cette leçon. La réponse sera courte et fondée sur ces notes.",
};

function localAnswer(lesson, question, language) {
  const normalized = question.toLowerCase();
  const matched = lesson.keyIdeas.find((idea) => normalized.includes(idea.term.toLowerCase()) || idea.term.toLowerCase().split(" ").some((word) => word.length > 4 && normalized.includes(word)));
  const summary = language === "sw" ? lesson.summarySw : language === "fr" ? lesson.summaryFr : lesson.summary;
  if (matched && language === "en") return `${matched.term}: ${matched.definition}`;
  if (language === "sw") return `${summary} Ukiwa nje ya mtandao, tumia kadi za kujifunza kwa maelezo zaidi.`;
  if (language === "fr") return `${summary} Hors connexion, utilisez les cartes mémoire pour revoir les idées clés.`;
  return matched ? `${matched.term}: ${matched.definition}` : `${summary} A useful next step is: ${lesson.activity}`;
}

export function StudyCompanion({ lesson, expanded = false }) {
  const [tab, setTab] = useState("ask");
  const [language, setLanguage] = useState("en");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", text: STARTERS.en }]);
  const [loading, setLoading] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardBack, setCardBack] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const activeSummary = language === "sw" ? lesson.summarySw : language === "fr" ? lesson.summaryFr : lesson.summary;
  const flashcards = lesson.flashcards || [];
  const quiz = lesson.quiz || [];
  const activeCard = flashcards[cardIndex];
  const activeQuestion = quiz[quizIndex];
  const lastAssistantAnswer = useMemo(() => [...messages].reverse().find((message) => message.role === "assistant")?.text || "", [messages]);

  const changeLanguage = (value) => {
    setLanguage(value);
    setMessages([{ role: "assistant", text: STARTERS[value] }]);
  };

  const ask = async (event, mode = "answer") => {
    event?.preventDefault?.();
    const prompt = mode === "simplify" ? lastAssistantAnswer : question.trim();
    if (!prompt || loading) return;
    if (mode === "answer") {
      setMessages((current) => [...current, { role: "user", text: prompt }]);
      setQuestion("");
    }
    setLoading(true);
    try {
      if (!navigator.onLine) throw new Error("offline");
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          mode,
          language,
          lesson: {
            title: lesson.title,
            summary: lesson.summary,
            keyIdeas: lesson.keyIdeas,
            activity: lesson.activity,
          },
        }),
      });
      if (!response.ok) throw new Error("unavailable");
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", text: data.answer }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: localAnswer(lesson, prompt, language) }]);
    } finally {
      setLoading(false);
    }
  };

  const answerQuiz = (choiceIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choiceIndex);
    const correct = choiceIndex === activeQuestion.answer;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    try {
      localStorage.setItem(`binarytree-quiz-${lesson.slug}`, JSON.stringify({ score: nextScore, answered: quizIndex + 1, updatedAt: new Date().toISOString() }));
    } catch {}
  };

  const nextQuiz = () => {
    if (quizIndex < quiz.length - 1) {
      setQuizIndex((index) => index + 1);
      setSelectedAnswer(null);
    } else {
      setQuizIndex(0);
      setSelectedAnswer(null);
      setScore(0);
    }
  };

  return (
    <section className={`study-card ${expanded ? "is-expanded" : ""}`} aria-label="Study companion">
      <div className="study-card-header">
        <div className="study-card-header-row">
          <div><h2>Study companion</h2><p>Grounded in this lesson · flashcards and quiz work offline</p></div>
          <select className="language-select" value={language} onChange={(event) => changeLanguage(event.target.value)} aria-label="Study language">
            {Object.entries(LANGUAGE_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </div>
      </div>
      <div className="study-tabs" role="tablist" aria-label="Study modes">
        {[{ value: "ask", label: "Ask" }, { value: "cards", label: "Flashcards" }, { value: "quiz", label: "Practice quiz" }].map((item) => (
          <button className={`study-tab ${tab === item.value ? "is-active" : ""}`} onClick={() => setTab(item.value)} role="tab" aria-selected={tab === item.value} key={item.value}>{item.label}</button>
        ))}
      </div>

      {tab === "ask" && (
        <div className="study-panel">
          <p className="study-local-summary">{activeSummary}</p>
          <div className="chat-log" aria-live="polite">
            {messages.map((message, index) => <div className={`chat-message ${message.role === "user" ? "is-user" : ""}`} key={`${message.role}-${index}-${message.text.slice(0, 12)}`}>{message.text}</div>)}
            {loading && <div className="chat-message">Thinking from the lesson notes…</div>}
          </div>
          <form className="chat-form" onSubmit={ask}>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What would you like explained?" maxLength={600} />
            <div className="chat-form-row">
              <button className="button button-primary" disabled={loading || !question.trim()} type="submit">Ask this lesson</button>
              <button className="button button-secondary" disabled={loading || messages.length < 2} type="button" onClick={(event) => ask(event, "simplify")}>Explain simpler</button>
            </div>
          </form>
        </div>
      )}

      {tab === "cards" && (
        <div className="study-panel">
          {activeCard ? (
            <>
              <button className="flashcard" onClick={() => setCardBack((value) => !value)} type="button">
                <span>
                  <small>{cardBack ? "Answer" : "Key idea"}</small>
                  {cardBack ? <p>{activeCard.back}</p> : <strong>{activeCard.front}</strong>}
                </span>
              </button>
              <div className="flashcard-controls">
                <button onClick={() => { setCardIndex((index) => (index - 1 + flashcards.length) % flashcards.length); setCardBack(false); }}>← Previous</button>
                <span>{cardIndex + 1} of {flashcards.length} · tap card to flip</span>
                <button onClick={() => { setCardIndex((index) => (index + 1) % flashcards.length); setCardBack(false); }}>Next →</button>
              </div>
            </>
          ) : <p className="study-local-summary">No flashcards are available for this lesson yet.</p>}
        </div>
      )}

      {tab === "quiz" && (
        <div className="study-panel">
          {activeQuestion ? (
            <>
              <p className="quiz-question">{activeQuestion.question}</p>
              <div className="quiz-options">
                {activeQuestion.choices.map((choice, choiceIndex) => {
                  const correct = selectedAnswer !== null && choiceIndex === activeQuestion.answer;
                  const wrong = selectedAnswer === choiceIndex && choiceIndex !== activeQuestion.answer;
                  return <button className={`quiz-option ${correct ? "is-correct" : ""} ${wrong ? "is-wrong" : ""}`} onClick={() => answerQuiz(choiceIndex)} key={`${quizIndex}-${choice}`}>{choice}</button>;
                })}
              </div>
              {selectedAnswer !== null && (
                <div className="quiz-feedback">
                  <strong>{selectedAnswer === activeQuestion.answer ? "Correct." : "Not quite."}</strong> {activeQuestion.explanation}
                  <div style={{ marginTop: 9 }}><button className="button button-ghost button-small" onClick={nextQuiz}>{quizIndex === quiz.length - 1 ? "Restart quiz" : "Next question"}</button></div>
                </div>
              )}
              <div className="quiz-progress">Question {quizIndex + 1} of {quiz.length} · score {score}/{quizIndex + (selectedAnswer !== null ? 1 : 0)}</div>
            </>
          ) : <p className="study-local-summary">No quiz is available for this lesson yet.</p>}
        </div>
      )}
    </section>
  );
}
