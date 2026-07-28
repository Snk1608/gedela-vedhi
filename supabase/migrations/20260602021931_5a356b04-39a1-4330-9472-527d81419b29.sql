-- 1) Donations: hide PII (phone, email, transaction_id) from public; expose safe view
DROP POLICY IF EXISTS "Approved donations are public" ON public.donations;

CREATE OR REPLACE VIEW public.donations_public AS
SELECT id, donor_name, amount, payment_method, message, event_tag, status, created_at
FROM public.donations
WHERE status = 'approved';

GRANT SELECT ON public.donations_public TO anon, authenticated;

-- 2) Payment settings: hide bank account number, IFSC, bank name from public
DROP POLICY IF EXISTS "Payment settings public read" ON public.payment_settings;

CREATE OR REPLACE VIEW public.payment_settings_public AS
SELECT id, upi_id, phonepe_number, qr_image_url, account_holder, notes, updated_at
FROM public.payment_settings;

GRANT SELECT ON public.payment_settings_public TO anon, authenticated;