import type { Stage } from "@/lib/data";
import { ukDate } from "@/lib/data";

const dot = { done: "bg-ok", in_progress: "bg-brand animate-pulse", todo: "bg-line" } as const;
const label = { done: "Done", in_progress: "In progress", todo: "Up next" } as const;

export function StageTimeline({ stages }: { stages: Stage[] }) {
  return (
    <ol className="space-y-0">
      {stages.map((s, i) => (
        <li key={s.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className={`mt-1 h-3.5 w-3.5 rounded-full ${dot[s.status]}`} />
            {i < stages.length - 1 && <span className="w-px flex-1 bg-line my-1" />}
          </div>
          <div className="pb-6">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-medium">{s.name}</span>
              <span className="text-xs text-muted">{label[s.status]}{s.due_date ? ` · ${ukDate(s.due_date)}` : ""}</span>
            </div>
            {s.client_note && <p className="text-sm text-muted mt-1">{s.client_note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
