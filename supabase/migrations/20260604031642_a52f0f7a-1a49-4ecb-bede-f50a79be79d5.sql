ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS bg_image_url text,
  ADD COLUMN IF NOT EXISTS bg_opacity numeric NOT NULL DEFAULT 0.3 CHECK (bg_opacity >= 0 AND bg_opacity <= 1);