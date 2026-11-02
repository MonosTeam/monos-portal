// MONOS wordmark with the signature red "on air" dot.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="font-display font-extrabold text-2xl leading-none tracking-tight">MONOS</span>
      <span className="text-sm text-muted">Technology</span>
      <span className="onair-dot" aria-hidden />
    </span>
  );
}
