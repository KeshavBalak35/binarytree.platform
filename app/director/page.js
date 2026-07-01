"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase-client";
import { C, card, ini, Icons, Sidebar, Topbar, Spinner } from "@/components/shared";

const GEO = [
  { country: "Uganda", flag: "🇺🇬", learners: 8420, active: 3210, growth: 18, hub: "Kampala Digital Hub" },
  { country: "Kenya", flag: "🇰🇪", learners: 6890, active: 2780, growth: 12, hub: "Nairobi Learning Hub" },
  { country: "Nigeria", flag: "🇳🇬", learners: 5340, active: 1920, growth: 24, hub: "Lagos Code Circle" },
  { country: "Philippines", flag: "🇵🇭", learners: 4120, active: 1670, growth: 21, hub: "Manila Community Lab" },
  { country: "Ghana", flag: "🇬🇭", learners: 3210, active: 1340, growth: 9, hub: "Accra Tech Hub" },
  { country: "India", flag: "🇮🇳", learners: 3780, active: 1540, growth: 7, hub: "Mumbai Outreach" },
  { country: "Tanzania", flag: "🇹🇿", learners: 2890, active: 980, growth: 15, hub: "Dar es Salaam Hub" },
  { country: "United States", flag: "🇺🇸", learners: 1890, active: 890, growth: 3, hub: "Chicago Remote Circle" },
  { country: "Rwanda", flag: "🇷🇼", learners: 980, active: 420, growth: 31, hub: "Kigali Pilot" },
  { country: "Ethiopia", flag: "🇪🇹", learners: 720, active: 310, growth: 28, hub: "Addis Ababa Hub" },
];

const MONTHLY = [
  { m: "Jan", learners: 28400, lessons: 4200, comp: 1890 },
  { m: "Feb", learners: 29800, lessons: 4800, comp: 2100 },
  { m: "Mar", learners: 31200, lessons: 5100, comp: 2340 },
  { m: "Apr", learners: 33400, lessons: 5600, comp: 2580 },
  { m: "May", learners: 35100, lessons: 6200, comp: 2890 },
  { m: "Jun", learners: 37490, lessons: 7100, comp: 3210 },
];

