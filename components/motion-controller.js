"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let observer;
    let mutations;

    const start = window.setTimeout(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotion.matches || !("IntersectionObserver" in window)) {
        root.classList.remove("motion-ready");
        document.querySelectorAll("[data-reveal]").forEach((node) => node.classList.add("is-revealed"));
        return;
      }

      root.classList.add("motion-ready");
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      const observe = (scope) => {
        if (scope.matches?.("[data-reveal]")) observer.observe(scope);
        scope.querySelectorAll?.("[data-reveal]:not(.is-revealed)").forEach((node) => observer.observe(node));
      };

      observe(document);
      mutations = new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (node instanceof Element) observe(node);
          });
        }
      });
      mutations.observe(document.body, { childList: true, subtree: true });
    }, 1000);

    return () => {
      window.clearTimeout(start);
      mutations?.disconnect();
      observer?.disconnect();
      root.classList.remove("motion-ready");
    };
  }, [pathname]);

  return null;
}