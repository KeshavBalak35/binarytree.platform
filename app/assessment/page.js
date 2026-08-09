import Link from "next/link";
import { AssessmentForm } from "@/components/assessment-form";

export const metadata = {
  title: "Skills assessment",
  description: "An offline-ready pre and post assessment for practical digital, coding, design, and entrepreneurship skills.",
};

export const dynamic = "force-static";

export default function AssessmentPage() {
  return (
    <main id="main-content" className="assessment-page">
      <section className="assessment-hero">
        <span className="assessment-hero-scribble" aria-hidden="true">notice the change</span>
        <div className="narrow-container" data-reveal>
          <div className="lesson-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Skills assessment</span></div>
          <p className="eyebrow">Pre + post program check-in</p>
          <h1>This is a snapshot,<br /><em>not a judgment.</em></h1>
          <p>Answer from what you know today. Take it once before the program and once after—the difference helps your instructor understand what worked.</p>
          <div className="assessment-hero-meta"><span>16 scored questions</span><span>8 skill areas</span><span>about 10 minutes</span></div>
        </div>
      </section>
      <section className="assessment-content"><div className="narrow-container"><AssessmentForm /></div></section>
    </main>
  );
}
