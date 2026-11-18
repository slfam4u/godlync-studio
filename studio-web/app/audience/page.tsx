"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { StudioShell } from "@/components/studio-shell";
import { getAudienceInsights } from "@/lib/studio-data";

const demoAudience = [
  { name: "Followers", value: "0" },
  { name: "Favorites", value: "0" },
  { name: "Media likes", value: "0" },
  { name: "Comments", value: "0" },
];

export default function AudiencePage() {
  const [audience, setAudience] = useState(demoAudience);

  useEffect(() => {
    getAudienceInsights()
      .then((value) => setAudience(value ?? demoAudience))
      .catch(() => setAudience(demoAudience));
  }, []);

  return (
    <StudioShell>
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
        <div className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5 text-amber-300" />
          <h1 className="text-3xl font-semibold">Audience insights</h1>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {audience.map(({ name, value }) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-300">{name}</div>
              <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </StudioShell>
  );
}
