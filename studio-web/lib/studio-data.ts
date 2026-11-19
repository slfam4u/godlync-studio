import { createClient } from "@supabase/supabase-js";
import { createStudioBrowserClient } from "@/lib/supabase-browser";

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
  if (typeof window !== "undefined") {
    return createStudioBrowserClient();
  }

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

function formatMetric(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`.replace(".0M", "M");
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`.replace(".0K", "K");
  return String(value);
}

export async function getStudioOverview() {
  const supabase = getSupabaseClient();

  if (!supabase) return demoOverview;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return demoOverview;

    const { data: profiles, error: profileError } = await supabase
      .from("creator_profiles")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved");

    if (profileError) return demoOverview;

    const profileIds = (profiles ?? []).map((profile) => profile.id);

    if (!profileIds.length) {
      return {
        ...demoOverview,
        stats: demoOverview.stats.map((stat, index) =>
          index < 3 ? { ...stat, value: "0", change: "Live" } : stat
        ),
      };
    }

    const profileFilter = `creator_profile_id.in.(${profileIds.join(",")})`;

    const [mediaCount, mediaRows, followerCount] = await Promise.all([
      supabase
        .from("media_files")
        .select("id", { count: "exact", head: true })
        .or(profileFilter)
        .or("is_deleted.is.null,is_deleted.eq.false"),
      supabase
        .from("media_files")
        .select("id,title,name,content_type,play_count,processed_status,is_published,updated_at,created_at")
        .or(profileFilter)
        .or("is_deleted.is.null,is_deleted.eq.false")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("followers")
        .select("id", { count: "exact", head: true })
        .in("creator_id", profileIds),
    ]);

    let totalPlays = 0;
    let playPage = 0;
    const playPageSize = 1000;

    while (true) {
      const playRows = await supabase
        .from("media_files")
        .select("play_count")
        .or(profileFilter)
        .or("is_deleted.is.null,is_deleted.eq.false")
        .range(playPage * playPageSize, (playPage + 1) * playPageSize - 1);

      if (playRows.error) break;

      const rows = playRows.data ?? [];
      totalPlays += rows.reduce(
        (sum, item) => sum + (Number(item.play_count) || 0),
        0
      );

      if (rows.length < playPageSize) break;
      playPage += 1;
    }

    const eventStart = new Date();
    eventStart.setHours(0, 0, 0, 0);
    eventStart.setDate(eventStart.getDate() - 6);

    const { data: creatorMediaRows } = await supabase
      .from("media_files")
      .select("id")
      .or(profileFilter)
      .or("is_deleted.is.null,is_deleted.eq.false")
      .range(0, 9999);

    const creatorMediaIds = new Set(
      (creatorMediaRows ?? []).map((item) => item.id)
    );

    const { data: playEvents } = await supabase
      .from("app_events")
      .select("payload,created_at")
      .eq("event_type", "media_play")
      .gte("created_at", eventStart.toISOString())
      .order("created_at", { ascending: true })
      .range(0, 9999);

    const chartData = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(eventStart);
      date.setDate(eventStart.getDate() + index);

      return {
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
        key: date.toISOString().slice(0, 10),
        plays: 0,
      };
    });

    for (const event of playEvents ?? []) {
      const payload = event.payload as { media_id?: string } | null;
      if (!payload?.media_id || !creatorMediaIds.has(payload.media_id)) continue;

      const key = new Date(event.created_at).toISOString().slice(0, 10);
      const day = chartData.find((item) => item.key === key);
      if (day) day.plays += 1;
    }

    const mappedRows = (mediaRows.data ?? []).map((item: any) => {
      const status = item.is_published
        ? "Published"
        : item.processed_status
          ? String(item.processed_status).toUpperCase()
          : "Draft";

      return {
        title: item.title ?? item.name ?? "Untitled media",
        type: item.content_type ?? "Sermon",
        status,
        plays: formatMetric(Number(item.play_count) || 0),
        updated: item.updated_at
          ? new Date(item.updated_at).toLocaleDateString()
          : "Recently",
      };
    });

    return {
      ...demoOverview,
      stats: demoOverview.stats.map((stat, index) => {
        if (index === 0) return { ...stat, value: formatMetric(mediaCount.count ?? 0), change: "Live" };
        if (index === 1) return { ...stat, value: (totalPlays ?? 0).toLocaleString("en-US"), change: "Live" };
        if (index === 2) return { ...stat, value: formatMetric(followerCount.count ?? 0), change: "Live" };
        return stat;
      }),
      contentRows: mappedRows.length ? mappedRows : demoOverview.contentRows,
      chartData,
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

export async function getAudienceInsights() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: profiles, error: profileError } = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "approved");

  if (profileError) return null;

  const profileIds = (profiles ?? []).map((profile) => profile.id);
  if (!profileIds.length) {
    return [
      { name: "Followers", value: "0" },
      { name: "Favorites", value: "0" },
      { name: "Media likes", value: "0" },
      { name: "Comments", value: "0" },
    ];
  }

  const { data: mediaRows } = await supabase
    .from("media_files")
    .select("id")
    .in("creator_profile_id", profileIds)
    .or("is_deleted.is.null,is_deleted.eq.false");

  const mediaIds = (mediaRows ?? []).map((row) => row.id).filter(Boolean);

  const [followers, favorites, mediaLikes, comments] = await Promise.all([
    supabase
      .from("followers")
      .select("id", { count: "exact", head: true })
      .in("creator_id", profileIds),
    mediaIds.length
      ? supabase.from("favorites").select("id", { count: "exact", head: true }).in("file_id", mediaIds)
      : Promise.resolve({ count: 0 }),
    mediaIds.length
      ? supabase.from("likes").select("id", { count: "exact", head: true }).in("file_id", mediaIds)
      : Promise.resolve({ count: 0 }),
    supabase
      .from("wall_comments")
      .select("id", { count: "exact", head: true })
      .in("creator_profile_id", profileIds),
  ]);

  return [
    { name: "Followers", value: (followers.count ?? 0).toLocaleString("en-US") },
    { name: "Favorites", value: (favorites.count ?? 0).toLocaleString("en-US") },
    { name: "Media likes", value: (mediaLikes.count ?? 0).toLocaleString("en-US") },
    { name: "Comments", value: (comments.count ?? 0).toLocaleString("en-US") },
  ];
}

