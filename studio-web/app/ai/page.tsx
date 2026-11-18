import { BrainCircuit, Mic, Sparkles, Wand2 } from "lucide-react";
import { StudioShell } from "@/components/studio-shell";

const assistants = [
  { title: "Sermon Assistant", icon: Mic, description: "Generate sermon summaries, scripture references, and highlight reels." },
  { title: "Devotional Assistant", icon: Sparkles, description: "Create reflections, devotional guides, and prayer prompts." },
  { title: "Media Assistant", icon: Wand2, description: "Short-form clips, captions, promotional snippets, and social media copy." },
];

const output = [
  { label: "Transcript", value: "92% complete" },
  { label: "Scripture references", value: "17 passages" },
  { label: "Summary", value: "Ready to review" },
  { label: "Devotional", value: "Draft generated" },
];

export default function AIPage() {
  return (
    <StudioShell>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">AI Studio</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">Creative automation</h1>
            </div>
            <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-amber-200">
              Review required
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {assistants.map(({ title, icon: Icon, description }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300/20 to-orange-400/10 text-amber-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-semibold text-white">{title}</div>
                <p className="mt-2 text-sm text-slate-300">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1219] p-4">
            <div className="mb-3 flex items-center gap-2 text-white">
              <BrainCircuit className="h-4 w-4 text-amber-300" />
              <span className="font-medium">Generated sermon summary</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              “This sermon explores the theme of perseverance through trials and how faith grows when circumstances feel uncertain. The message emphasizes prayer, patience, and trust in God’s timing. Key themes include spiritual endurance, purpose in suffering, and the role of community encouragement.”
            </p>
            <div className="mt-4 flex gap-3">
              <button className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
                Approve content
              </button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">
                Edit details
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Outputs</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Current generation</h2>

          <div className="mt-5 space-y-3">
            {output.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm text-slate-300">{label}</div>
                <div className="text-sm font-medium text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <div className="text-sm font-medium text-emerald-200">Ready for publication</div>
            <p className="mt-2 text-sm text-emerald-100/80">Summary, scripture references, and devotional package are approved and waiting to be published.</p>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
