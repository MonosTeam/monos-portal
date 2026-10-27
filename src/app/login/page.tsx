"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "link">("password");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    if (mode === "link") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback`, shouldCreateUser: false },
      });
      setMsg(error ? error.message : "Check your inbox for a sign-in link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else router.replace("/");
    }
    setBusy(false);
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center"><Logo className="text-lg" /></div>
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <h1 className="h2">Sign in to your client portal</h1>
            <p className="text-sm text-muted mt-1">Track your build, complete your brief and manage payments.</p>
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode === "password" && (
            <div>
              <label className="label" htmlFor="pw">Password</label>
              <input id="pw" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <button className="btn w-full" disabled={busy}>{mode === "link" ? "Email me a sign-in link" : "Sign in"}</button>
          <button type="button" className="text-sm text-brand w-full" onClick={() => setMode(mode === "link" ? "password" : "link")}>
            {mode === "link" ? "Use a password instead" : "Email me a sign-in link instead"}
          </button>
          {msg && <p className="text-sm text-muted text-center">{msg}</p>}
        </form>
      </div>
    </main>
  );
}
