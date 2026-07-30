import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CountdownList } from "@/components/CountdownList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import {
  Calendar,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  CalendarDays,
  Play,
} from "lucide-react";
import { SuggestionForm } from "@/components/SuggestionForm";
import { WhatsAppGroupButton } from "@/components/WhatsAppFloat";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Home — Gedela Vedhi Youth" },
      { name: "description", content: "Welcome to Gedela Vedhi Youth — community, festivals, and Vinayaka Chavithi 2026 donations." },
    ],
  }),
});

interface Section {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  category: string;
}

interface Reel {
  id: string;
  title: string;
  thumbnail_url: string;
  instagram_url: string;
}

interface EventRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  event_date: string | null;
}

const FALLBACK: Section[] = [
  {
    id: "f1",
    title: "Vinayaka Chavithi 2026",
    description: "Join us in celebrating Lord Ganesha. Donate, participate and be part of the festivities.",
    image_url: "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e2c2?w=800&q=80&auto=format&fit=crop",
    link_url: "/vinayaka-chavithi-2026",
    category: "festival",
  },
  {
    id: "f2",
    title: "Birthdays",
    description: "Celebrating every member of our beloved community.",
    image_url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=80&auto=format&fit=crop",
    link_url: "/gallery",
    category: "birthday",
  },
  {
    id: "f3",
    title: "Festivals & Events",
    description: "Sankranthi, Diwali, Ugadi — every occasion is a moment of togetherness.",
    image_url: "https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800&q=80&auto=format&fit=crop",
    link_url: "/gallery",
    category: "event",
  },
];

function Home() {
  const { t } = useLanguage();
  const [sections, setSections] = useState<Section[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);

  useEffect(() => {
    supabase
      .from("event_sections")
      .select("id, title, description, image_url, link_url, category")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setSections(data ?? []));

    supabase
      .from("events")
      .select("id, name, slug, description, banner_url, event_date")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setEvents(data ?? []));
    supabase
      .from("instagram_reels")
      .select("id,title,thumbnail_url,instagram_url")
      .order("created_at", { ascending: false })
      .then(({ data }) => setReels(data ?? []));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
          <div className="mb-8 text-center animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-vermillion font-semibold mb-2">
              {t("welcome")}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground mb-3">
              Gedela Vedhi Youth
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
              {t("heroSubtitle")}
            </p>
          </div>
          <HeroCarousel />
          <CountdownList />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/vinayaka-chavithi-2026">
              <Button size="lg" className="bg-donate-gradient text-primary-foreground hover:opacity-90 shadow-festive">
                <HeartHandshake className="mr-2 h-5 w-5" /> {t("donateBtn")}
              </Button>
            </Link>
            <Link to="/gallery">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                {t("exploreGallery")}
              </Button>
            </Link>
            <WhatsAppGroupButton size="lg" />
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="text-center mb-10">
          <p className="text-vermillion uppercase tracking-widest text-xs font-semibold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> {t("ourHighlights")}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl">{t("eventsCelebrations")}</h2>
        </div>

        <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {sections.map((s, i) => (
            <Card
              key={s.id}
              className="group overflow-hidden hover-lift bg-card border-2 border-border/50 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {s.image_url && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={s.image_url}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              )}
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-leaf font-semibold mb-1">
                  {s.category}
                </div>
                <h3 className="font-display text-xl mb-2">{s.title}</h3>
                {s.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                )}
                {s.link_url && (
                  <Link
                    to={s.link_url.startsWith("/") ? (s.link_url as "/") : "/"}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
                  >
                    {t("learnMore")} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Event CTAs (ordered by priority) */}
      {events.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 space-y-6">
          {events.map((ev, i) => {
            const linkTo = ev.slug === "vinayaka_chavithi_2026" ? "/vinayaka-chavithi-2026" : `/events/${ev.slug}`;
            return (
              <div
                key={ev.id}
                className="rounded-3xl bg-festive-gradient text-primary-foreground p-8 sm:p-12 shadow-festive relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute -right-12 -top-12 text-9xl opacity-10 animate-float">🪔</div>
                <div className="relative z-10 max-w-2xl">
                  <Calendar className="h-8 w-8 mb-3" />
                  <h2 className="font-display text-3xl sm:text-4xl mb-3">{ev.name}</h2>
                  {ev.event_date && (
                    <div className="text-sm opacity-90 flex items-center gap-1 mb-2">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(ev.event_date).toLocaleDateString("en-IN", { dateStyle: "long" })}
                    </div>
                  )}
                  <p className="text-base sm:text-lg opacity-95 mb-5">
                    {ev.description || t("ctaText")}
                  </p>
                  <Link to={linkTo as "/"}>
                    <Button size="lg" variant="secondary" className="font-semibold">
                      {t("donateNow")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      )}
      {reels.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl">
              Instagram Reels
            </h2>

            <p className="text-muted-foreground">
              Watch our latest celebrations and community moments.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reels.map((reel) => (
              <Card
                key={reel.id}
                className="group overflow-hidden rounded-3xl border-0 shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 bg-white"
              >
                <a
                  href={reel.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={reel.thumbnail_url}
                      alt={reel.title}
                      className="w-full aspect-[9/16] object-cover transition duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-white/90 rounded-full p-4">
                        <Play className="w-8 h-8 text-black fill-black" />
                      </div>
                    </div>
                  </div>
                </a>

                <CardContent className="p-4 space-y-3">

                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                      className="w-5 h-5"
                      alt="Instagram"
                    />
                    <span className="text-xs text-gray-500">
                      Instagram Reel
                    </span>
                  </div>

                  <h3 className="font-bold text-base line-clamp-1">
                    {reel.title}
                  </h3>

                  <Button
                    asChild
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white"
                  >
                    <a
                      href={reel.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ▶ Watch on Instagram
                    </a>
                  </Button>

                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      <SuggestionForm />
    </div>
  );
}