export async function getAnalyticsEngagement() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: profiles, error: profileError } = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "approved");

  if (profileError) return null;

  const profileIds = (profiles ?? []).map((profile) => profile.id);
  if (!profileIds.length) {
    return {
      data: Array.from({ length: 7 }, (_, index) => ({ name: `Day ${index + 1}`, plays: 0, engagement: 0 })),
      totals: { plays: 0, favorites: 0, shares: 0, wallPosts: 0, comments: 0, wallLikes: 0 },
    };
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const [mediaResult, wallResult, eventResult] = await Promise.all([
    supabase
      .from("media_files")
      .select("id")
      .in("creator_profile_id", profileIds)
      .or("is_deleted.is.null,is_deleted.eq.false")
      .range(0, 9999),
    supabase
      .from("wall_posts")
      .select("id")
      .in("creator_profile_id", profileIds)
      .range(0, 9999),
    supabase
      .from("app_events")
      .select("event_type,payload,created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: true })
      .range(0, 9999),
  ]);

  const mediaIds = new Set((mediaResult.data ?? []).map((item) => item.id));
  const wallPostIds = new Set((wallResult.data ?? []).map((item) => item.id));

  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      key: date.toISOString().slice(0, 10),
      plays: 0,
      favorites: 0,
      shares: 0,
      engagement: 0,
    };
  });

  const totals = { plays: 0, favorites: 0, shares: 0, wallPosts: 0, comments: 0, wallLikes: 0 };

  for (const event of eventResult.data ?? []) {
    const payload = event.payload as Record<string, unknown> | null;
    const key = new Date(event.created_at).toISOString().slice(0, 10);
    const day = chartData.find((item) => item.key === key);

    if (event.event_type === "media_play") {
      if (payload?.media_id && mediaIds.has(String(payload.media_id))) {
        totals.plays += 1;
        if (day) {
          day.plays += 1;
          day.engagement += 1;
        }
      }
    } else if (event.event_type === "favorite_add") {
      if (payload?.media_id && mediaIds.has(String(payload.media_id))) {
        totals.favorites += 1;
        if (day) {
          day.favorites += 1;
          day.engagement += 1;
        }
      }
    } else if (event.event_type === "media_share") {
      if (payload?.media_id && mediaIds.has(String(payload.media_id))) {
        totals.shares += 1;
        if (day) {
          day.shares += 1;
          day.engagement += 1;
        }
      }
    } else if (event.event_type === "wall_post_create") {
      if (payload?.post_id && wallPostIds.has(String(payload.post_id))) totals.wallPosts += 1;
    } else if (event.event_type === "wall_post_comment") {
      if (payload?.post_id && wallPostIds.has(String(payload.post_id))) {
        totals.comments += 1;
        if (day) day.engagement += 1;
      }
    } else if (event.event_type === "wall_post_like") {
      if (payload?.post_id && wallPostIds.has(String(payload.post_id))) {
        totals.wallLikes += 1;
        if (day) day.engagement += 1;
      }
    } else if (event.event_type === "wall_post_share") {
      if (payload?.post_id && wallPostIds.has(String(payload.post_id))) totals.shares += 1;
    }
  }

  return { data: chartData, totals };
}
