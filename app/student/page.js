"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient, SUPABASE_CONFIGURED } from "@/lib/supabase-client";
import { C, card, ini, Icons, Sidebar, Topbar, BarProgress, PlaygroundCard, Spinner } from "@/components/shared";

const MOCK_COURSES = [
  { id:"c1", title:"Introduction to Python", category:"Python", level:"Beginner", description:"Learn variables, logic, loops, and the thinking habits behind every great program.", learner_count:12840,
    sections:[{ id:"s1", title:"Getting Started", sort_order:0, lessons:[
      { id:"l1", title:"What is Programming?", published:true, goal:"Understand what a program is.", steps:["A program is a recipe — ordered steps.","Read the example and name the input, action, and output.","Change one line and predict what happens."], checkpoint:"Explain why the order of steps matters.", code:'name = "Binary Tree learner"\nprint("Hello", name)', sort_order:0 },
      { id:"l2", title:"Your First Variables", published:true, goal:"Use variables to store and reuse a value by name.", steps:["A variable is a labelled box that holds a value.","Give it a clear name, put a value in, then use the name later."], checkpoint:"Create a variable for your favourite number.", code:"age = 12\nprint('Next year:', age + 1)", sort_order:1 },
    ]},{ id:"s2", title:"Logic & Control", sort_order:1, lessons:[
      { id:"l3", title:"If-Else Statements", published:true, goal:"Make a program choose between two paths.", steps:["A condition is a yes/no question.","if runs one block, else runs the other."], checkpoint:"Write a check that prints 'pass' when score ≥ 50.", code:"score = 64\nif score >= 50:\n    print('pass')\nelse:\n    print('try again')", sort_order:0 },
    ]}],
  },
  { id:"c2", title:"Web Development Foundations", category:"HTML/CSS", level:"Beginner", description:"Build accessible pages with semantic HTML, CSS layout, and flexbox.", learner_count:9360,
    sections:[{ id:"s3", title:"HTML Basics", sort_order:0, lessons:[
      { id:"l4", title:"Semantic Structure", published:true, goal:"Mark up a page with meaningful HTML elements.", steps:["Tags describe what content is, not how it looks.","Use header, main, footer for structure."], checkpoint:"List three semantic tags.", code:"<header>\n  <h1>My first page</h1>\n</header>\n<main>\n  <p>Hello, world.</p>\n</main>", sort_order:0 },
    ]}],
  },
  { id:"c3", title:"Digital Literacy Essentials", category:"Foundations", level:"Starter", description:"Practice safer browsing, file organization, keyboard fluency, and responsible research.", learner_count:15490,
    sections:[{ id:"s4", title:"Staying Safe Online", sort_order:0, lessons:[
      { id:"l5", title:"Strong Passwords", published:true, goal:"Understand what makes a password hard to guess.", steps:["Length beats complexity — longer is stronger.","Avoid names, birthdays, and common words."], checkpoint:"Explain why reusing one password is risky.", code:'# Good habits — no code needed.\n# "blue-river-lamp-42" is strong and memorable.', sort_order:0 },
    ]}],
  },
];

const LEADERBOARD = [
  { name: "Maya K.", xp: 2480 },
  { name: "Jonas T.", xp: 2310 },
  { name: "Lina A.", xp: 2090 },
  { name: "Omar S.", xp: 1940 },
];

const CHAT_INIT = [
  { me: false, t: "Welcome back. Which part of the loop exercise feels stuck?" },
  { me: true, t: "I understand repeating, but I do not know when the loop stops." },
  { me: false, t: "Great question. Look for the condition that becomes false. Try printing the counter each round." },
  { me: true, t: "That helped. I can see the counter changing now." },
];

