
-- Fix search_path on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Replace broad bucket SELECT with admin-only listing (public file URLs still work via CDN)
DROP POLICY IF EXISTS "Public read slider" ON storage.objects;
DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public read events" ON storage.objects;

CREATE POLICY "Admins list slider" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='slider' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins list gallery" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='gallery' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins list events" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='events' AND public.has_role(auth.uid(),'admin'));

-- Lock down has_role execute to authenticated only
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
