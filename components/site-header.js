import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { NetworkStatus } from "./network-status";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-lockup" aria-label="BinaryTree home">
          <BrandMark size={40} />
          <span>
            <strong>BinaryTree</strong>
            <small>Learn without limits</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/learn">Courses</Link>
          <Link href="/study">Study tools</Link>
          <Link href="/educators">For educators</Link>
          <Link href="/about">Our approach</Link>
        </nav>
        <div className="header-actions">
          <NetworkStatus />
          <Link className="button button-primary button-small" href="/learn">Start learning</Link>
          <details className="mobile-menu">
            <summary aria-label="Open navigation"><span /><span /><span /></summary>
            <nav aria-label="Mobile navigation">
              <Link href="/learn">Courses</Link>
              <Link href="/study">Study tools</Link>
              <Link href="/educators">For educators</Link>
              <Link href="/about">Our approach</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
