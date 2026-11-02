// Netlify Background Function (up to 15 minutes): runs one website build.
// Called by the portal with SITE_AGENT_WORKER_URL=https://<portal>/.netlify/functions/site-agent-background
// Logs show in Netlify: Logs > Functions > site-agent-background.
import { runBuild } from "../../src/lib/site-agent/pipeline";

export default async (req: Request) => {
  const secret = process.env.SITE_AGENT_SECRET;
  if (!secret) return console.error("[site-agent] SITE_AGENT_SECRET is not set for functions");
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return console.error("[site-agent] rejected: secret does not match");
  const { buildId } = (await req.json().catch(() => ({}))) as { buildId?: string };
  if (!buildId) return console.error("[site-agent] no buildId in request");
  console.log(`[site-agent] starting build ${buildId}`);
  try {
    const r = await runBuild(buildId);
    console.log(`[site-agent] finished ${buildId}`, JSON.stringify(r));
  } catch (e) {
    console.error(`[site-agent] crashed on ${buildId}`, e);
  }
};
