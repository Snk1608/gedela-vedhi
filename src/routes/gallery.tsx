import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, ImageIcon, Play } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/gallery")({
  component: Gallery,
  head: () => ({
    meta: [
      { title: "Gallery — Gedela Vedhi Youth" },
      { name: "description", content: "Photo gallery of Vinayaka Chavithi, Sankranthi, birthdays and events." },
    ],
  }),
});

interface Cat {
  id: string;
  name: string;
  slug: string;
}
interface Img {
  id: string;
  category_id: string;
  image_url: string;
  caption: string | null;
  media_type?: string;
}

function Gallery() {
  const { t } = useLanguage();
  const [cats, setCats] = useState<Cat[]>([]);
  const [imgs, setImgs] = useState<Img[]>([]);
  const [open, setOpen] = useState<Img | null>(null);

  useEffect(() => {
    supabase
      .from("gallery_categories")
      .select("id, name, slug")
      .order("sort_order")
      .then(({ data }) => setCats(data ?? []));
    supabase
      .from("gallery_images")
      .select("id, category_id, image_url, caption, media_type")
      .order("sort_order")
      .then(({ data }) => setImgs(data ?? []));
  }, []);

  const download = async (img: Img) => {
    try {
      const res = await fetch(img.image_url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (img.caption || "gvb-photo") + ".jpg";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(img.image_url, "_blank");
    }
  };

  return (
    <div>
      <section className="bg-hero-gradient py-12">
        <div className="mx-auto max-w-7xl px-4 text-center animate-fade-in">
          <p className="text-vermillion uppercase tracking-widest text-xs font-semibold mb-2">{t("galleryKicker")}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{t("galleryTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("gallerySubtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 space-y-4">
        {cats.length === 0 && (
          <p className="text-center text-muted-foreground py-12">{t("galleryLoading")}</p>
        )}
        {cats.map((cat) => {
          const catImgs = imgs.filter((i) => i.category_id === cat.id);
          return (
            <Collapsible key={cat.id} defaultOpen={catImgs.length > 0} className="rounded-2xl border-2 border-border/50 bg-card shadow-card overflow-hidden">
              <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div className="text-left">
                    <h3 className="font-display text-xl">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{catImgs.length} {catImgs.length === 1 ? t("photoOne") : t("photoMany")}</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-5 pb-5">
                  {catImgs.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
                      <ImageIcon className="h-10 w-10 opacity-50" />
                      <p className="text-sm">{t("galleryEmpty")}</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {catImgs.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => setOpen(img)}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-border/50 hover-lift bg-black"
                        >
                          {img.media_type === "video" ? (
                            <>
                              <video
                                src={img.image_url}
                                muted
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="h-10 w-10 text-white drop-shadow-lg" fill="currentColor" />
                              </span>
                            </>
                          ) : (
                            <img
                              src={img.image_url}
                              alt={img.caption ?? cat.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </section>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black border-none">
          {open && (
            <div className="relative">
              {open.media_type === "video" ? (
                <video src={open.image_url} controls autoPlay className="w-full max-h-[85vh] object-contain bg-black" />
              ) : (
                <img src={open.image_url} alt={open.caption ?? ""} className="w-full max-h-[85vh] object-contain" />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between pointer-events-none">
                <p className="text-white text-sm">{open.caption ?? ""}</p>
                <Button size="sm" variant="secondary" onClick={() => download(open)} className="pointer-events-auto">
                  <Download className="h-4 w-4 mr-1" /> {t("download")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
