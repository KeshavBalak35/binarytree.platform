"use client";

import { usePathname } from "next/navigation";
import { AiCopilot } from "./ai-copilot";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const CHROMELESS_PREFIXES = ["/studio", "/director", "/auth"];

export function AppChrome({ children }) {
  const pathname = usePathname();
  const chromeless = CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  return (
    <>
      {!chromeless && <SiteHeader />}
      {children}
      {!chromeless && <SiteFooter />}
      <AiCopilot key={pathname} />
    </>
  );
}
