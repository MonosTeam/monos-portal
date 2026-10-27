"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Logo } from "@/components/Logo";

// Invited clients land here from their invite email to choose a password.
export default function SetPassword() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().auth.updateUser({ password: pw });
    if (error) setMsg(error.message);
    else router.replace("/");
  }
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <Logo />
        <h1 className="h2">Welcome! Choose a password</h1>
        <input type="password" className="input" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
        <button className="btn w-full">Continue to your portal</button>
        {msg && <p className="text-sm text-bad">{msg}</p>}
      </form>
    </main>
  );
}
