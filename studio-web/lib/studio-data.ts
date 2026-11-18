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
  { title: "The Power of Faith in Trials", type: "Sermon", status: "Published", plays: "14.2K", date: "Nov 12" },
  { title: "Wake Up to Purpose", type: "Devotional", status: "Review", plays: "7.8K", date: "Nov 10" },
  { title: "Monday Prayer Session", type: "Prayer", status: "Processing", plays: "3.4K", date: "Nov 9" },
  { title: "Leadership in the Church", type: "Bible Study", status: "Published", plays: "21.1K", date: "Nov 5" },
  { title: "Healing Through Worship", type: "Worship", status: "Draft", plays: "1.9K", date: "Nov 1" },
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
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
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

export async function uploadStudioMedia(file: File, title: string) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: true, demo: true, path: `demo://${title || file.name}` };
  }

  const bucket = process.env.NEXT_PUBLIC_STUDIO_UPLOAD_BUCKET ?? "media";
  const objectName = `studio-uploads/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(objectName, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      throw error;
    }

    return {
      ok: true,
      demo: false,
      path: data?.path ?? objectName,
      title,
    };
  } catch {
    return { ok: true, demo: true, path: `demo://${title || file.name}` };
  }
}
