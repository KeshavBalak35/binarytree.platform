import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { MobileNavigation } from "./mobile-navigation";
import { NetworkStatus } from "./network-status";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="explore-link" href="/assessment">
          Start assessment
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.5 4.25 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" /></svg>
        </Link>
        <Link href="/" className="brand-lockup" aria-label="Binary Tree home">
          <BrandMark size={36} />
          <span><strong>Binary Tree</strong><small>Useful learning, one step at a time</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/learn">Courses</Link>
          <Link href="/lab">Projects</Link>
          <Link href="/progress">Progress</Link>
          <Link href="/typing">Typing practice</Link>
          <Link href="/educators">For educators</Link>
          <Link href="/team">Team</Link>
          <Link href="/partners">Partners</Link>
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