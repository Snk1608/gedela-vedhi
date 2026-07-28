-- Replace security-definer views with security-invoker views and use
-- column-level privileges on base tables to hide PII from anon.

DROP VIEW IF EXISTS public.donations_public;
DROP VIEW IF EXISTS public.payment_settings_public;

-- DONATIONS: restore public SELECT for anon only (approved rows), revoke PII columns
CREATE POLICY "Approved donations public read"
  ON public.donations FOR SELECT
  TO anon
  USING (status = 'approved');

REVOKE SELECT ON public.donations FROM anon;
GRANT SELECT (id, donor_name, amount, payment_method, message, event_tag, status, created_at)
  ON public.donations TO anon;

CREATE VIEW public.donations_public
  WITH (security_invoker = on) AS
SELECT id, donor_name, amount, payment_method, message, event_tag, status, created_at
FROM public.donations
WHERE status = 'approved';

GRANT SELECT ON public.donations_public TO anon, authenticated;

-- PAYMENT_SETTINGS: restore public SELECT for anon, revoke sensitive bank columns
CREATE POLICY "Payment settings public read"
  ON public.payment_settings FOR SELECT
  TO anon
  USING (true);

REVOKE SELECT ON public.payment_settings FROM anon;
GRANT SELECT (id, upi_id, phonepe_number, qr_image_url, account_holder, notes, updated_at, created_at)
  ON public.payment_settings TO anon;

CREATE VIEW public.payment_settings_public
  WITH (security_invoker = on) AS
SELECT id, upi_id, phonepe_number, qr_image_url, account_holder, notes, updated_at
FROM public.payment_settings;

GRANT SELECT ON public.payment_settings_public TO anon, authenticated;