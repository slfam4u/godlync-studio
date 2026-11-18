"use client";

import { BrainCircuit, Mic, Save, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

import { StudioShell } from "@/components/studio-shell";
import { createStudioBrowserClient } from "@/lib/supabase-browser";
import { getStudioContent } from "@/lib/studio-data";

export default function AIPage() {
  const [media, setMedia] = useState<Array<{ id?: string; title: string; status: string }>>([]);
  const [selectedId, setSelectedId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("Select uploaded media and add or review its transcript.");

  useEffect(() => {
    getStudioContent().then((rows) => {
      setMedia(rows);
      if (rows[0]?.id) setSelectedId(rows[0].id);
    });
  }, []);

  function generateSummary() {
    const text = transcript.trim();
    if (!text) {
      setStatus("Add a transcript before generating a summary.");
      return;
    }

    const sentences = text.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean);
    const selected = sentences.slice(0, 4).join(". ");
    setSummary(selected ? `${selected}.` : text.slice(0, 500));
    setStatus("Draft summary generated. Review and approve it before publication.");
  }

  async function saveOutput() {
    if (!selectedId) {
      setStatus("Select a media item first.");
      return;
    }

    const supabase = createStudioBrowserClient();
    if (!supabase) {
      setStatus("Saved as a Studio draft in this demo session.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setStatus("Please sign in before saving AI output.");
      return;
    }

    const { error } = await supabase.from("ai_generations").insert({
      media_file_id: selectedId,
      generation_type: "sermon_summary",
      transcript,
      content: summary,
      status: "review",
      requested_by: sessionData.session.user.id,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setStatus(`Unable to save generation: ${error.message}`);
      return;
    }

    setStatus("Transcript and summary saved for creator review.");
  }

  return (
    <StudioShell>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">AI Studio</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">Sermon transcription</h1>
            </div>
            <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-amber-200">
              Creator review
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Media</label>
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#0d1219] px-4 py-3 text-sm text-white focus:outline-none"
              >
                {media.map((item) => (
                  <option key={item.id ?? item.title} value={item.id ?? ""}>{item.title}</option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-sm text-slate-300"><Mic className="h-4 w-4 text-amber-300" /> Whisper processing</div>
              <div className="mt-2 text-xs text-slate-400">Queue a background worker to generate the transcript from the uploaded media file.</div>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Transcript</label>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={10}
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#0d1219] px-4 py-3 text-sm leading-7 text-slate-200 placeholder:text-slate-500 focus:outline-none"
              placeholder="Paste the Whisper transcript or worker output here."
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={generateSummary} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
              <Wand2 className="h-4 w-4" /> Generate summary
            </button>
            <button onClick={saveOutput} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">
              <Save className="h-4 w-4" /> Save for review
            </button>
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
            <BrainCircuit className="h-4 w-4 text-amber-300" /> Sermon summary
          </div>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={15}
            className="mt-5 w-full resize-none rounded-2xl border border-white/10 bg-[#0d1219] px-4 py-3 text-sm leading-7 text-slate-200 placeholder:text-slate-500 focus:outline-none"
            placeholder="The generated summary will appear here for final creator review."
          />
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p className="text-sm leading-6 text-emerald-100/80">{status}</p>
          </div>
        </aside>
      </div>
    </StudioShell>
  );
}