export default function StudentPortal() {
  const supabase = createClient();
  const [view, setView] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseSel, setCourseSel] = useState(null);
  const [lessonSel, setLessonSel] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(new Set());
  const [chatMsgs, setChatMsgs] = useState(CHAT_INIT);
  const [chatDraft, setChatDraft] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [search, setSearch] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (!SUPABASE_CONFIGURED) {
        setCourses(MOCK_COURSES);
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(prof);
        const { data: prog } = await supabase.from("progress").select("lesson_id").eq("user_id", session.user.id);
        setProgress(new Set((prog || []).map((p) => p.lesson_id)));
      }

      const { data } = await supabase
        .from("courses")
        .select("*, sections(*, lessons(*))")
        .eq("published", true)
        .order("created_at");

      const parsed = (data || []).map((c) => ({
        ...c,
        sections: (c.sections || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((s) => ({ ...s, lessons: (s.lessons || []).filter((l) => l.published).sort((a, b) => a.sort_order - b.sort_order) })),
      }));
      setCourses(parsed.length > 0 ? parsed : MOCK_COURSES);
      setLoading(false);
    };
    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMsgs]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setProgress(new Set());
  };

  const markComplete = async (lessonId) => {
    if (!user) return;
    if (progress.has(lessonId)) {
      await supabase.from("progress").delete().eq("user_id", user.id).eq("lesson_id", lessonId);
      setProgress((p) => { const n = new Set(p); n.delete(lessonId); return n; });
    } else {
      await supabase.from("progress").insert({ user_id: user.id, lesson_id: lessonId });
      setProgress((p) => new Set([...p, lessonId]));
    }
  };

  const sendChat = () => {
    if (!chatDraft.trim()) return;
    setChatMsgs((m) => [...m, { me: true, t: chatDraft.trim() }]);
    setChatDraft("");
    setTimeout(() => setChatMsgs((m) => [...m, { me: false, t: "Thanks — a mentor will follow up soon. Keep experimenting!" }]), 700);
  };

  const getAiFeedback = async (lesson) => {
    setAiFeedbackLoading(true);
    setAiFeedback(null);
    try {
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: lesson.code, lessonTitle: lesson.title, lessonGoal: lesson.goal }),
      });
      const { feedback } = await res.json();
      setAiFeedback(feedback);
    } catch {
      setAiFeedback("Could not reach AI feedback right now. Your work looks great — keep going!");
    }
    setAiFeedbackLoading(false);
  };

  const totalLessons = courses.reduce((n, c) => n + c.sections.reduce((m, s) => m + s.lessons.length, 0), 0);
  const filteredCourses = search.trim() ? courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())) : courses;
  const course = courses.find((c) => c.id === courseSel) || courses[0];
  const allLessons = course?.sections.flatMap((s) => s.lessons) || [];
  const lesson = allLessons.find((l) => l.id === lessonSel) || allLessons[0];

  const navItems = [["dashboard", Icons.home, "Dashboard"], ["catalog", Icons.book, "Course Catalog"], ["viewer", Icons.code, "Lesson Viewer"], ["community", Icons.users, "Community"]];

  const topbarRight = user ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 28, height: 28, background: C.blue, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "#fff" }}>{ini(profile?.name || user.email)}</div>
      <button onClick={logout} style={{ fontSize: 11, color: C.muted, background: "transparent", border: `0.5px solid ${C.line}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
    </div>
  ) : (
    <Link href="/auth/login?from=/student" style={{ fontSize: 11, fontWeight: 500, color: C.blue, background: C.blueSoft, borderRadius: 8, padding: "5px 12px", textDecoration: "none" }}>Sign in / Sign up</Link>
  );

  const titles = { dashboard: "Dashboard", catalog: "Course Catalog", viewer: "Lesson Viewer", community: "Community" };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,sans-serif" }}>
      <Sidebar subtitle="Offline-first learning" navItems={navItems} view={view} setView={setView} user={null} onLogout={() => {}} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
        <Topbar eyebrow="Binary Tree Platform" title="Loading…" />
        <Spinner />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,sans-serif" }}>
      <Sidebar subtitle="Offline-first learning" navItems={navItems} view={view} setView={setView} user={profile} onLogout={logout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
        <Topbar eyebrow="Binary Tree Platform" title={titles[view] || "Binary Tree"} rightSlot={topbarRight} />
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {/* ── DASHBOARD ── */}
          {view === "dashboard" && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Hero */}
                <div style={{ background: `linear-gradient(120deg,${C.navy},${C.blue})`, borderRadius: 14, padding: 32, color: "#fff", marginBottom: 20, display: "flex", gap: 24, alignItems: "stretch" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 500, color: "#bcd0f5", marginBottom: 18 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", flexShrink: 0 }} />
                      Online: progress sync is live
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>Coding education that keeps going when the internet cannot.</div>
                    <div style={{ fontSize: 13, color: "#dbe6fb", lineHeight: 1.7 }}>Binary Tree brings digital literacy, Python, and web development to under-resourced classrooms with cached lessons, a browser-native coding playground, and automatic progress sync.</div>
                  </div>
                  {courses[0] && (() => {
                    const c = courses[0];
                    const cLessons = c.sections.flatMap(s => s.lessons);
                    const done = cLessons.filter(l => progress.has(l.id)).length;
                    const pct = cLessons.length ? Math.round(done / cLessons.length * 100) : 62;
                    const nextLesson = cLessons.find(l => !progress.has(l.id)) || cLessons[0];
                    return (
                      <div style={{ background: "#fff", borderRadius: 12, padding: 20, width: 220, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, marginBottom: 10 }}>Continue Learning</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Next: {nextLesson?.title}</div>
                        <div style={{ marginBottom: 14 }}><BarProgress value={pct} /></div>
                        <button onClick={() => { setCourseSel(c.id); setLessonSel(nextLesson?.id || null); setView("viewer"); }} style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <span style={{ color: "#fff", display: "flex" }}>{Icons.code}</span> Resume lesson
                        </button>
                      </div>
                    );
                  })()}
                </div>
                {/* Available tracks */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Available Learning Tracks</div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: C.blue, background: C.blueSoft, borderRadius: 6, padding: "3px 10px" }}>Cached locally</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                  {courses.map((c) => {
                    const cLessons = c.sections.flatMap(s => s.lessons);
                    const done = cLessons.filter(l => progress.has(l.id)).length;
                    const pct = cLessons.length ? Math.round(done / cLessons.length * 100) : 0;
                    return (
                      <div key={c.id} onClick={() => { setCourseSel(c.id); setLessonSel(null); setView("viewer"); }} style={{ ...card, cursor: "pointer" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.blueText, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>{c.category} / {c.level}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>{c.description}</div>
                        <BarProgress value={pct} />
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>{(c.learner_count || 0).toLocaleString()} learners</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Right sidebar */}
              <div style={{ width: 270, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ color: C.blue, display: "flex" }}>{Icons.users}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Global Leaderboard</div>
                  </div>
                  {LEADERBOARD.map((entry, i) => (
                    <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `0.5px solid ${C.line}` }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.blue, width: 20 }}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.ink }}>{entry.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{entry.xp.toLocaleString()} XP</div>
                    </div>
                  ))}
                </div>
                <div style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ color: C.blue, display: "flex" }}>{Icons.signal}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Sync Queue</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.65, marginBottom: 10 }}>All cached progress is synced. New work is backed up to the cloud immediately.</div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: "8px 12px", fontSize: 11, fontWeight: 500, color: C.ink }}>Cloud sync healthy</div>
                </div>
              </div>
            </div>
          )}

          {/* ── CATALOG ── */}
          {view === "catalog" && (
            <div>
              <div style={{ ...card, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 3 }}>Course Catalog</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Search offline-ready learning tracks designed for classrooms with unreliable connectivity.</div>
                </div>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input placeholder="Search courses" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none", background: C.bg, width: 190 }} />
                </div>
              </div>
              {filteredCourses.length === 0 ? (
                <div style={{ ...card, textAlign: "center", color: C.muted, padding: 40 }}>No courses found.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                  {filteredCourses.map((c) => {
                    const cLessons = c.sections.flatMap(s => s.lessons);
                    const done = cLessons.filter(l => progress.has(l.id)).length;
                    const pct = cLessons.length ? Math.round(done / cLessons.length * 100) : 0;
                    return (
                      <div key={c.id} style={{ ...card, display: "flex", flexDirection: "column" }}>
                        <div style={{ width: 44, height: 44, background: C.blueSoft, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: C.blueText, marginBottom: 12 }}>{Icons.book}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.blueText, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{c.category} / {c.level}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: C.muted, flex: 1, marginBottom: 14, lineHeight: 1.6 }}>{c.description}</div>
                        <BarProgress value={pct} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                          <div style={{ fontSize: 11, color: C.muted }}>{(c.learner_count || 0).toLocaleString()} learners</div>
                          <button onClick={() => { setCourseSel(c.id); setLessonSel(null); setView("viewer"); }} style={{ display: "flex", alignItems: "center", gap: 6, background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                            Open <span style={{ display: "flex", color: "#fff" }}>{Icons.book}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── VIEWER ── */}
          {view === "viewer" && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ ...card, width: 190, flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: C.blue, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Course Outline</div>
                {course && <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 10 }}>{course.title}</div>}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {courses.map((c) => (
                    <button key={c.id} onClick={() => { setCourseSel(c.id); setLessonSel(null); setAiFeedback(null); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, border: `0.5px solid ${C.line}`, background: c.id === (course?.id) ? C.blue : "#fff", color: c.id === (course?.id) ? "#fff" : C.body, cursor: "pointer", fontFamily: "inherit" }}>{c.category}</button>
                  ))}
                </div>
                {course?.sections.map((s) => (
                  <div key={s.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: C.muted, background: "#f8fafc", borderRadius: 6, padding: "5px 8px", marginBottom: 4 }}>{s.title}</div>
                    {s.lessons.map((l) => (
                      <button key={l.id} onClick={() => { setLessonSel(l.id); setAiFeedback(null); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", textAlign: "left", marginBottom: 3, fontSize: 11, padding: "5px 8px", borderRadius: 6, border: `0.5px solid ${C.line}`, background: l.id === lesson?.id ? C.navy : "#fff", color: l.id === lesson?.id ? "#fff" : C.body, cursor: "pointer", fontFamily: "inherit" }}>
                        <span>{l.title}</span>
                        {progress.has(l.id) && <span style={{ fontSize: 9, color: C.green }}>✓</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ ...card, flex: 1, minWidth: 180 }}>
                {lesson ? (
                  <>
                    <div style={{ background: C.blueSoft, borderRadius: 8, padding: 14, marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.blueText, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{course?.title}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{lesson.title}</div>
                      {course?.sections.map(s => s.lessons.find(l => l.id === lesson.id) ? <div key={s.id} style={{ fontSize: 11, color: C.muted }}>{s.title} / {lesson.title}</div> : null)}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 5 }}>Learning Goal</div>
                    <div style={{ fontSize: 13, color: C.body, marginBottom: 16, lineHeight: 1.6 }}>{lesson.goal}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Mini Lesson</div>
                    {(Array.isArray(lesson.steps) ? lesson.steps : JSON.parse(lesson.steps || "[]")).map((st, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.body, marginBottom: 5, paddingLeft: 10, borderLeft: `2px solid ${C.blueSoft}` }}>{st}</div>
                    ))}
                    <div style={{ ...card, marginTop: 14, background: "#f8fafc" }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Checkpoint</div>
                      <div style={{ fontSize: 12, color: C.body }}>{lesson.checkpoint}</div>
                    </div>
                    {user && (
                      <button onClick={() => markComplete(lesson.id)} style={{ marginTop: 14, width: "100%", background: progress.has(lesson.id) ? C.greenSoft : C.blue, color: progress.has(lesson.id) ? C.green : "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                        {progress.has(lesson.id) ? "✓ Completed — mark incomplete" : "Mark as complete"}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: C.muted }}>Select a lesson from the outline.</div>
                )}
              </div>
              {lesson && (
                <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  <PlaygroundCard lesson={lesson} />
                  <div style={{ ...card }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 4 }}>AI Feedback</div>
                    {aiFeedback ? (
                      <div style={{ fontSize: 11, color: C.body, lineHeight: 1.5 }}>{aiFeedback}</div>
                    ) : (
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Offline feedback queued from local rules. Full AI review syncs when online.</div>
                    )}
                    <button onClick={() => getAiFeedback(lesson)} disabled={aiFeedbackLoading} style={{ width: "100%", background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "7px 0", fontSize: 11, fontWeight: 500, cursor: aiFeedbackLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: aiFeedbackLoading ? 0.7 : 1 }}>
                      {aiFeedbackLoading ? "Getting feedback…" : "Get AI feedback"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── COMMUNITY ── */}
          {view === "community" && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ ...card, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: C.blue, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Volunteer Network</div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: C.ink, marginBottom: 4 }}>Community & Mentors</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Connect with trained volunteers for guidance, code review, and encouragement across local hubs and remote sessions.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                  {[{ i: "AP", n: "Aisha Patel", r: "Python Mentor", h: "Nairobi Learning Hub" }, { i: "ML", n: "Marcus Lee", r: "Frontend Volunteer", h: "Chicago Remote Circle" }, { i: "SR", n: "Sofia Reyes", r: "Digital Literacy Coach", h: "Manila Community Lab" }].map((m) => (
                    <div key={m.i} style={card}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                        <div style={{ width: 36, height: 36, background: C.blueSoft, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: C.blueText }}>{m.i}</div>
                        <div><div style={{ fontSize: 12, fontWeight: 500, color: C.ink }}>{m.n}</div><div style={{ fontSize: 10, color: C.blue }}>{m.r}</div></div>
                      </div>
                      <div style={{ fontSize: 10, color: C.muted }}>{m.h}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...card, width: 220, flexShrink: 0, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ background: C.navy, padding: 12 }}><div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>Mentor Chat</div><div style={{ color: "#9fb4d6", fontSize: 10 }}>Simulated real-time room</div></div>
                <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8, minHeight: 160, maxHeight: 320 }}>
                  {chatMsgs.map((m, i) => (
                    <div key={i} style={{ maxWidth: "85%", borderRadius: 10, padding: "8px 10px", fontSize: 11, ...(m.me ? { marginLeft: "auto", background: C.blue, color: "#fff" } : { background: "#eef2f8", color: C.ink }) }}>{m.t}</div>
                  ))}
                </div>
                <div style={{ padding: 8, borderTop: `0.5px solid ${C.line}`, display: "flex", gap: 6 }}>
                  <input value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Type a message" style={{ flex: 1, fontSize: 11, padding: "5px 8px", border: `0.5px solid ${C.line}`, borderRadius: 6, fontFamily: "inherit", outline: "none" }} />
                  <button onClick={sendChat} style={{ background: C.blue, color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Send</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
