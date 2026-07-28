CREATE TABLE public.contact_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text,
  phone text,
  email text,
  instagram text,
  maps_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contact settings public read" ON public.contact_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage contact settings" ON public.contact_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER contact_settings_touch BEFORE UPDATE ON public.contact_settings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.contact_settings (address, phone, email, instagram, maps_url) VALUES (
  'Gajarayuni Valasa, Gedela Vedhi, Andhra Pradesh — 535578',
  '+91 91210 77054',
  'gedelavedhiboyz@gmail.com',
  '@gedelavedhi_boys',
  'https://www.google.com/maps/search/Gajarayuni+Valasa+Andhra+Pradesh'
);