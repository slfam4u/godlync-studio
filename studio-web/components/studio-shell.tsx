"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarClock,
  Gauge,
  LayoutDashboard,
  LibraryBig,
  Search,
  Settings,
  Sparkles,
  UploadCloud,
  Users,
  Wand2,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content Library", icon: LibraryBig },
  { href: "/ai", label: "AI Studio", icon: Sparkles },
  { href: "/publishing", label: "Publishing", icon: UploadCloud },
  { href: "/calendar", label: "Calendar", icon: CalendarClock },
  { href: "/analytics", label: "Analytics", icon: Gauge },
  { href: "/audience", label: "Audience", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100">
      <div className="mx-auto flex max-w-[1800px]">
        <aside className="hidden min-h-screen w-[260px] shrink-0 border-r border-white/10 bg-[#0f1117] p-6 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 text-sm font-black text-slate-950 shadow-lg shadow-orange-500/30">
              G
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">GodLync</div>
              <div className="text-lg font-semibold text-white">Studio</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-white/10 text-white shadow-inner shadow-white/5"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-orange-500/5 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-amber-200/80">
              <Wand2 className="h-3.5 w-3.5" />
              AI Studio
            </div>
            <div className="text-base font-semibold text-white">Generate sermon highlights</div>
            <p className="mt-2 text-sm text-slate-300">
              Turn a 45-minute sermon into devotional notes, clips, and social copy.
            </p>
            <Link
              href="/ai"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200"
            >
              Open Assistant
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 xl:p-8">
          <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#10141d]/80 p-4 shadow-2xl shadow-black/20 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-300 md:min-w-[340px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                aria-label="Search content"
                placeholder="Search sermons, devotionals, prayers..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <button className="relative rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:bg-white/10">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-400" />
              </button>
              <Link
                href="/publishing"
                className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                + New upload
              </Link>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-bold text-white">
                  PS
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">Pastor Samuel</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Missions Church</div>
                </div>
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
