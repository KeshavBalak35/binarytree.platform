import Link from "next/link";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="planner-page" id="main-content">
      <div className="narrow-container">
        <section className="plan-output plan-empty"><div><div className="plan-empty-icon">↓</div><h1>You’re offline—and that’s okay.</h1><p>Your downloaded lessons, flashcards, quizzes, and saved progress are still available. AI answers return when the connection does.</p><Link className="button button-primary" href="/learn">Open downloaded courses</Link></div></section>
      </div>
    </main>
  );
}