export default function DirectorPortal() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState("impact");
  const [courses, setCourses] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({ totalLearners: 0, totalLessons: 0, completions: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = SUPABASE_CONFIGURED
        ? await supabase.auth.getSession()
        : { data: { session: null } };
      if (!session) {
        // Preview mode — show mock data without redirecting
        setProfile({ id:"preview", name:"Nishan Mani", email:"nishan@binarytree.us", role:"founder", hub:"HQ" });
        setTeamMembers([
          { id:"u2", name:"Sarah Okonkwo", email:"director@binarytree.us", role:"director", hub:"Africa Programs", country:"Nigeria" },
          { id:"u4", name:"Aisha Patel", email:"aisha@binarytree.us", role:"designer", hub:"Nairobi Learning Hub", country:"Kenya" },
          { id:"u5", name:"Marcus Lee", email:"marcus@binarytree.us", role:"designer", hub:"Chicago Remote Circle", country:"United States" },
        ]);
        setLoading(false);
        return;
      }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (!prof || !["founder", "director"].includes(prof.role)) { router.push("/"); return; }
      setProfile(prof);

      const [{ data: cData }, { data: team }, { data: progData }] = await Promise.all([
        supabase.from("courses").select("*, sections(*, lessons(*))"),
        supabase.from("profiles").select("*").neq("role", "student"),
        supabase.from("progress").select("id"),
      ]);

      if (cData) setCourses(cData);
      if (team) setTeamMembers(team);
      const totalLearners = await supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student");
      setStats({
        totalLearners: totalLearners.count || GEO.reduce((n, g) => n + g.learners, 0),
        totalLessons: (cData || []).reduce((n, c) => n + (c.sections || []).reduce((m, s) => m + (s.lessons || []).length, 0), 0),
        completions: (progData || []).length,
      });
      setLoading(false);
    };
    load();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const isFounder = profile?.role === "founder";
  const navItems = [["impact", Icons.chart, "Impact Dashboard"], ["team", Icons.users, "Team & Accounts"], ...(isFounder ? [["settings", Icons.settings, "Org Settings"]] : [])];

  const pubLessons = courses.reduce((n, c) => n + (c.sections || []).reduce((m, s) => m + (s.lessons || []).filter((l) => l.published).length, 0), 0);
  const totLessons = courses.reduce((n, c) => n + (c.sections || []).reduce((m, s) => m + (s.lessons || []).length, 0), 0);
  const total = GEO.reduce((n, g) => n + g.learners, 0);
  const active = GEO.reduce((n, g) => n + g.active, 0);
  const maxL = Math.max(...GEO.map((g) => g.learners));
  const maxM = Math.max(...MONTHLY.map((h) => h.learners));
  const lastM = MONTHLY[MONTHLY.length - 1];
  const rColors = { founder: "#2563eb", director: "#0891b2", admin: "#7c3aed", designer: "#15803d" };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: 200, flexShrink: 0, background: C.navy }} />
      <div style={{ flex: 1, background: C.bg }}><Spinner /></div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,sans-serif" }}>
      <Sidebar subtitle="Founder Portal" navItems={navItems} view={view} setView={setView} user={profile} onLogout={logout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
        <Topbar eyebrow={`Binary Tree · ${profile?.role}`} title={{ impact: "Impact Dashboard", team: "Team & Accounts", settings: "Org Settings" }[view] || "Impact Dashboard"} />
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>

          {/* ── IMPACT ── */}
          {view === "impact" && (
            <div>
              <div style={{ background: `linear-gradient(120deg,${C.navy},${C.blue})`, borderRadius: 12, padding: 18, color: "#fff", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: "#bcd0f5", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Live snapshot</div>
                <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 3 }}>Binary Tree Global Impact</div>
                <div style={{ fontSize: 12, color: "#dbe6fb" }}>Reach, engagement, and curriculum health across all hubs and countries.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                {[
                  ["Total learners", total.toLocaleString(), "across all hubs"],
                  ["Active this month", active.toLocaleString(), `${Math.round(active / total * 100)}% of total`],
                  ["Countries", GEO.length, "active learning hubs"],
                  ["Lessons published", `${pubLessons}/${totLessons}`, "curriculum health"],
                  ["Courses live", courses.filter((c) => c.published).length, "available to learners"],
                  ["Completions (Jun)", lastM.comp.toLocaleString(), "this month"],
                ].map(([l, v, sub]) => (
                  <div key={l} style={card}><div style={{ fontSize: 20, fontWeight: 500, color: C.ink }}>{v}</div><div style={{ fontSize: 11, fontWeight: 500, color: C.ink, marginTop: 2 }}>{l}</div><div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{sub}</div></div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div style={card}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.ink, marginBottom: 12 }}>📈 Learner growth — 6 months</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
                    {MONTHLY.map((h, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ fontSize: 9, color: C.blue, fontWeight: 500 }}>{(h.learners / 1000).toFixed(1)}k</div>
                        <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: i === MONTHLY.length - 1 ? C.blue : C.blueSoft, height: `${Math.round(h.learners / maxM * 80)}px` }} />
                        <div style={{ fontSize: 9, color: C.muted }}>{h.m}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 10, paddingTop: 10, borderTop: `0.5px solid ${C.line}` }}>
                    {[["Lessons", lastM.lessons.toLocaleString()], ["Completions", lastM.comp.toLocaleString()], ["Rate", Math.round(lastM.comp / lastM.lessons * 100) + "%"]].map(([l, v]) => (
                      <div key={l}><div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{v}</div><div style={{ fontSize: 9, color: C.muted }}>{l}</div></div>
                    ))}
                  </div>
                </div>
                <div style={card}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.ink, marginBottom: 10 }}>🏅 Top hubs by activity</div>
                  {[...GEO].sort((a, b) => b.active - a.active).slice(0, 5).map((g, i) => (
                    <div key={g.country} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `0.5px solid ${C.line}` }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: C.blue, width: 16 }}>#{i + 1}</div>
                      <div style={{ fontSize: 14 }}>{g.flag}</div>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 500, color: C.ink }}>{g.hub}</div><div style={{ fontSize: 10, color: C.muted }}>{g.country}</div></div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: C.green }}>{g.active.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={card}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.ink, marginBottom: 12 }}>🗺 Geographic reach — learners by country</div>
                {[...GEO].sort((a, b) => b.learners - a.learners).map((g) => (
                  <div key={g.country} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 14 }}>{g.flag}</div>
                    <div style={{ width: 95, flexShrink: 0 }}><div style={{ fontSize: 11, fontWeight: 500, color: C.ink }}>{g.country}</div><div style={{ fontSize: 10, color: C.muted }}>{g.hub}</div></div>
                    <div style={{ flex: 1, background: C.line, borderRadius: 4, height: 6, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 4, background: C.blue, width: `${Math.round(g.learners / maxL * 100)}%` }} /></div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.ink, width: 46, textAlign: "right" }}>{g.learners.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: C.green, width: 46, textAlign: "right" }}>+{g.growth}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TEAM ── */}
          {view === "team" && (
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 14 }}>Team ({teamMembers.length} staff members)</div>
              {teamMembers.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted }}>No staff accounts yet. Use Curriculum Studio → Team Accounts to add staff.</div>
              ) : (
                teamMembers.map((u) => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `0.5px solid ${C.line}` }}>
                    <div style={{ width: 36, height: 36, background: C.blueSoft, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: C.blueText }}>{ini(u.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{u.email}{u.country ? " · " + u.country : ""}{u.hub ? " · " + u.hub : ""}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 20, color: rColors[u.role] || C.muted, background: (rColors[u.role] || C.muted) + "22" }}>{u.role}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── ORG SETTINGS ── */}
          {view === "settings" && isFounder && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 14 }}>Organisation details</div>
                {[["Org name", "Binary Tree"], ["Mission", "Offline-first digital literacy for underprivileged communities"], ["Website", "binarytree.us"], ["Primary contact", "nishan@binarytree.us"]].map(([l, v]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>{l}</label>
                    <input defaultValue={v} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} />
                  </div>
                ))}
                <button style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Save changes</button>
              </div>
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 14 }}>Backend & integrations</div>
                {[
                  ["Database", "Supabase Postgres", "✓ Connected", C.green],
                  ["Authentication", "Supabase Auth", "✓ Active", C.green],
                  ["AI Feedback", process.env.NEXT_PUBLIC_AI_ENABLED ? "Anthropic API" : "Not configured", process.env.NEXT_PUBLIC_AI_ENABLED ? "✓ Active" : "Add ANTHROPIC_API_KEY", process.env.NEXT_PUBLIC_AI_ENABLED ? C.green : "#dc2626"],
                  ["Offline sync", "Service worker", "✓ Configured", C.green],
                ].map(([l, sub, a, col]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `0.5px solid ${C.line}` }}>
                    <div><div style={{ fontSize: 12, fontWeight: 500, color: C.ink }}>{l}</div><div style={{ fontSize: 10, color: C.muted }}>{sub}</div></div>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 6, color: col, background: col + "22" }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
