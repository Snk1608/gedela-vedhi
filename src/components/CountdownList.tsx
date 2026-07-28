import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface Countdown {
  id: string;
  name: string;
  event_date: string;
}

function diff(target: Date) {
  const now = new Date();
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return null;
  // Calendar-day difference (in local time) — ticks down at midnight
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetMid = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const days = Math.round((targetMid - todayMid) / 86400000);
  // Hours/min/sec count down to the next midnight (or event time if same day)
  const remaining = days > 0 ? (todayMid + 86400000) - now.getTime() : ms;
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function Box({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-background/90 rounded-lg px-3 py-2 min-w-[60px] shadow-soft">
      <span className="font-display text-2xl sm:text-3xl text-primary leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

function CountdownCard({ c }: { c: Countdown }) {
  const { t: tr, lang } = useLanguage();
  const target = new Date(c.event_date);
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [c.event_date]);

  return (
    <Card className="border-2 border-primary/30 bg-hero-gradient overflow-hidden">
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-festive-gradient text-primary-foreground flex items-center justify-center shrink-0">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl">{c.name}</h3>
            <p className="text-xs text-muted-foreground">
              {target.toLocaleDateString(lang === "te" ? "te-IN" : "en-IN", { dateStyle: "long" })}
            </p>
          </div>
        </div>
        {t ? (
          <div className="flex gap-2 justify-center">
            <Box value={t.days} label={tr("days")} />
            <Box value={t.hours} label={tr("hrs")} />
            <Box value={t.minutes} label={tr("min")} />
            <Box value={t.seconds} label={tr("sec")} />
          </div>
        ) : (
          <span className="font-display text-lg text-vermillion">{tr("happeningNow")}</span>
        )}
      </CardContent>
    </Card>
  );
}

export function CountdownList() {
  const [items, setItems] = useState<Countdown[]>([]);

  useEffect(() => {
    supabase
      .from("countdowns")
      .select("id, name, event_date")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as Countdown[]) ?? []));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {items.map((c) => (
        <div key={c.id} className="w-full sm:w-[calc(50%-0.375rem)] max-w-xl">
          <CountdownCard c={c} />
        </div>
      ))}
    </div>
  );
}
