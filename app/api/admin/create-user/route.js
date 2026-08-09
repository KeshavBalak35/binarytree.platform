import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const caller = await createClient();
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: prof } = await caller.from("profiles").select("role").eq("id", user.id).single();
  if (!prof || !["admin", "founder"].includes(prof.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { name, username: email, country, hub, role, password } = await request.json();
  if (!name || !email || !password) return NextResponse.json({ error: "name, email, and password required" }, { status: 400 });

  const ALLOWED_ROLES = prof.role === "founder" ? ["designer", "admin", "director"] : ["designer"];
  if (!ALLOWED_ROLES.includes(role)) return NextResponse.json({ error: "Invalid role for your permission level" }, { status: 403 });

  const adminClient = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role, hub: hub || "", country: country || "" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: newUser.user.id, email, name, role });
}
