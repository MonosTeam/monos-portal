// Worker endpoint for the website agent. Responds at once and keeps building in the background.
// On Netlify, point SITE_AGENT_WORKER_URL at /.netlify/functions/site-agent-background instead.
import { after, NextResponse } from "next/server";
import { runBuild } from "@/lib/site-agent/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const secret = process.env.SITE_AGENT_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { buildId } = (await req.json().catch(() => ({}))) as { buildId?: string };
  if (!buildId) return NextResponse.json({ error: "buildId required" }, { status: 400 });
  after(() => runBuild(buildId));
  return NextResponse.json({ accepted: true }, { status: 202 });
}
