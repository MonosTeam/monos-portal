export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-ink text-sm font-bold">M</span>
      <span>MONOS <span className="text-muted font-normal">Technology</span></span>
    </span>
  );
}
