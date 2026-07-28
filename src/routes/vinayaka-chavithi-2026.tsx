import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import {
  HeartHandshake, IndianRupee, TrendingDown, Wallet, Building2, Smartphone, CheckCircle2,
  Copy, Download, Share2, AlertTriangle, ExternalLink, QrCode, Phone,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/vinayaka-chavithi-2026")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Vinayaka Chavithi 2026 — Donations" },
      { name: "description", content: "Donate towards Vinayaka Chavithi 2026 celebrations. View donations, expenses and our donor list." },
    ],
  }),
});

const EVENT = "vinayaka_chavithi_2026";

const schema = z.object({
  donor_name: z.string().trim().min(2, "Name is required").max(100),
  amount: z.coerce.number().positive("Amount must be positive").max(10000000),
  payment_method: z.enum(["PhonePe", "Google Pay", "Paytm", "Cash", "Bank Transfer", "UPI", "Other"]),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().max(255).optional().or(z.literal("")),
  transaction_id: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  payment_method: string;
  created_at: string;
}

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  spent_on: string;
}

interface PaySettings {
  bank_name: string | null; account_number: string | null; account_holder: string | null;
  ifsc: string | null; upi_id: string | null; phonepe_number: string | null;
  qr_image_url: string | null; notes: string | null;
}

