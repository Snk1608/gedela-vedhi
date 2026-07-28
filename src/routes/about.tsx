import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Sparkles, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About Us — Gedela Vedhi Youth" },
      { name: "description", content: "About Gedela Vedhi Youth — a youth community from Gajarayuni Valasa, Andhra Pradesh." },
    ],
  }),
});

function About() {
  const { t } = useLanguage();
  const cards = [
    { icon: Users, title: t("aboutCommunityTitle"), text: t("aboutCommunityText") },
    { icon: Heart, title: t("aboutTraditionTitle"), text: t("aboutTraditionText") },
    { icon: Sparkles, title: t("aboutJoyTitle"), text: t("aboutJoyText") },
  ];
  return (
    <div>
      <section className="bg-hero-gradient py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center animate-fade-in">
          <p className="text-vermillion uppercase tracking-widest text-xs font-semibold mb-2">{t("aboutKicker")}</p>
          <h1 className="font-display text-4xl sm:text-5xl mb-4">{t("aboutTitle")}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{t("aboutIntro")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 grid gap-6 md:grid-cols-3">
        {cards.map((c, i) => (
          <Card key={i} className="hover-lift border-2 border-border/50 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-festive-gradient text-primary-foreground shadow-soft">
                <c.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <Card className="border-2 border-primary/30 shadow-soft">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <MapPin className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-display text-2xl mb-2">{t("aboutVillageTitle")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t("aboutVillageText")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
