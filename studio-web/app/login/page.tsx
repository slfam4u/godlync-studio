"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { createStudioBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("Sign in with your existing GodLync account.");

  useEffect(() => {
    if (!loading && session) router.replace("/");
  }, [loading, router, session]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("Signing in...");

    const supabase = createStudioBrowserClient();
    if (!supabase) {
      setMessage("Supabase environment variables are not configured.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    router.replace("/");
  }

  async function signInWithProvider(provider: "google" | "apple") {
    setSubmitting(true);
    setMessage(`Opening ${provider === "google" ? "Google" : "Apple"} sign-in...`);

    const supabase = createStudioBrowserClient();
    if (!supabase) {
      setMessage("Supabase environment variables are not configured.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback-server`,
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <section className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#10141d]/95 p-6 shadow-2xl shadow-black/40 md:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 text-lg font-black text-slate-950 shadow-lg shadow-orange-500/20">G</div>
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">GodLync</div>
            <div className="text-xl font-semibold text-white">Studio</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-amber-200/80">
            <Sparkles className="h-3.5 w-3.5" /> Creator access
          </div>
          <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">{message}</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => signInWithProvider("google")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-sm font-bold text-[#4285F4]">G</span>
            Google
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => signInWithProvider("apple")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-60"
          >
            <span className="text-lg leading-none">●</span>
            Apple
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">or use email</div>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Email</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">
              <Mail className="h-4 w-4 text-slate-500" />
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none" placeholder="creator@godlync.com" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Password</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">
              <LockKeyhole className="h-4 w-4 text-slate-500" />
              <input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none" placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 hover:text-white">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/10 transition hover:bg-amber-200 disabled:opacity-60">
            {submitting ? "Signing in..." : "Sign in to Studio"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Not a creator yet?{" "}
          <Link href="/settings" className="font-medium text-amber-200 hover:text-amber-100">Learn about creator access</Link>
        </div>
      </section>
    </main>
  );
}
