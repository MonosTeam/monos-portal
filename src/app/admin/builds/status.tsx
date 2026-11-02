import type { BuildStatus } from "@/lib/site-agent/pipeline";

export const LABEL: Record<BuildStatus, string> = {
  queued: "Queued", generating: "Writing the site", deploying: "Uploading", ready: "Ready to approve",
  published: "Live", superseded: "Older version", failed: "Failed",
};
const TONE: Record<BuildStatus, string> = {
  queued: "bg-line text-ink", generating: "bg-warn/15 text-warn", deploying: "bg-warn/15 text-warn",
  ready: "bg-brand text-brand-ink", published: "bg-ok/15 text-ok", superseded: "bg-line text-muted", failed: "bg-bad/15 text-bad",
};
export const working = (s: BuildStatus) => s === "queued" || s === "generating" || s === "deploying";

export function StatusPill({ status }: { status: BuildStatus }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONE[status]}`}>{working(status) && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}{LABEL[status]}</span>;
}
