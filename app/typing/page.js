import Link from "next/link";
import { TypingGame } from "@/components/typing-game";

export const metadata = {
  title: "Typing practice",
  description: "Build keyboard speed and accuracy with a focused one-minute typing challenge that works offline.",
};

export const dynamic = "force-static";

export default function TypingPage() {
  return (
    <main id="main-content" className="typing-page">
      <section className="typing-page-intro">
        <div className="narrow-container">
          <div className="lesson-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Typing practice</span></div>
          <p className="eyebrow">Digital foundations</p>
          <h1>Type faster. Make fewer mistakes.</h1>
          <p>Build the keyboard confidence you need for school, work, and coding through short, measurable practice.</p>
        </div>
      </section>
      <section className="typing-page-content"><div className="narrow-container"><TypingGame /></div></section>
      <section className="typing-how"><div className="narrow-container"><h2>How to improve</h2><div className="typing-how-grid"><article><span>1</span><h3>Accuracy first</h3><p>Slow down enough to type the correct key. Speed follows consistent movement.</p></article><article><span>2</span><h3>Keep a steady rhythm</h3><p>Use light, even keystrokes instead of rushing through familiar words.</p></article><article><span>3</span><h3>Practice briefly</h3><p>One focused minute each day builds better habits than one long session.</p></article></div></div></section>
    </main>
  );
}
