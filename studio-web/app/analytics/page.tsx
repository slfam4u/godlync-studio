"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StudioShell } from "@/components/studio-shell";
import { getAnalyticsEngagement } from "@/lib/studio-data";

const emptyResult = {
  data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name) => ({ name, plays: 0, engagement: 0 })),
  totals: { plays: 0, favorites: 0, shares: 0, wallPosts: 0, comments: 0, wallLikes: 0 },
};

export default function AnalyticsPage() {
  const [result, setResult] = useState(emptyResult);

  useEffect(() => {
    getAnalyticsEngagement()
      .then((value) => setResult(value ?? emptyResult))
      .catch(() => setResult(emptyResult));
  }, []);

  const cards = [
    { label: "Media plays", value: result.totals.plays },
    { label: "Favorites", value: result.totals.favorites },
    { label: "Shares", value: result.totals.shares },
    { label: "Wall posts", value: result.totals.wallPosts },
    { label: "Comments", value: result.totals.comments },
    { label: "Wall likes", value: result.totals.wallLikes },
  ];

  return (
    <StudioShell>
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Analytics</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Engagement overview</h1>
          <p className="mt-2 text-sm text-slate-400">Last 7 days</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-400">{card.label}</div>
              <div className="mt-3 text-2xl font-semibold text-white">{card.value.toLocaleString("en-US")}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.data}>
              <defs>
                <linearGradient id="analyticsFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f7b267" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#f7b267" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121821",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "12px",
                }}
              />
              <Area type="monotone" dataKey="engagement" stroke="#f7b267" strokeWidth={3} fill="url(#analyticsFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </StudioShell>
  );
}
