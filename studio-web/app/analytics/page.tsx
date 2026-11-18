"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StudioShell } from "@/components/studio-shell";

const data = [
  { name: "Mon", plays: 900 },
  { name: "Tue", plays: 1700 },
  { name: "Wed", plays: 1400 },
  { name: "Thu", plays: 2100 },
  { name: "Fri", plays: 2400 },
  { name: "Sat", plays: 2900 },
  { name: "Sun", plays: 3300 },
];

export default function AnalyticsPage() {
  return (
    <StudioShell>
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Analytics</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Engagement overview</h1>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="analyticsFill" x1="0" x2="0" y1="0" y2="1">
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
              <Area type="monotone" dataKey="plays" stroke="#f7b267" strokeWidth={3} fill="url(#analyticsFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </StudioShell>
  );
}
