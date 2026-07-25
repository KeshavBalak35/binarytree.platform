const CACHE_VERSION = "binarytree-v3-2026-07-25";
const CORE_ROUTES = ["/", "/learn", "/typing", "/study", "/educators", "/educators/lesson-planner", "/about", "/offline", "/manifest.webmanifest", "/app-icon.svg", "/btlogo.png"];

async function lessonRoutes() {
  try {
    const response = await fetch("/offline-lessons.json", { cache: "no-store" });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

async function warmRoute(cache, route) {
  try {
    const response = await fetch(route, { cache: "reload" });
    if (!response.ok) return;
    await cache.put(route, response.clone());
    if ((response.headers.get("content-type") || "").includes("text/html")) {
      const html = await response.text();
      const assets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
        .map((match) => match[1])
        .filter((url) => url.startsWith("/_next/static/") || url.startsWith("/btlogo") || url.startsWith("/app-icon"));
      await Promise.allSettled([...new Set(assets)].map(async (asset) => {
        const assetResponse = await fetch(asset, { cache: "reload" });
        if (assetResponse.ok) await cache.put(asset, assetResponse);
      }));
    }
  } catch {}
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const routes = [...CORE_ROUTES, ...(await lessonRoutes())];
    for (const route of routes) await warmRoute(cache, route);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_VERSION).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeout);
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(CACHE_VERSION);
        return (await cache.match(request)) || (await cache.match(url.pathname)) || (url.pathname.startsWith("/learn") ? await cache.match("/learn") : null) || (await cache.match("/offline"));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  })());
});