function Page() {
  const { t } = useLanguage();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [pay, setPay] = useState<PaySettings | null>(null);
  const [bg, setBg] = useState<{ url: string | null; opacity: number }>({ url: null, opacity: 0.3 });
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => {
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
  };
  const [form, setForm] = useState({
    donor_name: "", amount: "", payment_method: "PhonePe",
    phone: "", email: "", transaction_id: "", message: "",
  });

  const load = async () => {
    const { data: ps } = await (supabase as any).from("payment_settings_public").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
    setPay(ps as any);
    const { data: ds } = await (supabase as any)
      .from("donations_public")
      .select("id, donor_name, amount, payment_method, created_at")
      .eq("event_tag", EVENT)
      .order("created_at", { ascending: false });
    setDonations((ds as any) ?? []);
    setTotalDonations(((ds as any[]) ?? []).reduce((s: number, d: any) => s + Number(d.amount), 0));

    const { data: ex } = await supabase
      .from("expenses")
      .select("id, title, amount, category, spent_on")
      .eq("event_tag", EVENT)
      .order("spent_on", { ascending: false });
    setExpenses((ex ?? []) as Expense[]);
    setTotalExpenses((ex ?? []).reduce((s, e) => s + Number(e.amount), 0));

    const { data: ev } = await (supabase as any)
      .from("events")
      .select("bg_image_url, bg_opacity")
      .eq("slug", EVENT)
      .maybeSingle();
    if (ev) setBg({ url: ev.bg_image_url, opacity: Number(ev.bg_opacity ?? 0.3) });
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("donations").insert({
      donor_name: parsed.data.donor_name,
      amount: parsed.data.amount,
      payment_method: parsed.data.payment_method,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      transaction_id: parsed.data.transaction_id || null,
      message: parsed.data.message || null,
      status: "pending",
      event_tag: EVENT,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("donationThanks"));
      setForm({
        donor_name: "", amount: "", payment_method: "PhonePe",
        phone: "", email: "", transaction_id: "", message: "",
      });
    }
  };

  const balance = totalDonations - totalExpenses;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-hero-gradient py-12 overflow-hidden">
        {bg.url && (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${bg.url})`, opacity: bg.opacity }}
          />
        )}
        <div className="relative mx-auto max-w-5xl px-4 text-center animate-fade-in">
          <p className="text-vermillion uppercase tracking-widest text-xs font-semibold mb-2">{t("vinayakaKicker")}</p>
          <h1 className="font-display text-4xl sm:text-5xl">{t("vinayaka")}</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t("vinayakaIntro")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 -mt-2 grid gap-4 md:grid-cols-3 py-8">
        <StatCard icon={HeartHandshake} label={t("totalDonations")} value={inr(totalDonations)} accent="bg-leaf" />
        <StatCard icon={TrendingDown} label={t("totalExpenses")} value={inr(totalExpenses)} accent="bg-vermillion" />
        <StatCard icon={Wallet} label={t("remainingBalance")} value={inr(balance)} accent="bg-festive-gradient" />
      </section>

      {/* Payment details */}
      <section className="mx-auto max-w-7xl px-4 grid gap-6 lg:grid-cols-2 py-6">
        {/* Premium QR / UPI card */}
        <Card className="relative overflow-hidden border-2 border-leaf/40 backdrop-blur-xl bg-card/70 shadow-festive hover-lift">
          <div className="absolute inset-0 bg-gradient-to-br from-leaf/10 via-transparent to-vermillion/10 pointer-events-none" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display text-2xl flex items-center gap-2">
                <QrCode className="h-6 w-6 text-leaf" /> {t("phonepeUpi")}
              </h3>
              {pay?.qr_image_url && (
                <QrActions qrUrl={pay.qr_image_url} upiId={pay.upi_id || ""} />
              )}
            </div>

            {pay?.qr_image_url && (
              <div className="flex flex-col items-center animate-fade-in">
                <div className="relative p-3 rounded-2xl bg-white shadow-lg border-2 border-leaf/30">
                  <img src={pay.qr_image_url} alt="UPI QR Code" className="h-52 w-52 object-contain" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t("scanToPay")}</p>
              </div>
            )}

            <div className="mt-5 space-y-2 text-sm">
              {pay?.upi_id && <Row label={t("upiId")} value={pay.upi_id} copy />}
              {pay?.phonepe_number && <Row label={t("phonepeNumber")} value={pay.phonepe_number} copy />}
            </div>

            <InAppOrUpi
              pay={pay}
              scrollToForm={scrollToForm}
              labels={{
                note: t("upiNote"),
                phonepe: t("payWithPhonePe"),
                gpay: t("payWithGooglePay"),
                paytm: t("payWithPaytm"),
              }}
            />

            <p className="text-xs text-muted-foreground pt-3">{t("afterPaying")}</p>
          </CardContent>
        </Card>

        {/* Bank details */}
        <Card className="relative overflow-hidden border-2 border-primary/30 backdrop-blur-xl bg-card/70 hover-lift">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-leaf/10 pointer-events-none" />
          <CardContent className="relative p-6">
            <h3 className="font-display text-2xl mb-4 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" /> {t("bankTransfer")}
            </h3>
            <div className="space-y-2 text-sm">
              {pay?.bank_name && <Row label={t("bankName")} value={pay.bank_name} />}
              {pay?.account_number && <Row label={t("accountNumber")} value={pay.account_number} copy />}
              {pay?.ifsc && <Row label={t("ifsc")} value={pay.ifsc} copy />}
              {pay?.account_holder && <Row label={t("accountHolder")} value={pay.account_holder} />}
            </div>
          </CardContent>
        </Card>
      </section>


      {/* Donation form */}
      <section ref={formRef} className="mx-auto max-w-3xl px-4 py-10">
        <Card className="border-2 border-primary/30 shadow-festive">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-5 rounded-lg border border-leaf/40 bg-leaf/5 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-leaf shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80">
                <strong>Payment completed?</strong> Please submit the donation confirmation form below.
                Your donation will appear publicly only after admin verification.
              </p>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl mb-1 flex items-center gap-2">
              <HeartHandshake className="h-6 w-6 text-vermillion" /> {t("donationConfirmation")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t("donationFormHelp")}
            </p>

            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="dn">{t("formName")} *</Label>
                <Input id="dn" value={form.donor_name} onChange={(e) => setForm({ ...form, donor_name: e.target.value })} required maxLength={100} />
              </div>
              <div>
                <Label htmlFor="am">{t("formAmount")} *</Label>
                <Input id="am" type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="pm">{t("formPaymentMethod")} *</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger id="pm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PhonePe">PhonePe</SelectItem>
                    <SelectItem value="Google Pay">Google Pay</SelectItem>
                    <SelectItem value="Paytm">Paytm</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ph">{t("formPhoneOptional")}</Label>
                <Input id="ph" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />
              </div>
              <div>
                <Label htmlFor="em">{t("formEmailOptional")}</Label>
                <Input id="em" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="tx">{t("formTransactionId")}</Label>
                <Input id="tx" value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} maxLength={120} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="msg">{t("formMessage")}</Label>
                <Textarea id="msg" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={500} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting} size="lg" className="w-full bg-donate-gradient text-primary-foreground hover:opacity-90">
                  {submitting ? t("submitting") : t("submitDonation")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Public donor list — table */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-2xl sm:text-3xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-leaf" /> Our Donors
          </h3>
          <span className="text-sm text-muted-foreground">{donations.length} approved</span>
        </div>
        {donations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center text-muted-foreground">
              No donations yet. Be the first to contribute!
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-2 border-leaf/30">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-leaf/10 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-12">#</th>
                    <th className="px-4 py-3 font-semibold">Donor Name</th>
                    <th className="px-4 py-3 font-semibold">Payment Method</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d, i) => (
                    <tr key={d.id} className="border-t border-border/50 hover:bg-muted/40">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{d.donor_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.payment_method}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-vermillion">
                        <span className="inline-flex items-center justify-end">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {Number(d.amount).toLocaleString("en-IN")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-leaf/5">
                  <tr className="border-t-2 border-leaf/30">
                    <td colSpan={4} className="px-4 py-3 font-semibold text-right">Total Donations</td>
                    <td className="px-4 py-3 text-right font-display text-lg text-leaf">{inr(totalDonations)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Public expenses list — table */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-2xl sm:text-3xl flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-vermillion" /> Expenses
          </h3>
          <span className="text-sm text-muted-foreground">{expenses.length} entries</span>
        </div>
        {expenses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center text-muted-foreground">
              No expenses recorded yet.
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-2 border-vermillion/30">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-vermillion/10 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-12">#</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e, i) => (
                    <tr key={e.id} className="border-t border-border/50 hover:bg-muted/40">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{e.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.category ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(e.spent_on).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-vermillion">
                        <span className="inline-flex items-center justify-end">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {Number(e.amount).toLocaleString("en-IN")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-vermillion/5">
                  <tr className="border-t-2 border-vermillion/30">
                    <td colSpan={4} className="px-4 py-3 font-semibold text-right">Total Expenses</td>
                    <td className="px-4 py-3 text-right font-display text-lg text-vermillion">{inr(totalExpenses)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string; }) {
  return (
    <Card className="hover-lift border-2 border-border/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`p-5 text-primary-foreground ${accent}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div className="px-5 py-4 flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="font-display text-2xl">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        {copy && (
          <button
            onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied!"); }}
            className="text-xs text-primary hover:underline"
          >Copy</button>
        )}
      </div>
    </div>
  );
}

