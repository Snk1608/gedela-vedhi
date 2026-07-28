CREATE TABLE public.countdowns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  event_date timestamptz NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.countdowns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.countdowns TO authenticated;
GRANT ALL ON public.countdowns TO service_role;
ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Countdowns public read" ON public.countdowns FOR SELECT USING (true);
CREATE POLICY "Admins manage countdowns" ON public.countdowns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));