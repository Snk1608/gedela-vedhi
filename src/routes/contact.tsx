import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/use-language";
import { WhatsAppChatButton, WhatsAppGroupButton } from "@/components/WhatsAppFloat";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — Gedela Vedhi Youth" },
      { name: "description", content: "Get in touch with Gedela Vedhi Youth community team." },
    ],
  }),
});

interface ContactInfo {
  address: string | null; phone: string | null; email: string | null;
  instagram: string | null; maps_url: string | null;
}

function Contact() {
  const { t } = useLanguage();
  const [info, setInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    supabase.from("contact_settings").select("address, phone, email, instagram, maps_url")
      .limit(1).maybeSingle().then(({ data }) => setInfo(data as ContactInfo | null));
  }, []);

  const instaHandle = (info?.instagram ?? "").replace(/^@/, "");
  const cards = [
    info?.address && {
      icon: MapPin, title: t("contactAddress"),
      body: <span className="whitespace-pre-line">{info.address}</span>,
      cta: info.maps_url ? { label: t("contactOpenMaps"), href: info.maps_url } : null,
    },
    info?.phone && {
      icon: Phone, title: t("contactPhone"),
      body: <a href={`tel:${info.phone.replace(/\s/g, "")}`} className="hover:underline">{info.phone}</a>,
      cta: { label: t("contactCall"), href: `tel:${info.phone.replace(/\s/g, "")}` },
    },
    info?.email && {
      icon: Mail, title: t("contactEmail"),
      body: <a href={`mailto:${info.email}`} className="hover:underline break-all">{info.email}</a>,
      cta: { label: t("contactSendEmail"), href: `mailto:${info.email}` },
    },
    instaHandle && {
      icon: Instagram, title: t("contactInstagram"),
      body: <a href={`https://instagram.com/${instaHandle}`} target="_blank" rel="noopener noreferrer" className="hover:underline">@{instaHandle}</a>,
      cta: { label: t("contactFollow"), href: `https://instagram.com/${instaHandle}` },
    },
  ].filter(Boolean) as Array<{ icon: any; title: string; body: React.ReactNode; cta: { label: string; href: string } | null }>;

  return (
    <div>
      <section className="bg-hero-gradient py-12">
        <div className="mx-auto max-w-4xl px-4 text-center animate-fade-in">
          <p className="text-vermillion uppercase tracking-widest text-xs font-semibold mb-2">{t("contactKicker")}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{t("contactTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("contactSubtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 grid gap-6 md:grid-cols-2">
        {cards.map((c, i) => (
          <Card key={i} className="hover-lift border-2 border-border/50 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-festive-gradient text-primary-foreground mb-3 shadow-soft">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl mb-1">{c.title}</h3>
              <div className="text-muted-foreground">{c.body}</div>
              {c.cta && (
                <a href={c.cta.href} target={c.cta.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="mt-4">{c.cta.label}</Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <Card className="border-2 border-[#25D366]/40 overflow-hidden animate-fade-in">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between bg-gradient-to-br from-[#25D366]/10 via-transparent to-[#128C7E]/10">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full text-white shrink-0 shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}>
                <MessageCircle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl mb-1">WhatsApp</h3>
                <p className="text-muted-foreground text-sm mb-1">
                  <a href="https://wa.me/919121077054" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
                    +91 9121077054
                  </a>
                </p>
                <p className="text-xs text-muted-foreground">Chat with us anytime — we usually reply within a few hours.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <WhatsAppChatButton size="md" label="Chat Now" />
              <WhatsAppGroupButton size="md" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
