"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  FileText,
  Mic,
  Play,
  Video,
  Wand2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StudioShell } from "@/components/studio-shell";
import { getStudioOverview } from "@/lib/studio-data";

const fallbackOverview = {
  stats: [
    { label: "Total content", value: "1,284", change: "+14.8%", tone: "amber" },
    { label: "Total plays", value: "482K", change: "+22.3%", tone: "cyan" },
    { label: "Followers", value: "34.8K", change: "+8.4%", tone: "violet" },
    { label: "Scheduled", value: "18", change: "+5", tone: "emerald" },
  ],
  contentRows: [
    { title: "The Power of Faith in Trials", type: "Sermon", status: "Published", plays: "14.2K", updated: "2h ago" },
    { title: "Wake Up to Purpose", type: "Devotional", status: "Review", plays: "7.8K", updated: "4h ago" },
    { title: "Monday Prayer Session", type: "Prayer", status: "Processing", plays: "3.4K", updated: "1d ago" },
    { title: "Leadership in the Church", type: "Bible Study", status: "Published", plays: "21.1K", updated: "2d ago" },
  ],
  queue: [
    { title: "Sunday Messages 2026", progress: 78, status: "Transcribing" },
    { title: "Youth Revival Highlights", progress: 42, status: "Generating clips" },
    { title: "Prayer Guide", progress: 92, status: "Finalizing" },
  ],
  aiTasks: [
    { icon: "Mic", title: "Sermon Assistant", subtitle: "Transcript • summary • scripture" },
    { icon: "Wand2", title: "Devotional Assistant", subtitle: "Daily reflections • prayer points" },
    { icon: "Video", title: "Media Assistant", subtitle: "Short clips • captions • promos" },
  ],
  chartData: [
    { name: "Mon", plays: 1400 },
    { name: "Tue", plays: 2200 },
    { name: "Wed", plays: 1800 },
    { name: "Thu", plays: 3200 },
    { name: "Fri", plays: 2900 },
    { name: "Sat", plays: 4100 },
    { name: "Sun", plays: 5000 },
  ],
};

const iconMap = {
  Mic,
  Wand2,
  Video,
};

export default function Home() {
  const [overview, setOverview] = useState(fallbackOverview);

  useEffect(() => {
    getStudioOverview().then(setOverview).catch(() => setOverview(fallbackOverview));
  }, []);

  const { stats, contentRows, queue, aiTasks, chartData } = overview;

  return (
    <StudioShell>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, tone }) => (
          <div
            key={label}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 shadow-xl shadow-black/10"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-400">{label}</div>
                <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
              </div>
              <div
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  tone === "amber"
                    ? "bg-amber-400/15 text-amber-200"
                    : tone === "cyan"
                      ? "bg-cyan-400/15 text-cyan-200"
                      : tone === "violet"
                        ? "bg-violet-400/15 text-violet-200"
                        : "bg-emerald-400/15 text-emerald-200"
                }`}
              >
                {change}
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
              Compare to last month
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Performance</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Weekly reach</h2>
            </div>
            <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10">
              Export report
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="playsFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f7b267" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f7b267" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121821",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "12px",
                  }}
                />
                <Area type="monotone" dataKey="plays" stroke="#f7b267" strokeWidth={3} fill="url(#playsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">AI Studio</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Quick actions</h3>
            </div>
            <button className="rounded-xl bg-white/5 p-2 text-slate-200 hover:bg-white/10">
              <Wand2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {aiTasks.map(({ title, subtitle, icon }) => {
              const Icon = iconMap[icon as keyof typeof iconMap] ?? Wand2;

              return (
                <button
                  key={title}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-amber-300/30 hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300/20 to-orange-400/10 text-amber-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{title}</div>
                    <div className="text-xs text-slate-400">{subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Library</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Recent content</h3>
            </div>
            <button className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              View all
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Plays</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-[#0d1219]">
                {contentRows.map(({ title, type, status, plays, updated }) => (
                  <tr key={title} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-white">{title}</td>
                    <td className="px-4 py-3 text-slate-300">{type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          status === "Published"
                            ? "bg-emerald-400/15 text-emerald-200"
                            : status === "Review"
                              ? "bg-amber-400/15 text-amber-200"
                              : "bg-cyan-400/15 text-cyan-200"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{plays}</td>
                    <td className="px-4 py-3 text-slate-400">{updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Workflow</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Upload queue</h3>
            </div>
            <button className="rounded-xl bg-amber-300 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-200">
              + Upload
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {queue.map(({ title, progress, status }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="text-[11px] text-slate-400">{status}</div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{progress}% complete</span>
                  <span>Queued</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Sunday sermon ready to publish</span>
            </div>
            <div className="mt-2 text-xs text-emerald-100/80">Review approved and scheduled for 9:00 AM tomorrow.</div>
          </div>
        </div>
      </section>

      <footer className="mt-6 flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#10141d] px-5 py-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-slate-200">
          <CircleDashed className="h-4 w-4 text-amber-300" />
          Studio health: System stable
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="h-4 w-4" />
          Last sync: 4 minutes ago
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Play className="h-4 w-4" />
          6 active processing jobs
        </div>
      </footer>
    </StudioShell>
  );
}
