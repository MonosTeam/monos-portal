import Link from "next/link";
import { Logo } from "./Logo";

export function Shell({ nav, user, children }: { nav: { href: string; label: string }[]; user: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-page/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline text-muted">{user}</span>
            <form action="/auth/signout" method="post"><button className="btn-ghost">Sign out</button></form>
          </div>
        </div>
        <nav className="mx-auto max-w-5xl px-4 flex gap-1 overflow-x-auto text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="px-3 py-2 border-b-2 border-transparent hover:border-brand whitespace-nowrap">{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
