import Link from "next/link";

const navy = "#0f1d3a";
const navy2 = "#16264a";
const blue = "#2563eb";
const blueSoft = "#dbeafe";
const ink = "#0f172a";
const muted = "#64748b";
const line = "#e2e8f0";

const SVG = ({ children, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const LogoMark = () => (
  <img src="/btlogo.png" alt="Binary Tree" width={28} height={28} style={{ borderRadius: 4, display: "block" }} />
);

const PORTALS = [
  {
    href: "/student",
    icon: (
      <SVG size={22}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </SVG>
    ),
    label: "For students",
    title: "Learning Platform",
    sub: "Browse courses, follow lessons, and practice coding. No sign-in needed — works offline too.",
    cta: "Start learning",
    accent: blue,
    accentBg: blueSoft,
  },
  {
    href: "/studio",
    icon: (
      <SVG size={22}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </SVG>
    ),
    label: "For educators",
    title: "Curriculum Studio",
    sub: "Create and publish lessons, manage course structure, and draft content with AI assistance.",
    cta: "Staff sign in",
    accent: "#0891b2",
    accentBg: "#e0f2fe",
  },
  {
    href: "/director",
    icon: (
      <SVG size={22}>
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </SVG>
    ),
    label: "For leadership",
    title: "Founder Portal",
    sub: "Track impact across hubs, manage team accounts, and view learner growth by country.",
    cta: "Admin sign in",
    accent: "#7c3aed",
    accentBg: "#ede9fe",
  },
];

const STATS = [
  { value: "37K+", label: "Students learning offline" },
  { value: "10", label: "Countries with active hubs" },
  { value: "3", label: "Courses available" },
];

export default function Home() {
  return (
    <div style={{ background: navy, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui,sans-serif" }}>

      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "0.5px solid #1e3460" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
          <div style={{ width: 36, height: 36, background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: navy }}>
            <LogoMark />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Binary Tree</div>
            <div style={{ fontSize: 10, color: "#7e93b8" }}>Offline-first learning</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#7e93b8" }}>binarytree.us</div>
      </div>

      {/* hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 32px 40px" }}>
        <div style={{ maxWidth: 480, textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-block", fontSize: 11, fontWeight: 500, color: "#93b4e8", background: "#1e3460", borderRadius: 20, padding: "5px 14px", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
            Offline-first · Classroom-ready
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, color: "#fff", lineHeight: 1.2, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
            Coding education that keeps going when the internet cannot.
          </h1>
          <p style={{ fontSize: 14, color: "#9fb4d6", lineHeight: 1.7, margin: 0 }}>
            Binary Tree brings digital literacy, Python, and web development to under-resourced classrooms — with cached lessons, a browser-native coding playground, and automatic progress sync.
          </p>
        </div>

        {/* portal cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, width: "100%", maxWidth: 800, marginBottom: 48 }}>
          {PORTALS.map(({ href, icon, label, title, sub, cta, accent, accentBg }) => (
            <div key={href} style={{ background: "#fff", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, background: accentBg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: ink }}>{title}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: muted, lineHeight: 1.65, flex: 1, marginBottom: 18 }}>{sub}</div>
              <Link href={href} style={{ background: accent, color: "#fff", borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 500, textDecoration: "none", display: "block", textAlign: "center" }}>
                {cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* stats row */}
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: "#fff" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#7e93b8", marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: "16px 32px", borderTop: "0.5px solid #1e3460", textAlign: "center", fontSize: 11, color: "#4d6490" }}>
        Binary Tree · Offline-first learning · © 2026
      </div>
    </div>
  );
}
