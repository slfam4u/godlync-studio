"use client";

import { CalendarClock, CheckCircle2, Clock3, Sparkles, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

import { StudioShell } from "@/components/studio-shell";
import { getStudioContent, publishMediaToGodLync, uploadStudioMedia } from "@/lib/studio-data";

const upcoming = [
	{ title: "Sunday Sermon Release", platform: "GodLync", time: "Tomorrow, 9:00 AM", status: "Scheduled" },
	{ title: "Prayer Devotional", platform: "Instagram", time: "Wed, 7:30 AM", status: "Queued" },
	{ title: "Youth Revival Highlights", platform: "YouTube", time: "Thu, 12:00 PM", status: "Review" },
];

const platforms = ["GodLync", "YouTube", "Instagram", "Facebook"];

export default function PublishingPage() {
	const [title, setTitle] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [status, setStatus] = useState("Ready to upload");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [contentType, setContentType] = useState("Sermon");
	const [draftMedia, setDraftMedia] = useState<Array<{ id?: string; title: string; status: string }>>([]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!selectedFile) {
			setStatus("Please choose a file to upload.");
			return;
		}

		setIsSubmitting(true);
		setStatus("Uploading to Supabase storage...");

		try {
			const result = await uploadStudioMedia(selectedFile, title || selectedFile.name, contentType);
			setStatus(result.ok ? `Upload ready: ${result.path}` : "Upload failed. Please retry.");
		} catch {
			setStatus("Upload failed. Please retry.");
		} finally {
			setIsSubmitting(false);
		}
	}

	useEffect(() => {
		async function fetchData() {
			const content = await getStudioContent();
			console.log(content);
		}

		fetchData();
	}, []);

	useEffect(() => {
		getStudioContent().then((rows) => setDraftMedia(rows.filter((row) => row.status !== "Published")));
	}, []);

	return (
		<StudioShell>
			<div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-xs uppercase tracking-[0.28em] text-slate-400">Publishing</div>
							<h1 className="mt-2 text-3xl font-semibold text-white">Release schedule</h1>
						</div>
						<button className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200">
							Publish now
						</button>
					</div>

					<div className="mt-6 flex flex-wrap gap-2">
						{platforms.map((platform, index) => (
							<button
								key={platform}
								className={`rounded-full px-3 py-1.5 text-sm ${
									index === 0
										? "bg-amber-300 text-slate-950"
										: "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
								}`}
							>
								{platform}
							</button>
						))}
					</div>

					<form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
						<div className="flex items-center gap-2 text-sm text-slate-200">
							<UploadCloud className="h-4 w-4 text-amber-300" />
							Upload media to shared storage
						</div>

						<div className="mt-4 space-y-4">
							<div>
								<label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-400">Title</label>
								<input
									value={title}
									onChange={(event) => setTitle(event.target.value)}
									className="w-full rounded-xl border border-white/10 bg-[#0d1219] px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
									placeholder="Sunday message title"
								/>
							</div>

							<div>
								<label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-400">File</label>
								<input
									type="file"
									onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
									className="w-full rounded-xl border border-dashed border-white/15 bg-[#0d1219] px-3 py-3 text-sm text-slate-300"
								/>
							</div>

							<div>
								<label className="mb-2 block text-xs uppercase tracking-[0.24em] text-slate-400">Content type</label>
								<select
									value={contentType}
									onChange={(event) => setContentType(event.target.value)}
									className="w-full rounded-xl border border-white/10 bg-[#0d1219] px-3 py-2.5 text-white focus:outline-none"
								>
									<option>Sermon</option>
									<option>Worship</option>
									<option>Devotional</option>
									<option>Prayer</option>
									<option>Podcast</option>
									<option>Bible Study</option>
								</select>
							</div>

							<div className="flex items-center justify-between gap-3">
								<div className="text-xs text-slate-400">{status}</div>
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isSubmitting ? "Uploading..." : "Upload"}
								</button>
							</div>
						</div>
					</form>

					<div className="mt-6 space-y-4">
						{upcoming.map(({ title, platform, time, status }) => (
							<div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<div className="flex items-center justify-between gap-3">
									<div>
										<div className="text-lg font-semibold text-white">{title}</div>
										<div className="mt-1 text-sm text-slate-400">{platform}</div>
									</div>
									<span
										className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
											status === "Scheduled"
												? "bg-emerald-400/15 text-emerald-200"
												: status === "Queued"
												? "bg-cyan-400/15 text-cyan-200"
												: "bg-amber-400/15 text-amber-200"
										}`}
									>
										{status}
									</span>
								</div>

								<div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
									<CalendarClock className="h-4 w-4 text-slate-400" />
									{time}
								</div>
							</div>
						))}
					</div>

					{draftMedia.length > 0 && (
						<div className="mt-6">
							<div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">Draft media</div>
							<div className="space-y-3">
								{draftMedia.map((item) => (
									<div key={item.id ?? item.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
										<div>
											<div className="text-sm font-medium text-white">{item.title}</div>
											<div className="mt-1 text-xs text-slate-400">{item.status}</div>
										</div>
										{item.id && (
											<button
												type="button"
												onClick={async () => {
													const result = await publishMediaToGodLync(item.id as string);
													setStatus(result.ok ? "Published to GodLync." : result.error ?? "Publish failed.");
													if (result.ok) setDraftMedia((rows) => rows.filter((row) => row.id !== item.id));
												}}
												className="rounded-xl bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/25"
											>
												Publish to GodLync
											</button>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="rounded-3xl border border-white/10 bg-[#10141d] p-5 shadow-xl shadow-black/20">
					<div className="text-xs uppercase tracking-[0.28em] text-slate-400">Publishing health</div>
					<h2 className="mt-2 text-2xl font-semibold text-white">Delivery overview</h2>

					<div className="mt-5 space-y-4">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="flex items-center gap-2 text-sm text-slate-300">
								<CheckCircle2 className="h-4 w-4 text-emerald-300" />
								12 items published this week
							</div>
						</div>

						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="flex items-center gap-2 text-sm text-slate-300">
								<Clock3 className="h-4 w-4 text-amber-300" />
								3 scheduled publications pending
							</div>
						</div>

						<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="flex items-center gap-2 text-sm text-slate-300">
								<Sparkles className="h-4 w-4 text-cyan-300" />
								AI-generated clips ready for review
							</div>
						</div>
					</div>
				</div>
			</div>
		</StudioShell>
	);
}
