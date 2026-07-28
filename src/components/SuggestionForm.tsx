import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageSquarePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/use-language";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  suggestion: z.string().trim().min(1, "Suggestion is required").max(1000),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(20).regex(/^[0-9+\-\s()]*$/, "Invalid phone").optional().or(z.literal("")),
});

export function SuggestionForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", suggestion: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("suggestions").insert({
      name: parsed.data.name,
      suggestion: parsed.data.suggestion,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
    });
    setLoading(false);
    if (error) {
      toast.error(t("suggestionFailed"));
      return;
    }
    toast.success(t("suggestionThanks"));
    setForm({ name: "", suggestion: "", email: "", phone: "" });
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-festive-gradient text-primary-foreground mb-3 shadow-soft">
          <MessageSquarePlus className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl">{t("suggestionsTitle")}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t("suggestionsSubtitle")}</p>
      </div>
      <Card className="border-2 border-border/50">
        <CardContent className="p-6">
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                {t("formName")} <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("placeholderName")}
                maxLength={100}
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                {t("suggestionLabel")} <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={form.suggestion}
                onChange={(e) => setForm({ ...form, suggestion: e.target.value })}
                placeholder={t("placeholderSuggestion")}
                maxLength={1000}
                rows={4}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  {t("formEmail")} <span className="text-muted-foreground text-xs">{t("optional")}</span>
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t("placeholderEmail")}
                  maxLength={255}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  {t("mobile")} <span className="text-muted-foreground text-xs">{t("optional")}</span>
                </label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={t("placeholderPhone")}
                  maxLength={20}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? t("submitting") : t("submitSuggestion")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
