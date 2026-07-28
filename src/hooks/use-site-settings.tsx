import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings { logo_url: string | null; site_name: string | null; site_name_te: string | null; }

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({ logo_url: null, site_name: null, site_name_te: null });
  useEffect(() => {
    supabase.from("site_settings").select("logo_url, site_name, site_name_te").limit(1).maybeSingle()
      .then(({ data }) => { if (data) setSettings(data as SiteSettings); });
  }, []);
  return settings;
}
