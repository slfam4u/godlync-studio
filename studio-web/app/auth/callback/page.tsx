"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createStudioBrowserClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing your GodLync sign-in...");

  useEffect(() => {
    const supabase = createStudioBrowserClient();

    if (!supabase) {
      setMessage("Supabase environment variables are not configured.");
      return;
    }

    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      setMessage("The sign-in response was incomplete.");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace("/");
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-[#090b10]">
      <div className="rounded-3xl border border-white/10 bg-[#10141d] px-8 py-6 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-300">{message}</p>
      </div>
    </main>
  );
}
