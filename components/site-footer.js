import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-lockup brand-lockup-inverted">
            <BrandMark size={42} inverted />
            <span><strong>BinaryTree</strong><small>Technology education for every learner.</small></span>
          </div>
          <p>Fast, practical curriculum built for shared devices, low bandwidth, and ambitious students everywhere.</p>
        </div>
        <div>
          <h2>Learn</h2>
          <Link href="/learn">Course library</Link>
          <Link href="/study">Study companion</Link>
          <Link href="/learn?track=digital-literacy">Digital literacy</Link>
        </div>
        <div>
          <h2>Teach</h2>
          <Link href="/educators">Educator tools</Link>
          <Link href="/educators/lesson-planner">Lesson-plan generator</Link>
          <a href="https://github.com/KeshavBalak35/binarytree.platform">Curriculum source</a>
        </div>
        <div>
          <h2>Access</h2>
          <span>Works after first load</span>
          <span>English · Kiswahili · Français</span>
          <span>Installable on phone or desktop</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 BinaryTree. Learning should not stop when the internet does.</span>
        <span>Built for low-resource classrooms.</span>
      </div>
    </footer>
  );
}
