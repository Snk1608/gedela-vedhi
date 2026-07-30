import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Cake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Slide {
  id: string;
  image_url: string;
  caption: string | null;
  isBirthday?: boolean;
}

const FALLBACK: Slide[] = [
  {
    id: "f1",
    image_url:
      "https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=1600&q=80&auto=format&fit=crop",
    caption: "Welcome to our community",
  },
  {
    id: "f2",
    image_url:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d1e2c2?w=1600&q=80&auto=format&fit=crop",
    caption: "Vinayaka Chavithi celebrations",
  },
];

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data: sliderData }, { data: friendsData }] = await Promise.all([
        supabase
          .from("slider_images")
          .select("id, image_url, caption")
          .eq("active", true)
          .order("sort_order"),
        supabase
          .from("friends")
          .select("id, name, image_url, birthday, message")
          .eq("active", true),
      ]);

      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayMD = `${mm}-${dd}`;

      const birthdaySlides: Slide[] =
        (friendsData ?? [])
          .filter((f) => {
            const b = String(f.birthday); // "YYYY-MM-DD"
            return b.slice(5) === todayMD;
          })
          .map((f) => ({
            id: `bday-${f.id}`,
            image_url: f.image_url,
            caption: `🎂 Happy Birthday, ${f.name}!${f.message ? ` — ${f.message}` : ""}`,
            isBirthday: true,
          }));

      const merged = [...birthdaySlides, ...(sliderData ?? [])];
      setSlides(merged.length > 0 ? merged : FALLBACK);
    })();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[500px] sm:h-[650px] lg:h-[750px] w-full overflow-hidden rounded-2xl shadow-festive">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          {s.isBirthday ? (
            <a
              href={typeof window !== "undefined" ? window.location.origin : "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full w-full"
              aria-label="Open Gedela Vedhi Youth site"
            >
              <img
                src={s.image_url}
                alt={s.caption ?? "Slide"}
                className="h-full w-full object-cover transition-transform duration-[6000ms] scale-105"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </a>
          ) : (
            <img
              src={s.image_url}
              alt={s.caption ?? "Slide"}
              className="h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          {s.caption && (
            <div className="absolute bottom-8 left-6 right-6 sm:left-12 max-w-2xl text-white animate-fade-in">
              {s.isBirthday && (
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-vermillion/90 text-white text-xs uppercase tracking-wider">
                  <Cake className="h-3.5 w-3.5" /> Birthday Today
                </div>
              )}
              <h2 className="font-display text-3xl sm:text-5xl drop-shadow-lg">
                {s.caption}
              </h2>
            </div>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <>
         
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-8 bg-white" : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
