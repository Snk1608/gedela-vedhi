CREATE TABLE public.suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  suggestion text NOT NULL,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suggestions TO authenticated;
GRANT INSERT ON public.suggestions TO anon;
GRANT ALL ON public.suggestions TO service_role;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit suggestion" ON public.suggestions FOR INSERT TO anon, authenticated WITH CHECK (
  length(name) BETWEEN 1 AND 100 AND length(suggestion) BETWEEN 1 AND 1000
  AND (email IS NULL OR length(email) <= 255)
  AND (phone IS NULL OR length(phone) <= 20)
);
CREATE POLICY "Admins read suggestions" ON public.suggestions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete suggestions" ON public.suggestions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));