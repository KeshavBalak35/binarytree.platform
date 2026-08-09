"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const navigationGroups = [
  {
    label: "Learn and practice",
    links: [
      { href: "/assessment", label: "Start with the assessment", detail: "Do this before your first lesson" },
      { href: "/learn", label: "Courses", detail: "Browse every learning track" },
      { href: "/lab", label: "Project Library", detail: "One practical project for every lesson" },
      { href: "/progress", label: "Progress tree", detail: "See every checkpoint grow your tree" },
      { href: "/typing", label: "Typing practice", detail: "Build speed with Key Quest" },
      { href: "/study", label: "Study tools", detail: "Notes, flashcards, and quizzes" },
    ],
  },
  {
    label: "Binary Tree",
    links: [
      { href: "/educators", label: "For educators", detail: "Teaching tools and lesson planning" },
      { href: "/team", label: "Our team", detail: "Meet the people behind the work" },
      { href: "/partners", label: "Partners", detail: "Organizations growing our reach" },
      { href: "/about", label: "Our approach", detail: "How and why we teach" },
    ],
  },
];
export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

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
      {open && createPortal((
        <>
          <button className="mobile-navigation-scrim" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <nav className="mobile-navigation-panel" id="mobile-navigation-panel" aria-label="Mobile navigation">
            <div className="mobile-navigation-heading">
              <div>
                <span>Menu</span>
                <strong>Where would you like to go?</strong>
              </div>
              <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="m4.5 4.5 11 11m0-11-11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mobile-navigation-content">
              {navigationGroups.map((group) => (
                <div className="mobile-navigation-group" key={group.label}>
                  <p>{group.label}</p>
                  {group.links.map((link) => {
                    const current = pathname === link.href || (["/learn", "/lab"].includes(link.href) && pathname.startsWith(`${link.href}/`));
                    return (
                      <Link className={current ? "is-current" : undefined} href={link.href} aria-current={current ? "page" : undefined} onClick={() => setOpen(false)} key={link.href}>
                        <span><strong>{link.label}</strong><small>{link.detail}</small></span>
                        <span className="mobile-navigation-arrow" aria-hidden="true">→</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mobile-navigation-footer">
              <Link className="button button-primary" href="/apply" onClick={() => setOpen(false)}>Apply to join Binary Tree</Link>
            </div>
          </nav>
        </>
      ), document.body)}
    </div>
  );
}