import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Login — Gedela Vedhi Youth" },
      { name: "description", content: "Admin login for Gedela Vedhi Youth." },
    ],
  }),
});

function AuthPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isAdmin) navigate({ to: "/admin" });
    else if (user) navigate({ to: "/" });
  }, [user, isAdmin, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success(t("welcomeBack"));
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success(t("accountCreated"));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-hero-gradient">
      <Card className="w-full max-w-md border-2 border-primary/30 shadow-festive animate-fade-in">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-festive-gradient text-primary-foreground shadow-soft">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl">{t("authWelcome")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("authSubtitle")}</p>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 mb-5">
              <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4">
                <div>
                  <Label htmlFor="e1">{t("formEmail")}</Label>
                  <Input id="e1" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="p1">{t("password")}</Label>
                  <Input id="p1" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-donate-gradient">
                  {loading ? t("signingIn") : t("signIn")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4">
                <div>
                  <Label htmlFor="n2">{t("fullName")}</Label>
                  <Input id="n2" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="e2">{t("formEmail")}</Label>
                  <Input id="e2" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="p2">{t("passwordHint")}</Label>
                  <Input id="p2" type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-donate-gradient">
                  {loading ? t("creatingAccount") : t("createAccount")}
                </Button>
                <p className="text-xs text-muted-foreground text-center">{t("authNote")}</p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
