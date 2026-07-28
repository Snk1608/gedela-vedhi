import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { HeartHandshake, IndianRupee, TrendingDown, Wallet, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/events/$slug")({
  component: EventPage,
});

const schema = z.object({
  donor_name: z.string().trim().min(2).max(100),
  amount: z.coerce.number().positive().max(10000000),
  payment_method: z.enum(["PhonePe", "Google Pay", "Paytm", "Cash", "Bank Transfer", "UPI", "Other"]),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone"),
  email: z.string().trim().email().max(255),
  transaction_id: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

interface EventRow { id: string; name: string; slug: string; description: string | null; banner_url: string | null; event_date: string | null; }
interface Donation { id: string; donor_name: string; amount: number; payment_method: string; created_at: string; }

function EventPage() {
  const { t, lang } = useLanguage();
  const { slug } = Route.useParams();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalDon, setTotalDon] = useState(0);
  const [totalExp, setTotalExp] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    donor_name: "", amount: "", payment_method: "PhonePe",
    phone: "", email: "", transaction_id: "", message: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: ev } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
      setEvent(ev);
      if (ev) {
        const { data: ds } = await (supabase as any)
          .from("donations_public")
          .select("id, donor_name, amount, payment_method, created_at")
          .eq("event_tag", slug)
          .order("created_at", { ascending: false });
        setDonations((ds as any) ?? []);
        setTotalDon(((ds as any[]) ?? []).reduce((s: number, d: any) => s + Number(d.amount), 0));
        const { data: ex } = await supabase.from("expenses").select("amount").eq("event_tag", slug);
        setTotalExp((ex ?? []).reduce((s, e) => s + Number(e.amount), 0));
      }
      setLoading(false);
    })();
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const { error } = await supabase.from("donations").insert({
      donor_name: parsed.data.donor_name,
      amount: parsed.data.amount,
      payment_method: parsed.data.payment_method,
      phone: parsed.data.phone,
      email: parsed.data.email,
      transaction_id: parsed.data.transaction_id || null,
      message: parsed.data.message || null,
      status: "pending",
      event_tag: slug,
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t("donationThanks"));
      setForm({ donor_name: "", amount: "", payment_method: "PhonePe", phone: "", email: "", transaction_id: "", message: "" });
    }
  };

  const locale = lang === "te" ? "te-IN" : "en-IN";

  if (loading) return <div className="p-12 text-center text-muted-foreground">{t("loading")}</div>;
  if (!event) return (
    <div className="p-12 text-center">
      <h2 className="font-display text-2xl">{t("eventNotFound")}</h2>
      <p className="text-muted-foreground mt-2">"{slug}"</p>
    </div>
  );

  const balance = totalDon - totalExp;

  return (
    <div>
      <section className="bg-hero-gradient py-12">
        <div className="mx-auto max-w-5xl px-4 text-center animate-fade-in">
          <p className="text-vermillion uppercase tracking-widest text-xs font-semibold mb-2">{t("eventKicker")}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{event.name}</h1>
          {event.description && <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{event.description}</p>}
          {event.event_date && <p className="mt-2 text-sm text-muted-foreground">{new Date(event.event_date).toLocaleDateString(locale, { dateStyle: "long" })}</p>}
        </div>
      </section>

      {event.banner_url && (
        <section className="mx-auto max-w-7xl px-4 pt-6">
          <img src={event.banner_url} alt={event.name} className="w-full max-h-[400px] object-cover rounded-2xl shadow-festive" />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 grid gap-4 md:grid-cols-3 py-8">
        <Stat icon={HeartHandshake} label={t("totalDonations")} value={inr(totalDon)} accent="bg-leaf" />
        <Stat icon={TrendingDown} label={t("totalExpenses")} value={inr(totalExp)} accent="bg-vermillion" />
        <Stat icon={Wallet} label={t("balance")} value={inr(balance)} accent="bg-festive-gradient" />
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <Card className="border-2 border-primary/30 shadow-festive">
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-display text-2xl sm:text-3xl mb-1 flex items-center gap-2">
              <HeartHandshake className="h-6 w-6 text-vermillion" /> {t("donationConfirmation")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{t("donationFormHelp")}</p>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>{t("formName")} *</Label><Input value={form.donor_name} onChange={e => setForm({ ...form, donor_name: e.target.value })} required /></div>
              <div><Label>{t("formAmount")} *</Label><Input type="number" min={1} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
              <div>
                <Label>{t("formPaymentMethod")} *</Label>
                <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["PhonePe","Google Pay","Paytm","Cash","Bank Transfer","UPI","Other"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t("formPhone")} *</Label><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
              <div><Label>{t("formEmail")} *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="sm:col-span-2"><Label>{t("formTransactionId")}</Label><Input value={form.transaction_id} onChange={e => setForm({ ...form, transaction_id: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label>{t("formMessage")}</Label><Textarea rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting} size="lg" className="w-full bg-donate-gradient text-primary-foreground hover:opacity-90">
                  {submitting ? t("submitting") : t("submitDonation")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-2xl sm:text-3xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-leaf" /> {t("ourDonors")}
          </h3>
          <span className="text-sm text-muted-foreground">{donations.length} {t("approved")}</span>
        </div>
        {donations.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-10 text-center text-muted-foreground">{t("noDonations")}</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {donations.map((d, i) => (
              <Card key={d.id} className="hover-lift border-l-4 border-l-leaf animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{d.donor_name}</div>
                      <div className="text-xs text-muted-foreground">{d.payment_method}</div>
                    </div>
                    <div className="font-display text-xl text-vermillion flex items-center"><IndianRupee className="h-4 w-4" />{Number(d.amount).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{new Date(d.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string; }) {
  return (
    <Card className="hover-lift border-2 border-border/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`p-5 text-primary-foreground ${accent}`}><Icon className="h-8 w-8" /></div>
          <div className="px-5 py-4 flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="font-display text-2xl">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
