import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { MobileNavigation } from "./mobile-navigation";
import { NetworkStatus } from "./network-status";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="explore-link" href="/learn">
          Explore
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.5 4.25 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" /></svg>
        </Link>
        <Link href="/" className="brand-lockup" aria-label="BinaryTree home">
          <BrandMark size={36} />
          <span><strong>BinaryTree</strong><small>Learning platform</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link className="header-search-link" href="/learn" aria-label="Search the course library"><SearchIcon /><span>Search</span></Link>
          <Link href="/typing">Typing practice</Link>
          <Link href="/educators">For educators</Link>
          <Link href="/about">About</Link>
        </nav>
        <div className="header-actions">
          <NetworkStatus />
          <Link className="header-signup-link" href="/learn">Start learning</Link>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
