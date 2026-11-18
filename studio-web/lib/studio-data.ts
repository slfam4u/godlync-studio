import { createClient } from "@supabase/supabase-js";

const demoOverview = {
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

const demoContent = [
  { id: "demo-1", title: "The Power of Faith in Trials", type: "Sermon", status: "Published", plays: "14.2K", date: "Nov 12" },
  { id: "demo-2", title: "Wake Up to Purpose", type: "Devotional", status: "Review", plays: "7.8K", date: "Nov 10" },
  { id: "demo-3", title: "Monday Prayer Session", type: "Prayer", status: "Processing", plays: "3.4K", date: "Nov 9" },
  { id: "demo-4", title: "Leadership in the Church", type: "Bible Study", status: "Published", plays: "21.1K", date: "Nov 5" },
  { id: "demo-5", title: "Healing Through Worship", type: "Worship", status: "Draft", plays: "1.9K", date: "Nov 1" },
];

const demoPublishing = [
  { title: "Sunday Sermon Release", platform: "GodLync", time: "Tomorrow, 9:00 AM", status: "Scheduled" },
  { title: "Prayer Devotional", platform: "Instagram", time: "Wed, 7:30 AM", status: "Queued" },
  { title: "Youth Revival Highlights", platform: "YouTube", time: "Thu, 12:00 PM", status: "Review" },
];

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
      detectSessionInUrl: typeof window !== "undefined",
    },
  });
}

export async function getStudioOverview() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return demoOverview;
  }

  try {
    const { data, error } = await supabase.from("media_files").select("*").limit(4);

    if (error || !data) {
      return demoOverview;
    }

    const mappedRows = data.map((item: any) => ({
      title: item.title ?? item.name ?? "Untitled media",
      type: item.type ?? item.media_type ?? "Sermon",
      status: item.status ?? "Published",
      plays: item.play_count ? `${item.play_count}` : "0",
      updated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "Recently",
    }));

    return {
      ...demoOverview,
      contentRows: mappedRows.length ? mappedRows : demoOverview.contentRows,
    };
  } catch {
    return demoOverview;
  }
}

export async function getStudioContent() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return demoContent;
  }

  try {
    const { data, error } = await supabase.from("media_files").select("*").limit(10);

    if (error || !data) {
      return demoContent;
    }

    const mappedRows = data.map((item: any) => ({
      id: item.id,
      title: item.title ?? item.name ?? "Untitled media",
      type: item.type ?? item.media_type ?? "Sermon",
      status: item.status ?? "Published",
      plays: item.play_count ? `${item.play_count}` : "0",
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently",
    }));

    return mappedRows.length ? mappedRows : demoContent;
  } catch {
    return demoContent;
  }
}

export async function getPublishingQueue() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return demoPublishing;
  }

  try {
    const { data, error } = await supabase.from("content_schedules").select("*").limit(5);

    if (error || !data) {
      return demoPublishing;
    }

    return data.length
      ? data.map((item: any) => ({
          title: item.title ?? "Scheduled content",
          platform: item.platform ?? "GodLync",
          time: item.scheduled_for ? new Date(item.scheduled_for).toLocaleString() : "Scheduled",
          status: item.status ?? "Scheduled",
        }))
      : demoPublishing;
  } catch {
    return demoPublishing;
  }
}

export async function uploadStudioMedia(file: File, title: string, contentType = "Sermon") {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: true, demo: true, path: `demo://${title || file.name}` };
  }

  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError || !authData.session) {
    return { ok: false, error: "Please sign in before uploading." };
  }

  const user = authData.session.user;
  const bucket = process.env.NEXT_PUBLIC_STUDIO_UPLOAD_BUCKET ?? "media";
  const objectName = `studio-uploads/${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(objectName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) throw uploadError;

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(uploadData.path).data.publicUrl;

    const { data: creatorProfile } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .limit(1)
      .maybeSingle();

    const mediaPayload = {
      id: crypto.randomUUID(),
      title: title || file.name,
      name: title || file.name,
      content_type: contentType,
      file_url: publicUrl,
      file_path: uploadData.path,
      original_file_url: publicUrl,
      original_file_path: uploadData.path,
      creator_profile_id: creatorProfile?.id ?? null,
      uploaded_by: user.id,
      processed_status: "PENDING",
      is_published: false,
      is_deleted: false,
      updated_at: new Date().toISOString(),
    };

    const { data: mediaData, error: mediaError } = await supabase
      .from("media_files")
      .insert(mediaPayload)
      .select("id")
      .single();

    if (mediaError) throw mediaError;

    await supabase.from("media_processing_jobs").insert({
      media_file_id: mediaData.id,
      job_type: "transcription",
      status: "queued",
      requested_by: user.id,
    });

    return {
      ok: true,
      demo: false,
      path: uploadData.path,
      mediaId: mediaData.id,
      title,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
}

export async function publishMediaToGodLync(mediaId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true, demo: true };

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return { ok: false, error: "Please sign in." };

  const { error } = await supabase
    .from("media_files")
    .update({ is_published: true, updated_at: new Date().toISOString() })
    .eq("id", mediaId)

  if (error) return { ok: false, error: error.message };

  await supabase.from("content_publications").insert({
    media_file_id: mediaId,
    platform: "godlync",
    status: "published",
    published_at: new Date().toISOString(),
  });

  return { ok: true };
}
