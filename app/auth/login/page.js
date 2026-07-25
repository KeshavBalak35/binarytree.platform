"use client";
/* eslint-disable react-hooks/exhaustive-deps */
export const dynamic = "force-dynamic";
import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const C = {
  navy: "#0f1d3a", blue: "#2563eb", ink: "#0f172a", muted: "#64748b",
  line: "#e2e8f0", bg: "#f6f8fc", blueSoft: "#dbeafe",
};

function LoginForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const portal = from.startsWith("/studio") ? "studio" : from.startsWith("/director") ? "director" : "student";

  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirectByRole(session);
    });
  }, []);

  async function redirectByRole(session) {
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    const role = prof?.role || "student";
    if (from && from !== "/") { router.push(from); return; }
    if (["designer", "admin", "founder"].includes(role)) router.push("/studio");
    else if (role === "director") router.push("/director");
    else router.push("/student");
  };

  const handleLogin = async () => {
    setLoading(true); setErr("");
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setErr(error.message); setLoading(false); return; }
    await redirectByRole(data.session);
  };

  const handleSignup = async () => {
    if (!name.trim()) { setErr("Please enter your full name."); return; }
    setLoading(true); setErr("");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim(), role: "student" } },
    });
    if (error) { setErr(error.message); setLoading(false); return; }
    if (data.session) { await redirectByRole(data.session); }
    else { setMsg("Check your email to confirm your account, then sign in."); setTab("login"); }
    setLoading(false);
  };

  const onKeyDown = (e) => { if (e.key === "Enter") tab === "login" ? handleLogin() : handleSignup(); };

  const portalLabels = { studio: "Curriculum Studio", director: "Founder Portal", student: "Learning Platform" };
  const portalIcons = { studio: "✏️", director: "📊", student: "📚" };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ background: "#fff", border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 28, width: 340 }}>
        <Link href="/" style={{ fontSize: 11, background: "#fff", border: `0.5px solid ${C.line}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", marginBottom: 16, fontFamily: "inherit", color: C.muted, textDecoration: "none", display: "inline-block" }}>← All portals</Link>
        <div style={{ fontSize: 24, marginBottom: 10 }}>{portalIcons[portal]}</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: C.ink, marginBottom: 4 }}>{portalLabels[portal]}</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
          {portal === "student" ? "Sign in to track progress, or sign up for free." : "Restricted access — sign in with your staff credentials."}
        </div>

        {portal === "student" && (
          <div style={{ display: "flex", background: C.bg, borderRadius: 8, padding: 3, marginBottom: 16 }}>
            {[["login", "Sign in"], ["signup", "Sign up"]].map(([t, l]) => (
              <button key={t} onClick={() => { setTab(t); setErr(""); setMsg(""); }} style={{ flex: 1, fontSize: 12, padding: "6px 0", borderRadius: 6, border: "none", background: tab === t ? "#fff" : "transparent", color: C.ink, cursor: "pointer", fontFamily: "inherit", fontWeight: tab === t ? 500 : 400 }}>{l}</button>
            ))}
          </div>
        )}

        {err && <div style={{ background: "#fef2f2", color: "#b91c1c", borderRadius: 8, padding: "8px 10px", fontSize: 11, marginBottom: 12 }}>{err}</div>}
        {msg && <div style={{ background: "#dcfce7", color: "#15803d", borderRadius: 8, padding: "8px 10px", fontSize: 11, marginBottom: 12 }}>{msg}</div>}

        {tab === "signup" && (
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Full name</label>
            <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} onKeyDown={onKeyDown} placeholder="Your full name" style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} />
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} onKeyDown={onKeyDown} placeholder="you@example.com" style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>Password</label>
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErr(""); }} onKeyDown={onKeyDown} placeholder="••••••••" style={{ width: "100%", padding: "7px 10px", border: `0.5px solid ${C.line}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", color: C.ink, outline: "none" }} />
        </div>

        <button onClick={tab === "login" ? handleLogin : handleSignup} disabled={loading} style={{ width: "100%", background: loading ? "#93c5fd" : C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 12, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {loading ? "Please wait…" : tab === "login" ? "Sign in" : "Create account"}
        </button>

        {portal !== "student" && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, fontWeight: 500 }}>Demo accounts</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {(portal === "director"
                ? [["Founder", "nishan@binarytree.us", "binarytree"], ["Director", "director@binarytree.us", "director123"]]
                : [["Designer", "aisha@binarytree.us", "python123"], ["Admin", "admin@binarytree.us", "admin123"]]
              ).map(([l, du, dp]) => (
                <button key={l} onClick={() => { setEmail(du); setPassword(dp); }} style={{ background: "#f8fafc", border: `0.5px solid ${C.line}`, borderRadius: 8, padding: "6px 8px", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                  <span style={{ color: C.blue, fontSize: 10, fontWeight: 500 }}>{l}</span><br />
                  <span style={{ color: C.muted, fontSize: 10 }}>{du}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
