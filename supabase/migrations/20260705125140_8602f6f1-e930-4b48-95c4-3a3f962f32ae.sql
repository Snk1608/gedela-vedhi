REVOKE SELECT ON public.donations FROM anon;
GRANT SELECT (id, donor_name, amount, payment_method, message, event_tag, status, created_at) ON public.donations TO anon;
DROP POLICY IF EXISTS "Public can view approved donations" ON public.donations;
CREATE POLICY "Public can view approved donations"
ON public.donations
FOR SELECT
TO anon
USING (status = 'approved'::public.donation_status);

REVOKE SELECT ON public.payment_settings FROM anon;
GRANT SELECT (id, bank_name, account_number, account_holder, ifsc, upi_id, phonepe_number, qr_image_url, notes, updated_at) ON public.payment_settings TO anon;
DROP POLICY IF EXISTS "Public can view payment settings" ON public.payment_settings;
CREATE POLICY "Public can view payment settings"
ON public.payment_settings
FOR SELECT
TO anon
USING (true);