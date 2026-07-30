import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X, Trash2, Plus, Upload, Image as ImageIcon, IndianRupee, Wallet, TrendingDown, Save, ShieldCheck, Shield, ArrowUp, ArrowDown, Download } from "lucide-react";

/* ---------------- CSV export helper ---------------- */
function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) { toast.error("Nothing to export"); return; }
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function exportFinancials() {
  const [{ data: donations }, { data: expenses }] = await Promise.all([
    supabase.from("donations").select("created_at, donor_name, amount, payment_method, status, phone, email, transaction_id, event_tag, message").order("created_at", { ascending: false }),
    supabase.from("expenses").select("spent_on, title, amount, category, description, event_tag").order("spent_on", { ascending: false }),
  ]);
  const ts = new Date().toISOString().slice(0, 10);

  // 1. Separate donations file
  downloadCSV(`donations-${ts}.csv`, (donations ?? []).map((d: any) => ({
    date: new Date(d.created_at).toLocaleString("en-IN"),
    donor_name: d.donor_name,
    amount: d.amount,
    payment_method: d.payment_method,
    status: d.status,
    phone: d.phone ?? "",
    email: d.email ?? "",
    transaction_id: d.transaction_id ?? "",
    event_tag: d.event_tag,
    message: d.message ?? "",
  })));

  // 2. Separate expenses file
  downloadCSV(`expenses-${ts}.csv`, (expenses ?? []).map((e: any) => ({
    date: e.spent_on,
    title: e.title,
    amount: e.amount,
    category: e.category ?? "",
    description: e.description ?? "",
    event_tag: e.event_tag,
  })));

  // 3. Combined ledger (clearly labeled by type)
  const combined = [
    ...(donations ?? []).map((d: any) => ({
      type: "DONATION (IN)",
      date: new Date(d.created_at).toISOString().slice(0, 10),
      name_or_title: d.donor_name,
      amount_in: d.status === "approved" ? d.amount : 0,
      amount_out: 0,
      status: d.status,
      method_or_category: d.payment_method,
      event_tag: d.event_tag,
      notes: d.message ?? d.transaction_id ?? "",
    })),
    ...(expenses ?? []).map((e: any) => ({
      type: "EXPENSE (OUT)",
      date: e.spent_on,
      name_or_title: e.title,
      amount_in: 0,
      amount_out: e.amount,
      status: "-",
      method_or_category: e.category ?? "",
      event_tag: e.event_tag,
      notes: e.description ?? "",
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
  downloadCSV(`all-transactions-${ts}.csv`, combined);

  // 4. Summary
  const approved = (donations ?? []).filter((d: any) => d.status === "approved");
  const totalDon = approved.reduce((s: number, d: any) => s + Number(d.amount), 0);
  const totalExp = (expenses ?? []).reduce((s: number, e: any) => s + Number(e.amount), 0);
  downloadCSV(`summary-${ts}.csv`, [
    { metric: "Total approved donations (IN)", value: totalDon },
    { metric: "Total expenses (OUT)", value: totalExp },
    { metric: "Balance", value: totalDon - totalExp },
    { metric: "Donations count (all)", value: (donations ?? []).length },
    { metric: "Approved donations count", value: approved.length },
    { metric: "Expenses count", value: (expenses ?? []).length },
  ]);
  toast.success("Exported: donations, expenses, all-transactions & summary");
}

/* ---------------- Reorder helper ---------------- */
async function moveItem(table: "gallery_categories" | "events" | "event_sections", list: any[], id: string, dir: -1 | 1) {
  const idx = list.findIndex(x => x.id === id);
  const swapIdx = idx + dir;
  if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return;
  const reordered = [...list];
  [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
  // Rewrite sort_order for everyone so duplicates get normalized
  await Promise.all(reordered.map((row, i) =>
    supabase.from(table).update({ sort_order: i }).eq("id", row.id)
  ));
}

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function AdminPage() {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin) return (
    <div className="p-12 text-center">
      <h2 className="font-display text-2xl mb-2">Access denied</h2>
      <p className="text-muted-foreground">You don't have admin access.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-3xl sm:text-4xl">Admin Dashboard</h1>
        {isSuperAdmin && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-festive-gradient text-primary-foreground">
            <ShieldCheck className="h-3 w-3" /> Super Admin
          </span>
        )}
      </div>
      <Tabs defaultValue="dashboard">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="slider">Slider</TabsTrigger>
          <TabsTrigger value="countdowns">Countdowns</TabsTrigger>
          <TabsTrigger value="friends">Friends 🎂</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="payment">Bank & QR</TabsTrigger>
          <TabsTrigger value="branding">Logo</TabsTrigger>
          <TabsTrigger value="sections">Highlights</TabsTrigger>
          <TabsTrigger value="announcements">News</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="reels">Instagram Reels</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="admins">Manage Admins</TabsTrigger>}
        </TabsList>
        <TabsContent value="dashboard"><Dashboard /></TabsContent>
        <TabsContent value="donations"><DonationsTab /></TabsContent>
        <TabsContent value="expenses"><ExpensesTab /></TabsContent>
        <TabsContent value="slider"><SliderTab /></TabsContent>
        <TabsContent value="countdowns"><CountdownsTab /></TabsContent>
        <TabsContent value="friends"><FriendsTab /></TabsContent>
        <TabsContent value="events"><EventsTab /></TabsContent>
        <TabsContent value="payment"><PaymentSettingsTab /></TabsContent>
        <TabsContent value="branding"><BrandingTab /></TabsContent>
        <TabsContent value="sections"><SectionsTab /></TabsContent>
        <TabsContent value="announcements"><AnnouncementsTab /></TabsContent>
        <TabsContent value="gallery"><GalleryTab /></TabsContent>
        <TabsContent value="contact"><ContactTab /></TabsContent>

        <TabsContent value="reels">
          <InstagramReelsTab />
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestionsTab />
        </TabsContent>
        {isSuperAdmin && <TabsContent value="admins"><ManageAdminsTab /></TabsContent>}
      </Tabs>
    </div>
  );
}

/* ---------------- Manage Admins (super admin only) ---------------- */
function ManageAdminsTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("id, email, full_name").order("email");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const merged = (profiles ?? []).map((p: any) => ({
      ...p,
      roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
    }));
    setUsers(merged);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const grantAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) toast.error(error.message); else { toast.success("Admin access granted"); load(); }
  };
  const revokeAdmin = async (userId: string) => {
    if (!confirm("Revoke admin access from this user?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) toast.error(error.message); else { toast.success("Admin access revoked"); load(); }
  };

  if (loading) return <p className="mt-4 text-muted-foreground">Loading users…</p>;

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardContent className="p-5">
          <h3 className="font-display text-xl mb-1 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-leaf" /> Verify & Manage Admins
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Only the super admin can grant or revoke admin access. Admins have full editing access to all content but cannot manage other admins.
          </p>
          <div className="grid gap-2">
            {users.map((u) => {
              const isSuper = u.roles.includes("super_admin");
              const isAdminRole = u.roles.includes("admin");
              return (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 border border-border/50 rounded-md p-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.full_name || u.email}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {isSuper && <span className="text-[10px] px-2 py-0.5 rounded-full bg-festive-gradient text-primary-foreground">SUPER ADMIN</span>}
                      {isAdminRole && <span className="text-[10px] px-2 py-0.5 rounded-full bg-leaf text-primary-foreground">ADMIN</span>}
                      {!isAdminRole && !isSuper && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">USER</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isSuper ? (
                      <span className="text-xs text-muted-foreground italic">Protected</span>
                    ) : isAdminRole ? (
                      <Button size="sm" variant="outline" onClick={() => revokeAdmin(u.id)}>
                        <Shield className="h-4 w-4 mr-1" /> Revoke admin
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => grantAdmin(u.id)}>
                        <Check className="h-4 w-4 mr-1" /> Verify & grant admin
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {users.length === 0 && <p className="text-sm text-muted-foreground">No users yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard() {
  const [stats, setStats] = useState({ donations: 0, expenses: 0, pending: 0 });
  const [recent, setRecent] = useState<{ donor_name: string; amount: number; status: string; created_at: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: ds } = await supabase.from("donations").select("amount, status, donor_name, created_at").order("created_at", { ascending: false });
      const { data: ex } = await supabase.from("expenses").select("amount");
      const approved = (ds ?? []).filter(d => d.status === "approved");
      setStats({
        donations: approved.reduce((s, d) => s + Number(d.amount), 0),
        expenses: (ex ?? []).reduce((s, e) => s + Number(e.amount), 0),
        pending: (ds ?? []).filter(d => d.status === "pending").length,
      });
      setRecent((ds ?? []).slice(0, 8));
    })();
  }, []);

  return (
    <div className="space-y-6 mt-4">
      <div className="flex justify-end">
        <Button onClick={exportFinancials} variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export Financial Data (CSV)
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Total Donations" value={inr(stats.donations)} />
        <Stat icon={TrendingDown} label="Total Expenses" value={inr(stats.expenses)} />
        <Stat icon={Wallet} label="Balance" value={inr(stats.donations - stats.expenses)} />
        <Stat icon={ImageIcon} label="Pending Donations" value={String(stats.pending)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-display text-xl mb-3">Recent Donations</h3>
            <div className="space-y-2 text-sm">
              {recent.length === 0 && <p className="text-muted-foreground">No donations yet.</p>}
              {recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
                  <div>
                    <div className="font-medium">{r.donor_name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")} · {r.status}</div>
                  </div>
                  <div className="font-display text-lg text-leaf">+ {inr(Number(r.amount))}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <RecentExpenses />
      </div>
    </div>
  );
}

function RecentExpenses() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("expenses").select("title, amount, category, spent_on").order("spent_on", { ascending: false }).limit(8)
      .then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-display text-xl mb-3">Recent Expenses</h3>
        <div className="space-y-2 text-sm">
          {rows.length === 0 && <p className="text-muted-foreground">No expenses yet.</p>}
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.spent_on).toLocaleDateString("en-IN")}{r.category ? ` · ${r.category}` : ""}</div>
              </div>
              <div className="font-display text-lg text-vermillion">- {inr(Number(r.amount))}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card><CardContent className="p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-festive-gradient text-primary-foreground flex items-center justify-center"><Icon className="h-5 w-5" /></div>
      <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-xl">{value}</div></div>
    </CardContent></Card>
  );
}

/* ---------------- Donations ---------------- */
function DonationsTab() {
  const [list, setList] = useState<any[]>([]);
  const [add, setAdd] = useState({ donor_name: "", amount: "", payment_method: "Cash", phone: "", email: "" });

  const load = async () => {
    const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("donations").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this donation?")) return;
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };
  const addManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("donations").insert({
      donor_name: add.donor_name, amount: Number(add.amount), payment_method: add.payment_method as any,
      phone: add.phone || "N/A", email: add.email || "n/a@gvb.local", status: "approved", event_tag: "vinayaka_chavithi_2026",
    });
    if (error) toast.error(error.message); else { toast.success("Added"); setAdd({ donor_name: "", amount: "", payment_method: "Cash", phone: "", email: "" }); load(); }
  };

  return (
    <div className="space-y-6 mt-4">
      <Card><CardContent className="p-5">
        <h3 className="font-display text-xl mb-3">Add manual donation</h3>
        <form onSubmit={addManual} className="grid gap-3 sm:grid-cols-5">
          <Input placeholder="Donor name" value={add.donor_name} onChange={e => setAdd({ ...add, donor_name: e.target.value })} required />
          <Input type="number" placeholder="Amount" value={add.amount} onChange={e => setAdd({ ...add, amount: e.target.value })} required />
          <Select value={add.payment_method} onValueChange={v => setAdd({ ...add, payment_method: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Cash", "PhonePe", "Google Pay", "Paytm", "Bank Transfer", "UPI", "Other"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Phone (opt)" value={add.phone} onChange={e => setAdd({ ...add, phone: e.target.value })} />
          <Button type="submit"><Plus className="h-4 w-4 mr-1" />Add</Button>
        </form>
      </CardContent></Card>

      <div className="grid gap-3">
        {list.map(d => (
          <Card key={d.id}><CardContent className="p-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold">{d.donor_name} <span className="text-vermillion font-display">{inr(Number(d.amount))}</span></div>
              <div className="text-xs text-muted-foreground">{d.payment_method} · {d.phone} · {d.email}</div>
              {d.message && <div className="text-xs italic mt-1">"{d.message}"</div>}
              <div className="text-xs mt-1">Status: <span className={`font-semibold ${d.status === "approved" ? "text-leaf" : d.status === "rejected" ? "text-vermillion" : "text-primary"}`}>{d.status}</span></div>
            </div>
            <div className="flex gap-2">
              {d.status !== "approved" && <Button size="sm" onClick={() => update(d.id, { status: "approved" })}><Check className="h-4 w-4" /></Button>}
              {d.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => update(d.id, { status: "rejected" })}><X className="h-4 w-4" /></Button>}
              <Button size="sm" variant="destructive" onClick={() => del(d.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Expenses ---------------- */
function ExpensesTab() {
  const [list, setList] = useState<any[]>([]);
  const [f, setF] = useState({ title: "", amount: "", category: "", description: "" });
  const load = async () => {
    const { data } = await supabase.from("expenses").select("*").order("spent_on", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("expenses").insert({
      title: f.title, amount: Number(f.amount), category: f.category || null, description: f.description || null,
    });
    if (error) toast.error(error.message); else { toast.success("Added"); setF({ title: "", amount: "", category: "", description: "" }); load(); }
  };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("expenses").delete().eq("id", id); load(); };

  return (
    <div className="space-y-6 mt-4">
      <Card><CardContent className="p-5">
        <h3 className="font-display text-xl mb-3">Add expense</h3>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Title" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required />
          <Input type="number" placeholder="Amount" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} required />
          <Input placeholder="Category" value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
          <Button type="submit"><Plus className="h-4 w-4 mr-1" />Add</Button>
          <Textarea className="sm:col-span-4" placeholder="Description (optional)" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
        </form>
      </CardContent></Card>
      <div className="grid gap-2">
        {list.map(x => (
          <Card key={x.id}><CardContent className="p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{x.title} <span className="text-vermillion font-display">{inr(Number(x.amount))}</span></div>
              <div className="text-xs text-muted-foreground">{x.category ?? "—"} · {new Date(x.spent_on).toLocaleDateString("en-IN")}</div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => del(x.id)}><Trash2 className="h-4 w-4" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Image upload helper ---------------- */
async function uploadImage(bucket: string, file: File) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/* ---------------- Slider ---------------- */
function SliderTab() {
  const [list, setList] = useState<any[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => { const { data } = await supabase.from("slider_images").select("*").order("sort_order"); setList(data ?? []); };
  useEffect(() => { load(); }, []);
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage("slider", file);
      const { error } = await supabase.from("slider_images").insert({ image_url: url, caption: caption || null, sort_order: list.length });
      if (error) throw error;
      toast.success("Uploaded"); setCaption(""); load();
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("slider_images").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-5 space-y-3">
        <Label>Caption (optional)</Label>
        <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Vinayaka Chavithi 2025" />
        <Label className="flex items-center gap-2 cursor-pointer">
          <Upload className="h-4 w-4" /> Upload image
          <input type="file" accept="image/*" hidden onChange={onUpload} disabled={busy} />
        </Label>
      </CardContent></Card>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {list.map(s => (
          <Card key={s.id} className="overflow-hidden">
            <img src={s.image_url} alt="" className="aspect-video w-full object-cover" />
            <CardContent className="p-3 flex items-center justify-between">
              <span className="text-sm truncate">{s.caption || "—"}</span>
              <Button size="sm" variant="destructive" onClick={() => del(s.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Event Sections ---------------- */
function SectionsTab() {
  const [list, setList] = useState<any[]>([]);
  const [f, setF] = useState({ title: "", description: "", category: "event", link_url: "", image_url: "" });
  const [busy, setBusy] = useState(false);
  const load = async () => { const { data } = await supabase.from("event_sections").select("*").order("sort_order"); setList(data ?? []); };
  useEffect(() => { load(); }, []);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { setF({ ...f, image_url: await uploadImage("events", file) }); toast.success("Image uploaded"); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("event_sections").insert({ ...f, image_url: f.image_url || null, link_url: f.link_url || null, description: f.description || null, sort_order: list.length });
    if (error) toast.error(error.message); else { toast.success("Added"); setF({ title: "", description: "", category: "event", link_url: "", image_url: "" }); load(); }
  };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("event_sections").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-5">
        <h3 className="font-display text-xl mb-3">Add homepage section</h3>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Title" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required />
          <Input placeholder="Category (festival, birthday, event...)" value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
          <Textarea className="sm:col-span-2" placeholder="Description" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
          <Input placeholder="Link URL (optional)" value={f.link_url} onChange={e => setF({ ...f, link_url: e.target.value })} />
          <Label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2">
            <Upload className="h-4 w-4" /> {f.image_url ? "Change image" : "Upload image"}
            <input type="file" accept="image/*" hidden onChange={upload} disabled={busy} />
          </Label>
          {f.image_url && <img src={f.image_url} alt="" className="h-20 rounded sm:col-span-2 object-cover" />}
          <Button type="submit" className="sm:col-span-2"><Plus className="h-4 w-4 mr-1" />Add section</Button>
        </form>
      </CardContent></Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((s, i) => (
          <div key={s.id} className="relative">
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={i === 0} onClick={async () => { await moveItem("event_sections", list, s.id, -1); load(); }}><ArrowUp className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={i === list.length - 1} onClick={async () => { await moveItem("event_sections", list, s.id, 1); load(); }}><ArrowDown className="h-3 w-3" /></Button>
            </div>
            <SectionEditCard section={s} onChanged={load} onDelete={() => del(s.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionEditCard({ section, onChanged, onDelete }: { section: any; onChanged: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({
    title: section.title ?? "",
    description: section.description ?? "",
    category: section.category ?? "event",
    link_url: section.link_url ?? "",
    image_url: section.image_url ?? "",
  });
  const [busy, setBusy] = useState(false);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { setF({ ...f, image_url: await uploadImage("events", file) }); toast.success("Image uploaded"); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };
  const save = async () => {
    const { error } = await supabase.from("event_sections").update({
      title: f.title,
      description: f.description || null,
      category: f.category,
      link_url: f.link_url || null,
      image_url: f.image_url || null,
    }).eq("id", section.id);
    if (error) toast.error(error.message); else { toast.success("Saved"); setEditing(false); onChanged(); }
  };

  if (!editing) {
    return (
      <Card><CardContent className="p-4 flex gap-3">
        {section.image_url && <img src={section.image_url} alt="" className="h-20 w-28 object-cover rounded" />}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{section.title}</div>
          <div className="text-xs text-muted-foreground">{section.category}</div>
          <div className="text-sm line-clamp-2">{section.description}</div>
          {section.link_url && <div className="text-xs text-primary truncate">→ {section.link_url}</div>}
        </div>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent></Card>
    );
  }
  return (
    <Card><CardContent className="p-4 grid gap-2">
      <Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Title" />
      <Input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} placeholder="Category" />
      <Textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Description (text shown on the highlight card)" />
      <Input value={f.link_url} onChange={e => setF({ ...f, link_url: e.target.value })} placeholder="Learn more link URL" />
      <Label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm">
        <Upload className="h-4 w-4" /> {f.image_url ? "Change image" : "Upload image"}
        <input type="file" accept="image/*" hidden onChange={upload} disabled={busy} />
      </Label>
      {f.image_url && <img src={f.image_url} alt="" className="h-20 object-cover rounded" />}
      <div className="flex gap-2">
        <Button size="sm" onClick={save}><Save className="h-4 w-4 mr-1" />Save</Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </CardContent></Card>
  );
}

/* ---------------- Announcements ---------------- */
function AnnouncementsTab() {
  const [list, setList] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => { const { data } = await supabase.from("announcements").select("*").order("sort_order"); setList(data ?? []); };
  useEffect(() => { load(); }, []);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { const url = await uploadImage("events", file); setImageUrl(url); toast.success("Image uploaded"); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("announcements").insert({ text, image_url: imageUrl || null, sort_order: list.length } as any);
    if (error) toast.error(error.message); else { setText(""); setImageUrl(""); load(); }
  };
  const toggle = async (id: string, active: boolean) => { await supabase.from("announcements").update({ active: !active }).eq("id", id); load(); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("announcements").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-5 space-y-3">
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Input value={text} onChange={e => setText(e.target.value)} placeholder="News / announcement text" required />
          <Label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm">
            <Upload className="h-4 w-4" /> {imageUrl ? "Change image" : "Add image (optional)"}
            <input type="file" accept="image/*" hidden onChange={upload} disabled={busy} />
          </Label>
          <Button type="submit"><Plus className="h-4 w-4 mr-1" />Post</Button>
        </form>
        {imageUrl && (
          <div className="flex items-center gap-3">
            <img src={imageUrl} alt="" className="h-20 w-32 object-cover rounded" />
            <Button type="button" size="sm" variant="outline" onClick={() => setImageUrl("")}>Remove image</Button>
          </div>
        )}
      </CardContent></Card>
      <div className="grid gap-2">
        {list.map((a: any) => (
          <Card key={a.id}><CardContent className="p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {a.image_url && <img src={a.image_url} alt="" className="h-12 w-16 object-cover rounded shrink-0" />}
              <span className={`truncate ${a.active ? "" : "opacity-50 line-through"}`}>{a.text}</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => toggle(a.id, a.active)}>{a.active ? "Hide" : "Show"}</Button>
              <Button size="sm" variant="destructive" onClick={() => del(a.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Gallery ---------------- */
function GalleryTab() {
  const [cats, setCats] = useState<any[]>([]);
  const [imgs, setImgs] = useState<any[]>([]);
  const [newCat, setNewCat] = useState("");
  const [selCat, setSelCat] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const { data: c } = await supabase.from("gallery_categories").select("*").order("sort_order");
    const { data: i } = await supabase.from("gallery_images").select("*").order("created_at", { ascending: false });
    setCats(c ?? []); setImgs(i ?? []);
    if (!selCat && c && c.length) setSelCat(c[0].id);
  };
  useEffect(() => { load(); }, []);
  const addCat = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newCat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("gallery_categories").insert({ name: newCat, slug, sort_order: cats.length });
    if (error) toast.error(error.message); else { setNewCat(""); load(); }
  };
  const delCat = async (id: string) => { if (!confirm("Delete category and its images?")) return; await supabase.from("gallery_categories").delete().eq("id", id); load(); };
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length || !selCat) return;
    setBusy(true);
    try {
      for (const f of files) {
        const url = await uploadImage("gallery", f);
        const media_type = f.type.startsWith("video/") ? "video" : "image";
        await supabase.from("gallery_images").insert({ category_id: selCat, image_url: url, media_type });
      }
      toast.success(`${files.length} uploaded`); load();
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };
  const delImg = async (id: string) => { await supabase.from("gallery_images").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-5 space-y-3">
        <h3 className="font-display text-xl">Categories</h3>
        <form onSubmit={addCat} className="flex gap-2">
          <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" required />
          <Button type="submit"><Plus className="h-4 w-4" /></Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {cats.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${selCat === c.id ? "bg-primary text-primary-foreground" : ""}`}>
              <button disabled={i === 0} onClick={async () => { await moveItem("gallery_categories", cats, c.id, -1); load(); }} className="opacity-60 hover:opacity-100 disabled:opacity-20" title="Move up/left"><ArrowUp className="h-3 w-3" /></button>
              <button disabled={i === cats.length - 1} onClick={async () => { await moveItem("gallery_categories", cats, c.id, 1); load(); }} className="opacity-60 hover:opacity-100 disabled:opacity-20" title="Move down/right"><ArrowDown className="h-3 w-3" /></button>
              <button onClick={() => setSelCat(c.id)}>{c.name}</button>
              <button onClick={() => delCat(c.id)} className="opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-5">
        <Label className="flex items-center gap-2 cursor-pointer">
          <Upload className="h-4 w-4" /> Upload photos or videos to selected category {busy && "(uploading…)"}
          <input type="file" accept="image/*,video/*" multiple hidden onChange={upload} disabled={busy || !selCat} />
        </Label>
      </CardContent></Card>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {imgs.filter(i => !selCat || i.category_id === selCat).map(img => (
          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border bg-black">
            {img.media_type === "video" ? (
              <video src={img.image_url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            ) : (
              <img src={img.image_url} alt="" className="h-full w-full object-cover" />
            )}
            <button onClick={() => delImg(img.id)} className="absolute top-1 right-1 p-1 rounded-full bg-vermillion text-primary-foreground opacity-0 group-hover:opacity-100 transition">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Friends (birthday slider) ---------------- */
function FriendsTab() {
  const [list, setList] = useState<any[]>([]);
  const [f, setF] = useState({ name: "", birthday: "", message: "", image_url: "" });
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const { data } = await supabase.from("friends").select("*").order("birthday");
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { setF(s => ({ ...s, image_url: "" })); const url = await uploadImage("slider", file); setF(s => ({ ...s, image_url: url })); toast.success("Image uploaded"); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.image_url) { toast.error("Please upload a photo"); return; }
    const { error } = await supabase.from("friends").insert({
      name: f.name, birthday: f.birthday, message: f.message || null, image_url: f.image_url,
    });
    if (error) toast.error(error.message);
    else { toast.success("Friend added"); setF({ name: "", birthday: "", message: "", image_url: "" }); load(); }
  };
  const toggle = async (id: string, active: boolean) => { await supabase.from("friends").update({ active: !active }).eq("id", id); load(); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("friends").delete().eq("id", id); load(); };
  const today = new Date(); const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-5">
        <h3 className="font-display text-xl mb-1">Add street friend</h3>
        <p className="text-xs text-muted-foreground mb-4">On their birthday (any year), the friend's photo will auto-appear in the homepage slider.</p>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Friend's name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
          <Input type="date" value={f.birthday} onChange={e => setF({ ...f, birthday: e.target.value })} required />
          <Textarea className="sm:col-span-2" placeholder="Birthday wish (optional)" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} />
          <Label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2">
            <Upload className="h-4 w-4" /> {f.image_url ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/*" hidden onChange={upload} disabled={busy} />
          </Label>
          {f.image_url && <img src={f.image_url} alt="" className="h-20 w-20 rounded object-cover" />}
          <Button type="submit" className="sm:col-span-2"><Plus className="h-4 w-4 mr-1" />Add friend</Button>
        </form>
      </CardContent></Card>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {list.map(fr => {
          const isToday = String(fr.birthday).slice(5) === todayMD;
          return (
            <Card key={fr.id} className={isToday ? "border-2 border-vermillion" : ""}>
              <CardContent className="p-4 flex gap-3">
                <img src={fr.image_url} alt={fr.name} className="h-16 w-16 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-1">{fr.name} {isToday && "🎂"}</div>
                  <div className="text-xs text-muted-foreground">🎈 {new Date(fr.birthday).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</div>
                  {fr.message && <div className="text-xs italic mt-1 line-clamp-2">"{fr.message}"</div>}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => toggle(fr.id, fr.active)}>{fr.active ? "Hide" : "Show"}</Button>
                    <Button size="sm" variant="destructive" onClick={() => del(fr.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Events (Vinayaka, Dussera, etc.) ---------------- */
function EventsTab() {
  const [list, setList] = useState<any[]>([]);
  const [f, setF] = useState({ name: "", slug: "", description: "", event_date: "", banner_url: "" });
  const [busy, setBusy] = useState(false);
  const load = async () => { const { data } = await supabase.from("events").select("*").order("sort_order"); setList(data ?? []); };
  useEffect(() => { load(); }, []);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { const url = await uploadImage("events", file); setF(s => ({ ...s, banner_url: url })); toast.success("Banner uploaded"); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = (f.slug || f.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    const { error } = await supabase.from("events").insert({
      name: f.name, slug,
      description: f.description || null,
      event_date: f.event_date || null,
      banner_url: f.banner_url || null,
      sort_order: list.length,
    });
    if (error) toast.error(error.message);
    else { toast.success("Event added — its donor list page is now live at /events/" + slug); setF({ name: "", slug: "", description: "", event_date: "", banner_url: "" }); load(); }
  };
  const toggle = async (id: string, active: boolean) => { await supabase.from("events").update({ active: !active }).eq("id", id); load(); };
  const del = async (id: string) => { if (!confirm("Delete event? Donations remain.")) return; await supabase.from("events").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-5">
        <h3 className="font-display text-xl mb-1">Add a new event (e.g. Dussera, Sankranti)</h3>
        <p className="text-xs text-muted-foreground mb-4">Each event gets its own public page with a donor list & expenses tracker.</p>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Event name (e.g. Dussera 2026)" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
          <Input placeholder="URL slug (auto if blank, e.g. dussera_2026)" value={f.slug} onChange={e => setF({ ...f, slug: e.target.value })} />
          <Input type="date" value={f.event_date} onChange={e => setF({ ...f, event_date: e.target.value })} />
          <Label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2">
            <Upload className="h-4 w-4" /> {f.banner_url ? "Change banner" : "Upload banner"}
            <input type="file" accept="image/*" hidden onChange={upload} disabled={busy} />
          </Label>
          <Textarea className="sm:col-span-2" placeholder="Description" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
          {f.banner_url && <img src={f.banner_url} alt="" className="sm:col-span-2 h-32 w-full rounded object-cover" />}
          <Button type="submit" className="sm:col-span-2"><Plus className="h-4 w-4 mr-1" />Create event</Button>
        </form>
      </CardContent></Card>
      <p className="text-xs text-muted-foreground">Use ↑ ↓ to set the order shown on the home page (top = highest priority).</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((ev, i) => (
          <EventEditCard
            key={ev.id}
            ev={ev}
            isFirst={i === 0}
            isLast={i === list.length - 1}
            list={list}
            onChanged={load}
          />
        ))}
      </div>
    </div>
  );
}

function EventEditCard({ ev, isFirst, isLast, list, onChanged }: { ev: any; isFirst: boolean; isLast: boolean; list: any[]; onChanged: () => void }) {
  const [bgUrl, setBgUrl] = useState<string>(ev.bg_image_url ?? "");
  const [opacity, setOpacity] = useState<number>(Number(ev.bg_opacity ?? 0.3));
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const uploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage("events", file);
      setBgUrl(url);
      await supabase.from("events").update({ bg_image_url: url }).eq("id", ev.id);
      toast.success("Background uploaded");
      onChanged();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); e.target.value = ""; }
  };
  const saveOpacity = async () => {
    setSaving(true);
    const { error } = await supabase.from("events").update({ bg_opacity: opacity }).eq("id", ev.id);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Opacity saved"); onChanged(); }
  };
  const clearBg = async () => {
    setBgUrl("");
    await supabase.from("events").update({ bg_image_url: null }).eq("id", ev.id);
    toast.success("Background removed");
    onChanged();
  };
  const toggle = async () => { await supabase.from("events").update({ active: !ev.active }).eq("id", ev.id); onChanged(); };
  const del = async () => { if (!confirm("Delete event? Donations remain.")) return; await supabase.from("events").delete().eq("id", ev.id); onChanged(); };

  return (
    <Card className={ev.active ? "" : "opacity-60"}>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-3">
          {ev.banner_url && <img src={ev.banner_url} alt="" className="h-20 w-28 rounded object-cover" />}
          <div className="flex-1">
            <div className="font-semibold">{ev.name}</div>
            <div className="text-xs text-muted-foreground">/events/{ev.slug}</div>
            {ev.event_date && <div className="text-xs">{new Date(ev.event_date).toLocaleDateString("en-IN", { dateStyle: "long" })}</div>}
            <div className="flex flex-wrap gap-2 mt-2">
              <Button size="sm" variant="outline" disabled={isFirst} onClick={async () => { await moveItem("events", list, ev.id, -1); onChanged(); }}><ArrowUp className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" disabled={isLast} onClick={async () => { await moveItem("events", list, ev.id, 1); onChanged(); }}><ArrowDown className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" onClick={toggle}>{ev.active ? "Hide" : "Show"}</Button>
              <Button size="sm" variant="destructive" onClick={del}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        </div>
        <div className="border-t pt-3 space-y-2">
          <Label className="text-xs font-semibold">Hero background image (shown under title)</Label>
          {bgUrl && (
            <div className="relative h-24 w-full rounded overflow-hidden bg-muted">
              <img src={bgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity }} />
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <Label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-1.5 text-sm">
              <Upload className="h-4 w-4" /> {bgUrl ? "Change" : "Upload"}
              <input type="file" accept="image/*" hidden onChange={uploadBg} disabled={busy} />
            </Label>
            {bgUrl && <Button size="sm" variant="outline" onClick={clearBg}>Remove</Button>}
          </div>
          <div>
            <Label className="text-xs">Opacity: {Math.round(opacity * 100)}%</Label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              onMouseUp={saveOpacity} onTouchEnd={saveOpacity}
              className="w-full"
              disabled={saving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Payment Settings (Bank & QR) ---------------- */
function PaymentSettingsTab() {
  const [row, setRow] = useState<any>(null);
  const [f, setF] = useState({
    bank_name: "", account_number: "", account_holder: "", ifsc: "",
    upi_id: "", phonepe_number: "", qr_image_url: "", notes: "",
  });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("payment_settings").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (data) {
      setRow(data);
      setF({
        bank_name: data.bank_name ?? "", account_number: data.account_number ?? "",
        account_holder: data.account_holder ?? "", ifsc: data.ifsc ?? "",
        upi_id: data.upi_id ?? "", phonepe_number: data.phonepe_number ?? "",
        qr_image_url: data.qr_image_url ?? "", notes: data.notes ?? "",
      });
    }
  };
  useEffect(() => { load(); }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { const url = await uploadImage("events", file); setF(s => ({ ...s, qr_image_url: url })); toast.success("QR uploaded"); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      bank_name: f.bank_name || null, account_number: f.account_number || null,
      account_holder: f.account_holder || null, ifsc: f.ifsc || null,
      upi_id: f.upi_id || null, phonepe_number: f.phonepe_number || null,
      qr_image_url: f.qr_image_url || null, notes: f.notes || null,
    };
    const { error } = row
      ? await supabase.from("payment_settings").update(payload).eq("id", row.id)
      : await supabase.from("payment_settings").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); load(); }
  };

  return (
    <div className="space-y-4 mt-4">
      <Card><CardContent className="p-5">
        <h3 className="font-display text-xl mb-1">Bank account & UPI / QR</h3>
        <p className="text-xs text-muted-foreground mb-4">These details appear on the Vinayaka Chavithi 2026 donation page.</p>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <div><Label>Bank Name</Label><Input value={f.bank_name} onChange={e => setF({ ...f, bank_name: e.target.value })} /></div>
          <div><Label>Account Holder</Label><Input value={f.account_holder} onChange={e => setF({ ...f, account_holder: e.target.value })} /></div>
          <div><Label>Account Number</Label><Input value={f.account_number} onChange={e => setF({ ...f, account_number: e.target.value })} /></div>
          <div><Label>IFSC Code</Label><Input value={f.ifsc} onChange={e => setF({ ...f, ifsc: e.target.value })} /></div>
          <div><Label>PhonePe Number</Label><Input value={f.phonepe_number} onChange={e => setF({ ...f, phonepe_number: e.target.value })} /></div>
          <div><Label>UPI ID</Label><Input value={f.upi_id} onChange={e => setF({ ...f, upi_id: e.target.value })} placeholder="name@upi" /></div>
          <div className="sm:col-span-2"><Label>Notes (optional)</Label><Textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} /></div>
          <div className="sm:col-span-2">
            <Label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 w-fit">
              <Upload className="h-4 w-4" /> {f.qr_image_url ? "Change QR image" : "Upload QR image"}
              <input type="file" accept="image/*" hidden onChange={upload} disabled={busy} />
            </Label>
            {f.qr_image_url && (
              <div className="mt-3 flex items-center gap-3">
                <img src={f.qr_image_url} alt="QR" className="h-32 w-32 object-contain rounded border bg-white p-2" />
                <Button type="button" size="sm" variant="outline" onClick={() => setF({ ...f, qr_image_url: "" })}>Remove QR</Button>
              </div>
            )}
          </div>
          <Button type="submit" className="sm:col-span-2"><Save className="h-4 w-4 mr-1" />Save settings</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}

/* ---------------- Branding (logo + site name) ---------------- */
function BrandingTab() {
  const [row, setRow] = useState<any>(null);
  const [name, setName] = useState("");
  const [nameTe, setNameTe] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (data) {
      setRow(data);
      setName(data.site_name ?? "");
      setNameTe((data as any).site_name_te ?? "");
      setLogoUrl(data.logo_url ?? "");
    }
  };
  useEffect(() => { load(); }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { setLogoUrl(await uploadImage("events", file)); toast.success("Logo uploaded — click Save"); }
    catch (err: any) { toast.error(err.message); } finally { setBusy(false); e.target.value = ""; }
  };

  const save = async () => {
    if (!row) return;
    const { error } = await supabase.from("site_settings")
      .update({ site_name: name || null, site_name_te: nameTe || null, logo_url: logoUrl || null, updated_at: new Date().toISOString() } as any)
      .eq("id", row.id);
    if (error) toast.error(error.message); else { toast.success("Saved — refresh to see changes"); load(); }
  };

  const removeLogo = () => setLogoUrl("");

  return (
    <div className="mt-4 max-w-xl">
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-display text-xl">Site Logo & Name</h3>
        <p className="text-sm text-muted-foreground">Shown in the navbar and footer across the site.</p>

        <div>
          <Label>Site Name (English)</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Gedela Vedhi Youth" />
        </div>

        <div>
          <Label>Site Name (Telugu)</Label>
          <Input value={nameTe} onChange={e => setNameTe(e.target.value)} placeholder="గెడెల వీధి యూత్" />
          <p className="text-xs text-muted-foreground mt-1">Shown below the English name in the navbar.</p>
        </div>

        <div>
          <Label>Logo</Label>
          <div className="flex items-center gap-4 mt-1">
            {logoUrl ? (
              <img src={logoUrl} alt="logo preview" className="h-20 w-20 rounded-full object-contain bg-white border" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground border">No logo</div>
            )}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm">
                <Upload className="h-4 w-4" /> {logoUrl ? "Change logo" : "Upload logo"}
                <input type="file" accept="image/*" hidden onChange={upload} disabled={busy} />
              </Label>
              {logoUrl && <Button size="sm" variant="outline" onClick={removeLogo}><Trash2 className="h-4 w-4 mr-1" />Remove</Button>}
            </div>
          </div>
        </div>

        <Button onClick={save} disabled={busy}><Save className="h-4 w-4 mr-1" />Save</Button>
      </CardContent></Card>
    </div>
  );
}

function ContactTab() {
  const [row, setRow] = useState<any>(null);
  const [form, setForm] = useState({ address: "", phone: "", email: "", instagram: "", maps_url: "" });

  const load = async () => {
    const { data } = await supabase.from("contact_settings").select("*").limit(1).maybeSingle();
    if (data) {
      setRow(data);
      setForm({
        address: data.address ?? "", phone: data.phone ?? "", email: data.email ?? "",
        instagram: data.instagram ?? "", maps_url: data.maps_url ?? "",
      });
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!row) return;
    const { error } = await supabase.from("contact_settings").update({
      address: form.address || null, phone: form.phone || null, email: form.email || null,
      instagram: form.instagram || null, maps_url: form.maps_url || null,
      updated_at: new Date().toISOString(),
    }).eq("id", row.id);
    if (error) toast.error(error.message); else { toast.success("Contact details saved"); load(); }
  };

  return (
    <div className="mt-4 max-w-2xl">
      <Card><CardContent className="p-5 space-y-4">
        <h3 className="font-display text-xl">Contact Details</h3>
        <p className="text-sm text-muted-foreground">Shown on the public Contact page.</p>
        <div><Label>Address</Label><Textarea rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Instagram handle</Label><Input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@yourhandle" /></div>
          <div><Label>Google Maps URL</Label><Input value={form.maps_url} onChange={e => setForm({ ...form, maps_url: e.target.value })} /></div>
        </div>
        <Button onClick={save}><Save className="h-4 w-4 mr-1" />Save</Button>
      </CardContent></Card>
    </div>
  );
}

/* ---------------- Countdowns ---------------- */
function CountdownsTab() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", event_date: "" });

  const load = async () => {
    const { data } = await supabase.from("countdowns").select("*").order("sort_order");
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.event_date) { toast.error("Name and date required"); return; }
    const { error } = await supabase.from("countdowns").insert({
      name: form.name,
      event_date: new Date(form.event_date).toISOString(),
      sort_order: list.length,
    });
    if (error) toast.error(error.message);
    else { toast.success("Added"); setForm({ name: "", event_date: "" }); load(); }
  };
  const toggle = async (id: string, active: boolean) => {
    const { error } = await supabase.from("countdowns").update({ active: !active }).eq("id", id);
    if (error) toast.error(error.message); else load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this countdown?")) return;
    const { error } = await supabase.from("countdowns").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-6 mt-4">
      <Card><CardContent className="p-5">
        <h3 className="font-display text-xl mb-3">Add countdown</h3>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Label>Event name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Vinayaka Chavithi 2026" />
          </div>
          <div className="sm:col-span-1">
            <Label>Event date & time</Label>
            <Input type="datetime-local" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full"><Plus className="h-4 w-4 mr-1" />Add</Button>
          </div>
        </form>
      </CardContent></Card>

      <div className="grid gap-2">
        {list.map(c => (
          <Card key={c.id}><CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(c.event_date).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button size="sm" variant={c.active ? "default" : "outline"} onClick={() => toggle(c.id, c.active)}>
                {c.active ? <><Check className="h-4 w-4 mr-1" />Enabled</> : <><X className="h-4 w-4 mr-1" />Disabled</>}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No countdowns yet.</p>}
      </div>
    </div>
  );
}

/* ---------------- Suggestions ---------------- */
function SuggestionsTab() {
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("suggestions").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    if (!confirm("Delete this suggestion?")) return;
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">Visitor Suggestions ({list.length})</h3>
        <Button variant="outline" size="sm" onClick={() =>
          downloadCSV(`suggestions-${new Date().toISOString().slice(0, 10)}.csv`,
            list.map(s => ({
              date: new Date(s.created_at).toLocaleString("en-IN"),
              name: s.name, suggestion: s.suggestion,
              email: s.email ?? "", phone: s.phone ?? "",
            })))
        }><Download className="h-4 w-4 mr-1" />Export CSV</Button>
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">No suggestions yet.</p>}
      {list.map(s => (
        <Card key={s.id}><CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{s.suggestion}</p>
              {(s.email || s.phone) && (
                <div className="mt-2 text-xs text-muted-foreground flex gap-3 flex-wrap">
                  {s.email && <span>📧 {s.email}</span>}
                  {s.phone && <span>📱 {s.phone}</span>}
                </div>
              )}
            </div>
            <Button size="sm" variant="destructive" onClick={() => del(s.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </CardContent></Card>
      ))}
    </div>
  );
}

function InstagramReelsTab() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [reels, setReels] = useState<any[]>([]);
  const loadReels = async () => {
    const { data, error } = await supabase
      .from("instagram_reels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setReels(data || []);
  };
  useEffect(() => {
    loadReels();
  }, []);

  const saveReel = async () => {
    if (!title || !instagramUrl || !thumbnail) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      setSaving(true);

      const fileName = `${Date.now()}-${thumbnail.name}`;

      const { error: uploadError } = await supabase.storage
        .from("instagram-reels")
        .upload(fileName, thumbnail);

      if (uploadError) {
        console.log(uploadError);
        toast.error(JSON.stringify(uploadError));
        return;
      }

      const { data } = supabase.storage
        .from("instagram-reels")
        .getPublicUrl(fileName);

      const result = await supabase
        .from("instagram_reels")
        .insert({
          title,
          instagram_url: instagramUrl,
          thumbnail_url: data.publicUrl,
        });

      console.log(result);

      if (result.error) throw result.error;

      toast.success("Instagram Reel added successfully!");

      await loadReels();

      setTitle("");
      setInstagramUrl("");
      setThumbnail(null);
      setOpen(false);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  const deleteReel = async (id: string) => {
    if (!confirm("Delete this reel?")) return;

    const { error } = await supabase
      .from("instagram_reels")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Reel deleted successfully!");

    loadReels();
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Instagram Reels</h2>
          <p className="text-muted-foreground">
            Manage Instagram reels displayed on the homepage.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          + Add Reel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reels.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              No Instagram reels added yet.
            </CardContent>
          </Card>
        ) : (
          reels.map((reel) => (
            <Card key={reel.id}>
              <img
                src={reel.thumbnail_url}
                className="w-full h-48 object-cover"
              />

              <CardContent className="p-4">
                <h3 className="font-bold">
                  {reel.title}
                </h3>

                <a
                  href={reel.instagram_url}
                  target="_blank"
                  className="text-blue-500"
                >
                  Open Reel
                </a>
                <Button
                  variant="destructive"
                  className="w-full mt-3"
                  onClick={() => deleteReel(reel.id)}
                >
                  Delete Reel
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Instagram Reel</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">

            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ganesh Procession 2026"
              />
            </div>

            <div>
              <Label>Instagram Reel URL</Label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
              />
            </div>

            <div>
              <Label>Thumbnail</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(e.target.files?.[0] || null)
                }
              />
            </div>

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={saveReel}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Reel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}
