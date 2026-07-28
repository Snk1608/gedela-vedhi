GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
-- Ensure super admin roles for primary admin email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE lower(email)='gedelavedhiboyz@gmail.com'
ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role FROM auth.users WHERE lower(email)='gedelavedhiboyz@gmail.com'
ON CONFLICT DO NOTHING;