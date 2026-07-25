"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/learn", label: "Courses" },
  { href: "/typing", label: "Typing practice" },
  { href: "/study", label: "Study tools" },
  { href: "/educators", label: "For educators" },
  { href: "/about", label: "Our approach" },
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-navigation">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <>
          <button className="mobile-navigation-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <nav className="mobile-navigation-panel" id="mobile-navigation-panel" aria-label="Mobile navigation">
            <div className="mobile-navigation-heading">
              <strong>Explore BinaryTree</strong>
              <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>×</button>
            </div>
            {links.map((link) => (
              <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>
                {link.label}<span aria-hidden="true">›</span>
              </Link>
            ))}
            <Link className="button button-primary" href="/learn" onClick={() => setOpen(false)}>Start learning</Link>
          </nav>
        </>
      )}
    </div>
  );
}