function detectInAppBrowser() {
  if (typeof navigator === "undefined") return { inApp: false, name: "" };
  const ua = navigator.userAgent || "";
  if (/Instagram/i.test(ua)) return { inApp: true, name: "Instagram" };
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return { inApp: true, name: "Facebook" };
  if (/Messenger/i.test(ua)) return { inApp: true, name: "Messenger" };
  if (/Line\//i.test(ua)) return { inApp: true, name: "LINE" };
  if (/Twitter/i.test(ua)) return { inApp: true, name: "Twitter" };
  if (/; wv\)/i.test(ua)) return { inApp: true, name: "In-app browser" };
  return { inApp: false, name: "" };
}

function QrActions({ qrUrl, upiId }: { qrUrl: string; upiId: string }) {
  const download = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(qrUrl, { mode: "cors", cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gedela-vedhi-upi-qr.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("QR downloaded");
    } catch {
      // Fallback: open in new tab so user can long-press / right-click to save
      window.open(qrUrl, "_blank", "noopener,noreferrer");
      toast.message("Long-press the image to save it");
    }
  };
  const share = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const file = new File([blob], "gedela-vedhi-upi-qr.png", { type: blob.type || "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Gedela Vedhi UPI", text: `Pay to ${upiId}` });
        return;
      }
      await navigator.share?.({ title: "Gedela Vedhi UPI", text: `Pay via UPI: ${upiId}`, url: qrUrl });
    } catch {
      /* user cancelled */
    }
  };
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={download}
        aria-label="Download QR"
        className="h-8 w-8 rounded-full bg-leaf/15 hover:bg-leaf/25 text-leaf flex items-center justify-center transition-all hover:scale-110 border border-leaf/30"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={share}
        aria-label="Share QR"
        className="h-8 w-8 rounded-full bg-primary/15 hover:bg-primary/25 text-primary flex items-center justify-center transition-all hover:scale-110 border border-primary/30"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function InAppOrUpi({
  pay,
  scrollToForm,
  labels,
}: {
  pay: PaySettings | null;
  scrollToForm: () => void;
  labels: { note: string; phonepe: string; gpay: string; paytm: string };
}) {
  const [amount, setAmount] = useState("");
  const [inApp, setInApp] = useState<{ inApp: boolean; name: string }>({ inApp: false, name: "" });

  useEffect(() => { setInApp(detectInAppBrowser()); }, []);

  const upiId = pay?.upi_id || "";
  const payeeName = pay?.account_holder || "Gedela Vedhi Boyzz";

  const buildParams = () => {
    const params = new URLSearchParams({
      pa: upiId, pn: payeeName, cu: "INR", tn: "Donation",
    });
    const amt = Number(amount);
    if (amt > 0) params.set("am", amt.toFixed(2));
    return params.toString();
  };

  const isAndroid = () => /android/i.test(navigator.userAgent);
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

  const openApp = (app: "phonepe" | "gpay" | "paytm", appName: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!upiId) { toast.error("UPI not configured"); return; }
    const query = buildParams();
    const genericUpi = `upi://pay?${query}`;

    if (!isAndroid() && !isIOS()) {
      toast.message("Scan the QR with your phone", { description: "UPI apps run on mobile devices." });
      scrollToForm();
      return;
    }

    if (isAndroid()) {
      const pkg = app === "phonepe" ? "com.phonepe.app"
        : app === "gpay" ? "com.google.android.apps.nbu.paisa.user"
        : "net.one97.paytm";
      const intentUrl = `intent://pay?${query}#Intent;scheme=upi;package=${pkg};end`;
      window.location.href = intentUrl;
      toast.message(`Opening ${appName}…`);
      scrollToForm();
      return;
    }

    const iosScheme = app === "phonepe" ? `phonepe://pay?${query}`
      : app === "gpay" ? `gpay://upi/pay?${query}`
      : `paytmmp://pay?${query}`;
    let didHide = false;
    const onHide = () => { didHide = true; };
    document.addEventListener("visibilitychange", onHide, { once: true });
    window.location.href = iosScheme;
    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onHide);
      if (!didHide) window.location.href = genericUpi;
    }, 1500);
    toast.message(`Opening ${appName}…`);
    scrollToForm();
  };

  const copy = async (val: string, label: string) => {
    try { await navigator.clipboard.writeText(val); toast.success(`${label} copied`); }
    catch { toast.error("Copy failed"); }
  };

  const openInBrowser = () => {
    const url = window.location.href;
    if (isAndroid()) {
      window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    copy(url, "Page link");
    toast.message("Open this link in Chrome or Safari");
  };

  if (inApp.inApp) {
    return (
      <div className="mt-5 pt-4 border-t border-border/50 space-y-3 animate-fade-in">
        <div className="rounded-xl border-2 border-vermillion/40 bg-vermillion/10 backdrop-blur-md p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-vermillion shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-vermillion">Opened inside {inApp.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              For the best and most secure payment experience, please open this page in Chrome or your device's default browser.
            </p>
            <button
              type="button"
              onClick={openInBrowser}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-vermillion hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in Browser
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {upiId && (
            <button
              type="button"
              onClick={() => copy(upiId, "UPI ID")}
              className="rounded-md bg-leaf/10 hover:bg-leaf/20 text-leaf font-medium text-xs py-2.5 px-2 transition-all border border-leaf/30 inline-flex items-center justify-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> Copy UPI ID
            </button>
          )}
          {pay?.phonepe_number && (
            <button
              type="button"
              onClick={() => copy(pay.phonepe_number!, "Phone number")}
              className="rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs py-2.5 px-2 transition-all border border-primary/30 inline-flex items-center justify-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5" /> Copy Phone
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Scan the QR above with any UPI app, or copy the UPI ID and paste it in PhonePe / Google Pay / Paytm.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 pt-4 border-t border-border/50 space-y-3">
      <p className="text-xs text-muted-foreground">{labels.note}</p>
      <div>
        <Label htmlFor="upi-amount" className="text-xs">Amount (₹)</Label>
        <Input
          id="upi-amount"
          type="number"
          inputMode="decimal"
          min="1"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 h-10"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={openApp("phonepe", "PhonePe")}
          className="group text-center rounded-lg bg-gradient-to-br from-[#5f259f]/15 to-[#5f259f]/5 hover:from-[#5f259f]/25 hover:to-[#5f259f]/10 text-[#5f259f] font-semibold text-xs py-2.5 px-1 transition-all border border-[#5f259f]/30 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          {labels.phonepe}
        </button>
        <button
          type="button"
          onClick={openApp("gpay", "Google Pay")}
          className="group text-center rounded-lg bg-gradient-to-br from-leaf/15 to-leaf/5 hover:from-leaf/25 hover:to-leaf/10 text-leaf font-semibold text-xs py-2.5 px-1 transition-all border border-leaf/30 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          {labels.gpay}
        </button>
        <button
          type="button"
          onClick={openApp("paytm", "Paytm")}
          className="group text-center rounded-lg bg-gradient-to-br from-[#00baf2]/15 to-[#00baf2]/5 hover:from-[#00baf2]/25 hover:to-[#00baf2]/10 text-[#00baf2] font-semibold text-xs py-2.5 px-1 transition-all border border-[#00baf2]/30 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          {labels.paytm}
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Paying to: <span className="font-medium">{upiId || "—"}</span>
      </p>
    </div>
  );
}


