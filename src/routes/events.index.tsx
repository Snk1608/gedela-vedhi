import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/events/")({
  component: EventsList,
  head: () => ({ meta: [{ title: "Community Events — Gedela Vedhi Youth" }] }),
});

function EventsList() {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("events").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => setEvents(data ?? []));
  }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <p className="text-vermillion uppercase tracking-widest text-xs font-semibold mb-2">{t("eventsKicker")}</p>
        <h1 className="font-display text-4xl sm:text-5xl">{t("eventsTitle")}</h1>
        <p className="text-muted-foreground mt-3">{t("eventsSubtitle")}</p>
      </div>
      {events.length === 0 ? (
        <p className="text-center text-muted-foreground">{t("noEvents")}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(ev => (
            <Link key={ev.id} to="/events/$slug" params={{ slug: ev.slug }}>
              <Card className="hover-lift overflow-hidden h-full">
                {ev.banner_url && <img src={ev.banner_url} alt={ev.name} className="h-40 w-full object-cover" />}
                <CardContent className="p-5">
                  <h3 className="font-display text-xl mb-1">{ev.name}</h3>
                  {ev.event_date && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(ev.event_date).toLocaleDateString(lang === "te" ? "te-IN" : "en-IN", { dateStyle: "long" })}
                    </div>
                  )}
                  {ev.description && <p className="text-sm text-muted-foreground line-clamp-3">{ev.description}</p>}
                  <div className="mt-3 text-primary text-sm flex items-center gap-1">{t("viewAndDonate")} <ArrowRight className="h-4 w-4" /></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
