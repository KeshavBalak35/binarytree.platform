"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase-client";
import { C, card, ini, Icons, Sidebar, Topbar, PlaygroundCard, Spinner } from "@/components/shared";

const uid = () => Math.random().toString(36).slice(2, 10);
const genPwd = () => {
  const w = ["river", "maple", "solar", "delta", "ember", "cobalt", "willow", "quartz"];
  return w[Math.floor(Math.random() * w.length)] + "-" + Math.floor(100 + Math.random() * 900);
};
const STAFF_ROLES = ["designer", "admin", "founder", "director"];

export default function StudioPortal() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [view, setView] = useState("studio");
  const [screen, setScreen] = useState("list");
  const [sel, setSel] = useState({ course: null, section: null, lesson: null });
  const [lessonPreview, setLessonPreview] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = SUPABASE_CONFIGURED
        ? await supabase.auth.getSession()
        : { data: { session: null } };
      if (!session) {
        // Preview mode — show mock data without redirecting
        setProfile({ id:"preview", name:"Aisha Patel", email:"aisha@binarytree.us", role:"designer", hub:"Nairobi Learning Hub" });
        setCourses([
          { id:"c1", title:"Introduction to Python", category:"Python", level:"Beginner", description:"Learn variables, logic, loops, and the thinking habits behind every great program.", published:true, learner_count:12840,
            sections:[{ id:"s1", title:"Getting Started", sort_order:0, lessons:[
              { id:"l1", title:"What is Programming?", published:true, goal:"Understand what a program is.", steps:["A program is a recipe."], checkpoint:"Why does order matter?", code:'print("hello")', sort_order:0 },
              { id:"l2", title:"Your First Variables", published:true, goal:"Use variables.", steps:["Variables hold values."], checkpoint:"Create a variable.", code:"age = 12", sort_order:1 },
            ]},{ id:"s2", title:"Logic & Control", sort_order:1, lessons:[
              { id:"l3", title:"If-Else Statements", published:false, goal:"Make choices.", steps:["if/else branches."], checkpoint:"Write an if-else.", code:"if x > 0:\n    print('pos')", sort_order:0 },
            ]}],
          },
          { id:"c2", title:"Web Development Foundations", category:"HTML/CSS", level:"Beginner", description:"Build accessible pages with HTML and CSS.", published:true, learner_count:9360,
            sections:[{ id:"s3", title:"HTML Basics", sort_order:0, lessons:[
              { id:"l4", title:"Semantic Structure", published:true, goal:"Use semantic tags.", steps:["Tags describe content."], checkpoint:"Name three semantic tags.", code:"<header><h1>Hello</h1></header>", sort_order:0 },
            ]}],
          },
          { id:"c3", title:"Digital Literacy Essentials", category:"Foundations", level:"Starter", description:"Practice safer browsing and keyboard fluency.", published:true, learner_count:15490,
            sections:[{ id:"s4", title:"Staying Safe Online", sort_order:0, lessons:[
              { id:"l5", title:"Strong Passwords", published:true, goal:"Know what makes passwords strong.", steps:["Length beats complexity."], checkpoint:"Why not reuse passwords?", code:"# No code needed.", sort_order:0 },
            ]}],
          },
        ]);
        setLoading(false);
        return;
      }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (!prof || !STAFF_ROLES.includes(prof.role)) { router.push("/"); return; }
      setProfile(prof);
      await loadCourses();
      if (["admin", "founder"].includes(prof.role)) await loadTeam();
      setLoading(false);
    };
    load();
  }, []);

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*, sections(*, lessons(*))")
      .order("created_at");
    if (data) setCourses(data.map((c) => ({
      ...c,
      sections: (c.sections || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({ ...s, lessons: (s.lessons || []).sort((a, b) => a.sort_order - b.sort_order) })),
    })));
  };

  const loadTeam = async () => {
    const { data } = await supabase.from("profiles").select("*").neq("role", "student").order("name");
    if (data) setTeamMembers(data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const selCourse = courses.find((c) => c.id === sel.course);
  const selSection = selCourse?.sections.find((s) => s.id === sel.section);
  const selLesson = selSection?.lessons.find((l) => l.id === sel.lesson);
  const canAccounts = profile && ["admin", "founder"].includes(profile.role);

  /* ── Course CRUD ── */
  const createCourse = async () => {
    const { data } = await supabase.from("courses").insert({ title: "Untitled course", category: "General", level: "Beginner", description: "", published: false }).select().single();
    if (data) { await loadCourses(); setSel({ course: data.id, section: null, lesson: null }); setScreen("course"); }
  };

  const patchCourse = async (id, patch) => {
    await supabase.from("courses").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    setCourses((p) => p.map((c) => c.id !== id ? c : { ...c, ...patch }));
  };

  const addSection = async (courseId) => {
    const maxOrder = (selCourse?.sections || []).length;
    const { data } = await supabase.from("sections").insert({ course_id: courseId, title: "New section", sort_order: maxOrder }).select().single();
    if (data) await loadCourses();
  };

  const patchSection = async (id, patch) => {
    await supabase.from("sections").update(patch).eq("id", id);
    await loadCourses();
  };

  const addLesson = async (sectionId) => {
    const sec = selCourse?.sections.find((s) => s.id === sectionId);
    const maxOrder = (sec?.lessons || []).length;
    const { data } = await supabase.from("lessons").insert({ section_id: sectionId, title: "New lesson", published: false, goal: "", steps: [], checkpoint: "", code: "", sort_order: maxOrder }).select().single();
    if (data) await loadCourses();
  };

  const patchLesson = async (id, patch) => {
    await supabase.from("lessons").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    await loadCourses();
  };

  const draftLesson = async () => {
    if (!selLesson || !selCourse) return;
    setDraftLoading(true);
    try {
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonTitle: selLesson.title, courseTitle: selCourse.title, courseCategory: selCourse.category }),
      });
      const { goal, steps, checkpoint, code } = await res.json();
      await patchLesson(selLesson.id, { goal, steps, checkpoint, code });
    } catch {}
    setDraftLoading(false);
  };

  /* ── Account creation ── */
  const [newMember, setNewMember] = useState({ name: "", username: "", country: "", hub: "", role: "designer", password: genPwd() });
  const [createResult, setCreateResult] = useState(null);
  const createAccount = async () => {
    if (!newMember.name.trim() || !newMember.username.trim()) { setCreateResult({ err: "Name and username are required." }); return; }
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMember),
    });
    const data = await res.json();
    if (data.error) { setCreateResult({ err: data.error }); return; }
    setCreateResult({ ok: data });
    setNewMember({ name: "", username: "", country: "", hub: "", role: "designer", password: genPwd() });
    await loadTeam();
  };

  const navItems = [["studio", Icons.pencil, "Curriculum Studio"], ...(canAccounts ? [["accounts", Icons.users, "Team Accounts"]] : [])];
  const rColors = { founder: "#2563eb", director: "#0891b2", admin: "#7c3aed", designer: "#15803d" };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: 200, flexShrink: 0, background: C.navy }} />
      <div style={{ flex: 1, background: C.bg }}><Spinner /></div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,sans-serif" }}>
      <Sidebar subtitle="Curriculum Studio" navItems={navItems} view={view} setView={setView} user={profile} onLogout={logout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
        <Topbar eyebrow="Binary Tree Staff" title={view === "studio" ? "Curriculum Studio" : "Team Accounts"} />
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>

          {/* ── COURSE LIST ── */}
          {view === "studio" && screen === "list" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted }}>Every course your team publishes. Open one to edit sections and lessons.</div>
                <button onClick={createCourse} style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>+ New course</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                {courses.map((c) => {
                  const ls = c.sections.reduce((n, s) => n + s.lessons.length, 0);
                  const pubLs = c.sections.reduce((n, s) => n + s.lessons.filter((l) => l.published).length, 0);
                  return (
                    <div key={c.id} style={{ ...card, display: "flex", flexDirection: "column" }}>
                      <div style={{ width: 40, height: 40, background: C.blueSoft, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>📖</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <div style={{ fontSize: 10, fontWeight: 500, color: C.blueText, letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.category} / {c.level}</div>
                        <span style={{ fontSize: 9, fontWeight: 500, padding: "2px 6px", borderRadius: 20, ...(c.published ? { background: "#dcfce7", color: "#15803d" } : { background: "#f1f5f9", color: C.muted }) }}>{c.published ? "Live" : "Draft"}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: C.muted, flex: 1, marginBottom: 10 }}>{c.description || "No description."}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>{c.sections.length} sections · {pubLs}/{ls} lessons live</div>
                      <button onClick={() => { setSel({ course: c.id, section: null, lesson: null }); setScreen("course"); }} style={{ color: C.blue, border: `0.5px solid ${C.blue}`, background: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>✏️ Edit course</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── COURSE EDITOR ── */}
          {view === "studio" && screen === "course" && selCourse && (
            <div>
              <button onClick={() => setScreen("list")} style={{ marginBottom: 14, fontSize: 11, background: "#fff", border: `0.5px solid ${C.line}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>← All courses</button>
              <div style={{ ...card, marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: C.blue, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Course details</div>
                <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Title</label><input defaultValue={selCourse.title} onBlur={(e) => patchCourse(selCourse.id, { title: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Category</label><input defaultValue={selCourse.category} onBlur={(e) => patchCourse(selCourse.id, { category: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} /></div>
                  <div><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Level</label>
                    <select defaultValue={selCourse.level} onBlur={(e) => patchCourse(selCourse.id, { level: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none", background: "#fff" }}>
                      {["Starter", "Beginner", "Intermediate", "Advanced"].map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Description</label><textarea defaultValue={selCourse.description} onBlur={(e) => patchCourse(selCourse.id, { description: e.target.value })} rows={2} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none", resize: "vertical" }} /></div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.ink, cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked={selCourse.published} onChange={(e) => patchCourse(selCourse.id, { published: e.target.checked })} /> Published (visible to learners)
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>Sections & Lessons</div>
                <button onClick={() => addSection(selCourse.id)} style={{ color: C.blue, border: `0.5px solid ${C.blue}`, background: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>+ Add section</button>
              </div>
              {selCourse.sections.map((sec) => (
                <div key={sec.id} style={{ ...card, marginBottom: 10 }}>
                  <input defaultValue={sec.title} onBlur={(e) => patchSection(sec.id, { title: e.target.value })} style={{ width: "100%", fontWeight: 500, border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", color: C.ink, paddingBottom: 8, borderBottom: `0.5px solid ${C.line}`, marginBottom: 8 }} />
                  {sec.lessons.map((l) => (
                    <div key={l.id} onClick={() => { setSel({ course: selCourse.id, section: sec.id, lesson: l.id }); setScreen("lesson"); setLessonPreview(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, cursor: "pointer", marginBottom: 4, background: C.bg }}>
                      <span style={{ fontSize: 13 }}>💻</span>
                      <span style={{ flex: 1, fontSize: 12, color: C.ink }}>{l.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 20, ...(l.published ? { background: C.greenSoft, color: C.green } : { background: "#f1f5f9", color: C.muted }) }}>{l.published ? "Live" : "Draft"}</span>
                    </div>
                  ))}
                  <button onClick={() => addLesson(sec.id)} style={{ fontSize: 11, color: C.blue, border: "none", background: "transparent", padding: "4px 0", marginTop: 4, cursor: "pointer", fontFamily: "inherit" }}>+ Add lesson</button>
                </div>
              ))}
            </div>
          )}

          {/* ── LESSON EDITOR ── */}
          {view === "studio" && screen === "lesson" && selLesson && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <button onClick={() => { setScreen("course"); setLessonPreview(false); }} style={{ fontSize: 11, background: "#fff", border: `0.5px solid ${C.line}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>← {selCourse?.title}</button>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={draftLesson} disabled={draftLoading} style={{ fontSize: 11, background: draftLoading ? "#f1f5f9" : C.navy, color: draftLoading ? C.muted : "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: draftLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {draftLoading ? "Drafting…" : "✨ AI Draft"}
                  </button>
                  <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 8, padding: 3 }}>
                    {[["edit", "✏️ Edit", false], ["prev", "👁 Preview", true]].map(([k, lb, pv]) => (
                      <button key={k} onClick={() => setLessonPreview(pv)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "none", background: lessonPreview === pv ? "#fff" : "transparent", color: C.ink, cursor: "pointer", fontFamily: "inherit" }}>{lb}</button>
                    ))}
                  </div>
                </div>
              </div>
              {!lessonPreview ? (
                <div style={card}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: C.blue, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>{selSection?.title}</div>
                  <LessonEditor lesson={selLesson} onPatch={(patch) => patchLesson(selLesson.id, patch)} />
                </div>
              ) : (
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ ...card, flex: 1, minWidth: 180 }}>
                    <div style={{ background: C.blueSoft, borderRadius: 8, padding: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 500, color: C.blueText, textTransform: "uppercase", letterSpacing: "0.06em" }}>{selCourse?.title}</div>
                      <div style={{ fontSize: 18, fontWeight: 500, color: C.ink, marginTop: 3 }}>{selLesson.title}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 5 }}>Learning Goal</div>
                    <div style={{ fontSize: 12, color: C.body, marginBottom: 12 }}>{selLesson.goal}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 6 }}>Mini Lesson</div>
                    {(Array.isArray(selLesson.steps) ? selLesson.steps : []).filter(Boolean).map((st, i) => <div key={i} style={{ fontSize: 12, color: C.body, marginBottom: 5, paddingLeft: 10, borderLeft: `2px solid ${C.blueSoft}` }}>{st}</div>)}
                    <div style={{ ...card, marginTop: 12, background: "#f8fafc" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 3 }}>Checkpoint</div>
                      <div style={{ fontSize: 12, color: C.body }}>{selLesson.checkpoint}</div>
                    </div>
                  </div>
                  <div style={{ width: 190, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    <PlaygroundCard lesson={selLesson} />
                    <div style={card}><div style={{ fontSize: 12, fontWeight: 500, color: C.ink, marginBottom: 3 }}>✨ AI Feedback</div><div style={{ fontSize: 11, color: C.muted }}>Queued offline. Syncs when online.</div></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TEAM ACCOUNTS ── */}
          {view === "accounts" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 14 }}>Add team member</div>
                {[["Full name", "name", "e.g. Amara Diallo"], ["Email (they'll use this to log in)", "username", "e.g. amara@binarytree.us"], ["Country", "country", "e.g. Uganda"], ["Hub", "hub", "e.g. Kampala Hub"]].map(([l, k, ph]) => (
                  <div key={k} style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>{l}</label><input value={newMember[k]} onChange={(e) => setNewMember((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} /></div>
                ))}
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Role</label>
                  <select value={newMember.role} onChange={(e) => setNewMember((p) => ({ ...p, role: e.target.value }))} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none", background: "#fff" }}>
                    {(profile?.role === "founder" ? ["designer", "admin", "director"] : ["designer"]).map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Temp password</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={newMember.password} onChange={(e) => setNewMember((p) => ({ ...p, password: e.target.value }))} style={{ flex: 1, padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} />
                    <button onClick={() => setNewMember((p) => ({ ...p, password: genPwd() }))} style={{ border: `0.5px solid ${C.line}`, borderRadius: 8, background: "#fff", padding: "0 10px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>↺</button>
                  </div>
                </div>
                <button onClick={createAccount} style={{ width: "100%", background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>+ Create account</button>
                {createResult?.err && <div style={{ marginTop: 10, background: "#fef2f2", color: "#b91c1c", borderRadius: 8, padding: "8px 10px", fontSize: 11 }}>{createResult.err}</div>}
                {createResult?.ok && <div style={{ marginTop: 10, background: C.greenSoft, color: C.green, borderRadius: 8, padding: 10, fontSize: 11 }}><strong>Account created!</strong><br />Email: <strong>{createResult.ok.email}</strong><br />Password: <strong>{newMember.password}</strong><br />Role: <strong>{createResult.ok.role}</strong></div>}
              </div>
              <div style={card}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 14 }}>Team ({teamMembers.length})</div>
                {teamMembers.map((u) => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `0.5px solid ${C.line}` }}>
                    <div style={{ width: 34, height: 34, background: C.blueSoft, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: C.blueText }}>{ini(u.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.ink }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{u.email}{u.country ? " · " + u.country : ""}{u.hub ? " · " + u.hub : ""}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 20, color: rColors[u.role] || C.muted, background: (rColors[u.role] || C.muted) + "22" }}>{u.role}</span>
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

function LessonEditor({ lesson, onPatch }) {
  const [steps, setSteps] = useState(Array.isArray(lesson.steps) ? lesson.steps : []);
  const updateStep = (i, v) => { const s = [...steps]; s[i] = v; setSteps(s); onPatch({ steps: s }); };
  const removeStep = (i) => { const s = steps.filter((_, j) => j !== i); setSteps(s); onPatch({ steps: s }); };
  return (
    <div>
      <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Lesson title</label><input defaultValue={lesson.title} onBlur={(e) => onPatch({ title: e.target.value })} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} /></div>
      <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Learning goal</label><textarea defaultValue={lesson.goal} onBlur={(e) => onPatch({ goal: e.target.value })} rows={2} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none", resize: "vertical" }} /></div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Mini lesson steps</label>
        {steps.map((st, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
            <div style={{ width: 18, height: 18, background: C.blueSoft, color: C.blueText, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, flexShrink: 0, marginTop: 8 }}>{i + 1}</div>
            <input value={st} onChange={(e) => updateStep(i, e.target.value)} style={{ flex: 1, padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} />
            <button onClick={() => removeStep(i)} style={{ marginTop: 6, fontSize: 12, color: "#ef4444", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
          </div>
        ))}
        <button onClick={() => { const s = [...steps, ""]; setSteps(s); onPatch({ steps: s }); }} style={{ fontSize: 11, color: C.blue, border: "none", background: "transparent", padding: "4px 0", cursor: "pointer", fontFamily: "inherit" }}>+ Add step</button>
      </div>
      <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Checkpoint</label><textarea defaultValue={lesson.checkpoint} onBlur={(e) => onPatch({ checkpoint: e.target.value })} rows={2} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none", resize: "vertical" }} /></div>
      <div style={{ marginBottom: 10 }}><label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Starter code</label><textarea defaultValue={lesson.code} onBlur={(e) => onPatch({ code: e.target.value })} rows={4} style={{ width: "100%", padding: "7px 10px", border: `0.5px solid #0b1b36`, borderRadius: 8, fontSize: 11, fontFamily: "monospace", color: "#e2e8f0", background: "#0b1b36", outline: "none", resize: "vertical" }} /></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.ink, cursor: "pointer" }}><input type="checkbox" defaultChecked={lesson.published} onChange={(e) => onPatch({ published: e.target.checked })} /> Published (visible to learners)</label>
        <span style={{ fontSize: 10, color: C.muted }}>✓ Saves on blur</span>
      </div>
    </div>
  );
}
