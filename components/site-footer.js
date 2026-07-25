import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-lockup brand-lockup-inverted">
            <BrandMark size={40} inverted />
            <span><strong>BinaryTree</strong><small>Practical technology education.</small></span>
          </div>
          <p>Professional, offline-ready learning for ambitious students and the educators who support them.</p>
        </div>
        <div>
          <h2>Learn</h2>
          <Link href="/learn">Course library</Link>
          <Link href="/typing">Typing practice</Link>
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
          <h2>Platform</h2>
          <Link href="/about">Our approach</Link>
          <span>Works after the first load</span>
          <span>English · Kiswahili · Français</span>
          <span>Phone, tablet, and desktop ready</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 BinaryTree.</span>
        <span>Learning should not stop when the internet does.</span>
      </div>
    </footer>
  );
}
