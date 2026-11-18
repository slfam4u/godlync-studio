import { Filter, Search } from "lucide-react";

import { StudioShell } from "@/components/studio-shell";
import { getStudioContent } from "@/lib/studio-data";

const filters = ["All", "Sermons", "Devotionals", "Prayer", "Videos", "Podcast"];

export default async function ContentPage() {
  const rows = await getStudioContent();

  return (
    <StudioShell>
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Library</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Content library</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
              + Upload media
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <button
              key={filter}
              className={`rounded-full px-3 py-1.5 text-sm ${
                index === 0
                  ? "bg-amber-300 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="w-full bg-transparent text-sm placeholder:text-slate-500 focus:outline-none"
            placeholder="Search content by title, topic, or keyword"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Plays</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-[#0d1219]">
              {rows.map(({ title, type, status, plays, date }) => (
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
                            : status === "Processing"
                              ? "bg-cyan-400/15 text-cyan-200"
                              : "bg-slate-400/10 text-slate-300"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{plays}</td>
                  <td className="px-4 py-3 text-slate-400">{date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StudioShell>
  );
}
