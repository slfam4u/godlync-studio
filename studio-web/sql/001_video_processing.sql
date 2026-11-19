-- GodLync Studio sermon video processing schema

CREATE TABLE IF NOT EXISTS public.media_processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id uuid NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL,
  job_type text NOT NULL DEFAULT 'sermon_video',
  status text NOT NULL DEFAULT 'queued',
  progress integer NOT NULL DEFAULT 0,
  input_path text,
  output_manifest_path text,
  result_payload jsonb,
  error text,
  attempts integer NOT NULL DEFAULT 0,
  idempotency_key text,
  worker_id text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_processing_jobs_progress_check CHECK (progress >= 0 AND progress <= 100)
);

CREATE UNIQUE INDEX IF NOT EXISTS media_processing_jobs_idempotency_key_uq
  ON public.media_processing_jobs(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS media_processing_jobs_media_id_idx
  ON public.media_processing_jobs(media_file_id, created_at DESC);

CREATE INDEX IF NOT EXISTS media_processing_jobs_status_idx
  ON public.media_processing_jobs(status, created_at);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id uuid NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  processing_job_id uuid REFERENCES public.media_processing_jobs(id) ON DELETE SET NULL,
  asset_type text NOT NULL,
  label text,
  title text,
  description text,
  storage_path text,
  public_url text,
  start_seconds numeric,
  duration_seconds numeric,
  format text NOT NULL DEFAULT 'mp4',
  status text NOT NULL DEFAULT 'review',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_assets_media_id_idx
  ON public.media_assets(media_file_id, created_at DESC);

CREATE INDEX IF NOT EXISTS media_assets_job_id_idx
  ON public.media_assets(processing_job_id);

CREATE TABLE IF NOT EXISTS public.media_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id uuid NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  processing_job_id uuid REFERENCES public.media_processing_jobs(id) ON DELETE SET NULL,
  language text,
  transcript_json jsonb,
  transcript_text text,
  status text NOT NULL DEFAULT 'review',
  requested_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_transcripts_media_id_idx
  ON public.media_transcripts(media_file_id, created_at DESC);

ALTER TABLE public.media_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_processing_jobs_creator_select
ON public.media_processing_jobs FOR SELECT TO authenticated
USING (requested_by = auth.uid());

CREATE POLICY media_processing_jobs_creator_insert
ON public.media_processing_jobs FOR INSERT TO authenticated
WITH CHECK (requested_by = auth.uid());

CREATE POLICY media_processing_jobs_creator_update
ON public.media_processing_jobs FOR UPDATE TO authenticated
USING (requested_by = auth.uid())
WITH CHECK (requested_by = auth.uid());

CREATE POLICY media_assets_creator_select
ON public.media_assets FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.media_files mf
    WHERE mf.id = media_assets.media_file_id
      AND mf.uploaded_by = auth.uid()
  )
);

CREATE POLICY media_assets_creator_insert
ON public.media_assets FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.media_files mf
    WHERE mf.id = media_assets.media_file_id
      AND mf.uploaded_by = auth.uid()
  )
);

CREATE POLICY media_assets_creator_update
ON public.media_assets FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.media_files mf
    WHERE mf.id = media_assets.media_file_id
      AND mf.uploaded_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.media_files mf
    WHERE mf.id = media_assets.media_file_id
      AND mf.uploaded_by = auth.uid()
  )
);

CREATE POLICY media_transcripts_creator_select
ON public.media_transcripts FOR SELECT TO authenticated
USING (requested_by = auth.uid());

CREATE POLICY media_transcripts_creator_insert
ON public.media_transcripts FOR INSERT TO authenticated
WITH CHECK (requested_by = auth.uid());

CREATE POLICY media_transcripts_creator_update
ON public.media_transcripts FOR UPDATE TO authenticated
USING (requested_by = auth.uid())
WITH CHECK (requested_by = auth.uid());
