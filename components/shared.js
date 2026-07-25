"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const C = {
  navy: "#0f1d3a", navy2: "#16264a", blue: "#2563eb", blueSoft: "#dbeafe", blueText: "#1d4ed8",
  ink: "#0f172a", body: "#334155", muted: "#64748b", line: "#e2e8f0", bg: "#f6f8fc",
  white: "#ffffff", code: "#0b1b36", green: "#15803d", greenSoft: "#dcfce7",
};

export const card = { background: "#fff", border: `0.5px solid #e2e8f0`, borderRadius: 14, padding: 20 };

export const ini = (n = "") =>
  n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "??";

const ic = (d, size = 16) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {d}
  </svg>
);

export const Icons = {
  home:    ic(<><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></>),
  book:    ic(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>),
  code:    ic(<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>),
  users:   ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  pencil:  ic(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>),
  chart:   ic(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>),
  settings:ic(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>),
  signal:  ic(<><path d="M1.5 8.5a13 13 0 0 1 21 0"/><path d="M5 12a9 9 0 0 1 14 0"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/></>),
  play:    ic(<><polygon points="5 3 19 12 5 21 5 3"/></>),
};

const LogoIcon = () => (
  <Image src="/btlogo.png" alt="Binary Tree" width={24} height={24} style={{ borderRadius: 4, display: "block" }} />
);

export function Sidebar({ subtitle, navItems, view, setView, user, onLogout }) {
  return (
    <div style={{ width: 200, flexShrink: 0, background: C.navy, display: "flex", flexDirection: "column", padding: 14 }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, cursor: "pointer", textDecoration: "none" }}>
        <div style={{ width: 36, height: 36, background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: C.navy, flexShrink: 0 }}>
          <LogoIcon />
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>Binary Tree</div>
          <div style={{ color: "#9fb4d6", fontSize: 10 }}>{subtitle}</div>
        </div>
      </Link>
      {navItems.map(([v, icon, lb]) => {
        const active = view === v;
        return (
          <button key={v} onClick={() => setView(v)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontSize: 12, fontWeight: 500, marginBottom: 2, fontFamily: "inherit", background: active ? "#fff" : "transparent", color: active ? C.navy : "#cdd9ef" }}>
            <span style={{ color: active ? C.navy : "#7e93b8", display: "flex" }}>{icon}</span>
            {lb}
          </button>
        );
      })}
      <div style={{ marginTop: "auto" }}>
        {user && (
          <div style={{ background: C.navy2, borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: C.blue, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "#fff" }}>{ini(user.name)}</div>
              <div>
                <div style={{ color: "#fff", fontSize: 11, fontWeight: 500 }}>{user.name}</div>
                <div style={{ color: "#9fb4d6", fontSize: 10, textTransform: "capitalize" }}>{user.role}</div>
              </div>
            </div>
            <button onClick={onLogout} style={{ fontSize: 10, color: "#9fb4d6", background: "transparent", border: "0.5px solid #2a3c61", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
          </div>
        )}
        <div style={{ background: C.navy2, borderRadius: 10, padding: 12 }}>
          <div style={{ color: "#9fb4d6", fontSize: 10, fontWeight: 500 }}>Mission Reach</div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 500 }}>37K+</div>
          <div style={{ color: "#7e93b8", fontSize: 10, marginTop: 2 }}>Students learning offline</div>
        </div>
      </div>
    </div>
  );
}

export function Topbar({ eyebrow, title, rightSlot, online }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#fff", borderBottom: `0.5px solid #e2e8f0` }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: C.blue, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{eyebrow}</div>
        <div style={{ fontSize: 17, fontWeight: 500, color: C.ink }}>{title}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {rightSlot}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: online ? C.green : C.blue, background: online ? C.greenSoft : C.blueSoft, borderRadius: 8, padding: "5px 10px" }}>
          <span style={{ color: online ? C.green : C.blue, display: "flex" }}>{Icons.signal}</span>
          {online ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
}

export function BarProgress({ value }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.body }}>Progress</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: C.ink }}>{value}%</span>
      </div>
      <div style={{ background: C.line, borderRadius: 4, height: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 4, background: C.blue, width: `${value}%` }} />
      </div>
    </div>
  );
}

export function PlaygroundCard({ lesson }) {
  const [ran, setRan] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(lesson.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ background: "#0f1d3a", borderRadius: 12, padding: 16 }}>
      <div style={{ color: "#9fb4d6", fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Browser Playground</div>
      <div style={{ color: "#fff", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{lesson.title}</div>
      <pre style={{ background: "#0b1b36", color: "#e2e8f0", borderRadius: 6, padding: 10, fontSize: 10, overflow: "auto", minHeight: 80, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{lesson.code}</pre>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button onClick={() => setRan(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", color: "#0f1d3a", border: "none", borderRadius: 6, padding: "8px 0", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          <span style={{ display: "flex", color: "#0f1d3a" }}>{Icons.play}</span> Run locally
        </button>
        <button onClick={copy} style={{ background: "transparent", color: "#9fb4d6", border: "0.5px solid #2a3c61", borderRadius: 6, padding: "8px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{copied ? "✓" : "Copy"}</button>
      </div>
      {ran && <div style={{ marginTop: 6, fontSize: 10, background: "#0b1b36", color: "#7ee787", padding: "6px 8px", borderRadius: 4 }}>Run in your local Python/browser environment</div>}
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{ width: 24, height: 24, border: `2.5px solid #e2e8f0`, borderTopColor: "#2563eb", borderRadius: "50%", animation: "bt-spin 0.7s linear infinite" }} />
      <style>{`@keyframes bt-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
