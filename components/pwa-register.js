"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    let serviceWorker;
    try {
      if (!("serviceWorker" in navigator)) return;
      serviceWorker = navigator.serviceWorker;
    } catch {
      return;
    }
    const register = () => serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);
  return null;
}
