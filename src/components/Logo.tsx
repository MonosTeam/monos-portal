// MONOS wordmark: condensed caps with the signature red dot top-right.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-start gap-1 ${className}`} aria-label="MONOS Technology">
      <span className="font-display text-3xl leading-none tracking-wide">MONOS</span>
      <span className="onair-dot mt-0.5" aria-hidden />
    </span>
  );
}
