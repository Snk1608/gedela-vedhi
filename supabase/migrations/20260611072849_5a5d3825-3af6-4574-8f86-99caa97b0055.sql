DROP POLICY IF EXISTS "Approved donations public read" ON public.donations;
DROP POLICY IF EXISTS "Payment settings public read" ON public.payment_settings;
REVOKE SELECT ON public.donations FROM anon;
REVOKE SELECT ON public.payment_settings FROM anon;
GRANT SELECT ON public.donations_public TO anon, authenticated;
GRANT SELECT ON public.payment_settings_public TO anon, authenticated;