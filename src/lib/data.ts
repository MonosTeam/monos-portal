import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";

export type Stage = { id: string; position: number; name: string; status: "todo" | "in_progress" | "done"; due_date: string | null; client_note: string | null };
export type Payment = { id: string; label: string; amount_pence: number; due_date: string | null; status: "due" | "paid" | "overdue"; payment_url: string | null; paid_at: string | null };
export type Agreement = { id: string; title: string; body: string; signed_name: string | null; signed_at: string | null };
export type Project = {
  id: string; name: string; package: string; price_pence: number; start_date: string; notes: string | null;
  modules: { consultation: boolean; agreement: boolean; payments: boolean; uploads: boolean };
  brief_sections: string[];
};

export const DEFAULT_STAGES = ["Discovery", "Design", "Build", "Review", "Launch"];

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { supabase, user, profile: profile as { id: string; role: "admin" | "client"; full_name: string | null; company: string | null; email: string } };
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile?.role !== "admin") redirect("/dashboard");
  return ctx;
}

// A client has one active project; the most recent one is shown.
export async function getClientProject() {
  const ctx = await requireUser();
  if (ctx.profile?.role === "admin") redirect("/admin");
  const { data: project } = await ctx.supabase
    .from("projects").select("*").eq("client_id", ctx.user.id)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  return { ...ctx, project: project as Project | null };
}

export const gbp = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(pence / 100);

export const ukDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export function progressOf(stages: Stage[]) {
  if (!stages.length) return 0;
  const score = stages.reduce((s, st) => s + (st.status === "done" ? 1 : st.status === "in_progress" ? 0.5 : 0), 0);
  return Math.round((score / stages.length) * 100);
}
