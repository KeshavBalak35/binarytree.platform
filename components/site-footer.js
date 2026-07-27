import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-lockup brand-lockup-inverted">
            <BrandMark size={40} inverted />
            <span><strong>Binary Tree</strong><small>Useful learning, one step at a time.</small></span>
          </div>
          <p>Practical, offline-ready learning made for real classrooms, shared devices, and imperfect internet.</p>
        </div>
        <div>
          <h2>Learn</h2>
          <Link href="/learn">Course library</Link>
          <Link href="/typing">Typing practice</Link>
          <Link href="/study">Study companion</Link>
          <Link href="/assessment">Skills assessment</Link>
          <Link href="/learn?track=digital-literacy">Digital literacy</Link>
        </div>
        <div>
          <h2>Teach</h2>
          <Link href="/educators">Educator tools</Link>
          <Link href="/educators/lesson-planner">Lesson-plan generator</Link>
          <a href="https://github.com/KeshavBalak35/binarytree.platform">Curriculum source</a>
        </div>
        <div>
          <h2>Organization</h2>
          <Link href="/team">Our team</Link>
          <Link href="/partners">Partners</Link>
          <Link href="/apply">Apply to join</Link>
          <Link href="/about">Our approach</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Binary Tree Learning.</span>
        <span>Offline ready · English, Kiswahili, Français · built for every screen</span>
      </div>
    </footer>
  );
}
