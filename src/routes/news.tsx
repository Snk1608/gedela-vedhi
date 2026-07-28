import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/news")({
  component: News,
  head: () => ({
    meta: [
      { title: "News & Updates — Gedela Vedhi Youth" },
      { name: "description", content: "Latest news and announcements from Gedela Vedhi Youth." },
    ],
  }),
});

interface Item { id: string; text: string; created_at: string; image_url: string | null; }

function News() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, text, created_at, image_url")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Item[]));
  }, []);

  return (
    <div>
      <section className="bg-hero-gradient py-12">
        <div className="mx-auto max-w-4xl px-4 text-center animate-fade-in">
          <p className="text-vermillion uppercase tracking-widest text-xs font-semibold mb-2">{t("newsKicker")}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{t("newsTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("newsSubtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-12">{t("newsEmpty")}</p>
        )}
        {items.map((item, i) => (
          <Card key={item.id} className="hover-lift border-l-4 border-l-primary animate-fade-in overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
            {item.image_url && (
              <img src={item.image_url} alt="" className="w-full max-h-80 object-cover" />
            )}
            <CardContent className="p-5 flex items-start gap-4">
              <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-festive-gradient text-primary-foreground">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-foreground whitespace-pre-wrap">{item.text}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(item.created_at).toLocaleDateString(lang === "te" ? "te-IN" : "en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
