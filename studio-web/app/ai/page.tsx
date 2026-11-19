"use client";

import { BrainCircuit, Mic, Save, Sparkles, UploadCloud, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

import { StudioShell } from "@/components/studio-shell";
import { createStudioBrowserClient } from "@/lib/supabase-browser";
import {
  approveMediaAsset,
  createSermonVideoJob,
  getMediaProcessingAssets,
  getSermonVideoJob,
  getStudioContent,
  publishMediaAsset,
  uploadStudioMedia,
} from "@/lib/studio-data";

export default function AIPage() {
  const [media, setMedia] = useState<Array<{ id?: string; title: string; status: string }>>([]);
  const [selectedId, setSelectedId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("Select uploaded media and add or review its transcript.");

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [language, setLanguage] = useState<"english" | "telugu">("english");
  const [videoStatus, setVideoStatus] = useState("Choose a sermon video to generate clips and transcript assets.");
  const [videoJob, setVideoJob] = useState<any>(null);
  const [videoAssets, setVideoAssets] = useState<any[]>([]);
  const [isVideoSubmitting, setIsVideoSubmitting] = useState(false);

  useEffect(() => {
    getStudioContent().then((rows) => {
      setMedia(rows);
      if (rows[0]?.id) setSelectedId(rows[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    let active = true;

    async function refreshVideoState() {
      const [job, assets] = await Promise.all([
        getSermonVideoJob(selectedId),
        getMediaProcessingAssets(selectedId),
      ]);

      if (!active) return;
      setVideoJob(job);
      setVideoAssets(assets);

      if (job?.status === "completed") {
        setVideoStatus("Processing complete. Review, approve, and publish each generated asset.");
      } else if (job?.status === "failed") {
        setVideoStatus(job.error || "Video processing failed.");
      } else if (job?.status === "processing" || job?.status === "transcribing" || job?.status === "uploading_outputs") {
        setVideoStatus(`${job.status.replace("_", " ")} — ${job.progress ?? 0}% complete`);
      }
    }

    refreshVideoState();
    const interval = window.setInterval(refreshVideoState, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedId]);

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

  async function handleVideoSubmit(event: React.SyntheticEvent) {
    event.preventDefault();

    if (!videoFile) {
      setVideoStatus("Please select a sermon video file.");
      return;
    }

    if (!videoFile.type.startsWith("video/") && !/\.(mp4|mov|mkv|m4v|webm|avi)$/i.test(videoFile.name)) {
      setVideoStatus("Select an MP4, MOV, MKV, M4V, WebM, or AVI video file.");
      return;
    }

    setIsVideoSubmitting(true);
    setVideoStatus("Uploading sermon video to shared media storage...");

    try {
      const upload = await uploadStudioMedia(videoFile, videoTitle || videoFile.name.replace(/\.[^.]+$/, ""), "Sermon");
      if (!upload.ok || !upload.mediaId) {
        setVideoStatus(upload.error || "Video upload failed.");
        return;
      }

      setSelectedId(upload.mediaId);
      const job = await createSermonVideoJob(upload.mediaId, upload.path ?? "", videoTitle || videoFile.name, language);

      if (!job.ok) {
        setVideoStatus(job.error || "Unable to queue video processing.");
        return;
      }

      setVideoStatus("Video queued. FFmpeg and Whisper processing has started.");
      setVideoJob(job.job ?? null);
    } catch (error) {
      setVideoStatus(error instanceof Error ? error.message : "Video upload or processing failed.");
    } finally {
      setIsVideoSubmitting(false);
    }
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

      <div className="mt-6 rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Sermon Video Processor</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">Create clips and transcript assets</h1>
          </div>
          {videoJob && (
            <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-amber-200">
              {videoJob.status} · {videoJob.progress ?? 0}%
            </div>
          )}
        </div>

        <form onSubmit={handleVideoSubmit} className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_220px_auto]">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Sermon video</label>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/x-msvideo,.mp4,.mov,.mkv,.m4v,.webm,.avi"
              onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-2xl border border-dashed border-white/15 bg-[#0d1219] px-4 py-3 text-sm text-slate-300"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Sermon title</label>
            <input
              value={videoTitle}
              onChange={(event) => setVideoTitle(event.target.value)}
              placeholder="Sunday sermon title"
              className="w-full rounded-2xl border border-white/10 bg-[#0d1219] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Language</label>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as "english" | "telugu")}
              className="w-full rounded-2xl border border-white/10 bg-[#0d1219] px-4 py-3 text-sm text-white focus:outline-none"
            >
              <option value="english">English</option>
              <option value="telugu">Telugu</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isVideoSubmitting}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:opacity-60"
          >
            <UploadCloud className="h-4 w-4" />
            {isVideoSubmitting ? "Uploading..." : "Process video"}
          </button>
        </form>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          {videoStatus}
        </div>

        {videoAssets.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Generated assets</div>
              <div className="text-xs text-slate-500">Review before GodLync publication</div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {videoAssets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-white/10 bg-[#0d1219] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{asset.label || asset.asset_type}</div>
                      <div className="mt-1 text-xs text-slate-400">{asset.duration_seconds ? `${Math.round(asset.duration_seconds)} sec` : "Full duration"}</div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${asset.is_published ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/10 text-amber-200"}`}>
                      {asset.is_published ? "Published" : asset.status}
                    </span>
                  </div>
                  {asset.public_url && (
                    <video className="mt-3 max-h-44 w-full rounded-xl bg-black" controls preload="metadata" src={asset.public_url} />
                  )}
                  {!asset.is_published && (
                    <div className="mt-3 flex gap-2">
                      {asset.status !== "approved" && (
                        <button
                          type="button"
                          onClick={async () => {
                            await approveMediaAsset(asset.id);
                            const assets = await getMediaProcessingAssets(selectedId);
                            setVideoAssets(assets);
                          }}
                          className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200"
                        >
                          Approve
                        </button>
                      )}
                      {asset.status === "approved" && (
                        <button
                          type="button"
                          onClick={async () => {
                            const result = await publishMediaAsset(asset.id);
                            setVideoStatus(result.ok ? "Generated asset published to GodLync." : result.error || "Publish failed.");
                            const assets = await getMediaProcessingAssets(selectedId);
                            setVideoAssets(assets);
                          }}
                          className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950"
                        >
                          Publish to GodLync
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudioShell>
  );
}
