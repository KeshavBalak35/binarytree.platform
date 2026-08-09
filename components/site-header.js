import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { MobileNavigation } from "./mobile-navigation";
import { NetworkStatus } from "./network-status";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="explore-link assessment-start-link" href="/assessment">
          <span>Start here</span>
          Assessment
        </Link>
        <Link href="/" className="brand-lockup" aria-label="Binary Tree home">
          <BrandMark size={36} />
          <span><strong>Binary Tree</strong><small>Useful learning, one step at a time</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link className="treepath-nav-link" href="/tree-path">TreePath</Link>
          <Link href="/learn">Courses</Link>
          <Link href="/lab">Projects</Link>
          <Link href="/progress">Progress</Link>
        </nav>
        <div className="header-actions">
          <NetworkStatus />
          <Link className="header-signup-link" href="/apply">Apply to join</Link>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
