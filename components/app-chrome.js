"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const CHROMELESS_PREFIXES = ["/studio", "/director", "/auth"];

export function AppChrome({ children }) {
  const pathname = usePathname();
  const chromeless = CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (chromeless) return children;
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
