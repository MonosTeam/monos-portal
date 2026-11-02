// Netlify Background Function (up to 15 minutes): runs one website build.
// Called by the portal with SITE_AGENT_WORKER_URL=https://<portal>/.netlify/functions/site-agent-background
import { runBuild } from "../../src/lib/site-agent/pipeline";

export default async (req: Request) => {
  const secret = process.env.SITE_AGENT_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return;
  const { buildId } = (await req.json().catch(() => ({}))) as { buildId?: string };
  if (buildId) await runBuild(buildId);
};
