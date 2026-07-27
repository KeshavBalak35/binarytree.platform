"use client";

import { useState } from "react";

const LANGUAGES = [
  { value: "en", label: "English", eyebrow: "English overview" },
  { value: "sw", label: "Kiswahili", eyebrow: "Muhtasari wa Kiswahili" },
  { value: "fr", label: "Français", eyebrow: "Résumé français" },
];

export function LessonLanguageSwitcher({ summary, summarySw, summaryFr, translationStatus }) {
  const [language, setLanguage] = useState("en");
  const summaries = { en: summary, sw: summarySw, fr: summaryFr };
  const active = LANGUAGES.find((item) => item.value === language);

  return (
    <section className="lesson-language" aria-label="Lesson overview language">
      <div className="lesson-language-topline">
        <span>Read the overview in</span>
        <div className="lesson-language-options" role="group" aria-label="Choose lesson overview language">
          {LANGUAGES.map((item) => (
            <button className={language === item.value ? "is-active" : ""} type="button" aria-pressed={language === item.value} onClick={() => setLanguage(item.value)} key={item.value}>{item.label}</button>
          ))}
        </div>
      </div>
      <div className="lesson-language-copy" key={language}>
        <small>{active.eyebrow}</small>
        <p>{summaries[language]}</p>
        {language !== "en" && <span className="language-review-note">Draft translation · {translationStatus}</span>}
      </div>
    </section>
  );
}
