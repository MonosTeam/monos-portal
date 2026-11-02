"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

// Lands here from Supabase's default invite, magic-link and reset emails, so no email-template changes are needed.
// Handles both link styles: ?code=... (PKCE) and #access_token=... (invites sent by the admin API).
function Callback() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const next = params.get("next") ?? "/";
    const hash = new URLSearchParams(window.location.hash.slice(1));
    (async () => {
      const code = params.get("code");
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : access_token && refresh_token
          ? await supabase.auth.setSession({ access_token, refresh_token })
          : { error: new Error(hash.get("error_description") || "This link has expired. Please ask for a new one.") };
      if (error) return setError(error.message);
      const type = hash.get("type");
      router.replace(type === "invite" || type === "recovery" ? "/set-password" : next);
    })();
  }, [params, router]);

  return (
    <main className="min-h-screen grid place-items-center px-4 text-center">
      {error ? (
        <div className="card max-w-sm space-y-3"><p>{error}</p><a className="btn" href="/login">Back to sign in</a></div>
      ) : (
        <p className="text-muted">Signing you in…</p>
      )}
    </main>
  );
}

export default function Page() {
  return <Suspense><Callback /></Suspense>;
}
