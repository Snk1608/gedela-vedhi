import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function AnnouncementBar() {
  const { t } = useLanguage();
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("text")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setItems((data ?? []).map((a) => a.text)));
  }, []);

  if (items.length === 0) return null;
  const text = items.join("   ✦   ");

  return (
    <div className="bg-vermillion text-primary-foreground overflow-hidden border-y border-white/20">
      <div className="flex items-center gap-3 py-2">
        <div className="shrink-0 px-3 flex items-center gap-2 font-medium text-sm">
          <Megaphone className="h-4 w-4" /> {t("announcement")}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-sm">
            <span className="mr-12">{text}</span>
            <span className="mr-12">{text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
