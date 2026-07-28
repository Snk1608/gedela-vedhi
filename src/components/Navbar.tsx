import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Shield, LogOut, Languages } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, type TKey } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import logoFallback from "@/assets/logo.png";
import { useSiteSettings } from "@/hooks/use-site-settings";

const links: { to: "/" | "/about" | "/gallery" | "/news" | "/events" | "/vinayaka-chavithi-2026" | "/contact"; key: TKey }[] = [
  { to: "/", key: "home" },
  { to: "/about", key: "about" },
  { to: "/gallery", key: "gallery" },
  { to: "/news", key: "news" },
  { to: "/events", key: "events" },
  { to: "/vinayaka-chavithi-2026", key: "vinayaka" },
  { to: "/contact", key: "contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { logo_url, site_name, site_name_te } = useSiteSettings();
  const logo = logo_url || logoFallback;
  const name = site_name || "Gedela Vedhi Youth";
  const nameTe = site_name_te || "గెడెల వీధి యూత్";

  const toggleLang = () => setLang(lang === "en" ? "te" : "en");

  return (
    <header className="sticky top-0 z-50 bg-navbar-gradient shadow-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:py-4">
        <Link to="/" className="flex items-center gap-2.5 text-primary-foreground">
          <img
            src={logo}
            alt={`${name} logo`}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white p-0.5 shadow-soft object-contain"
          />
          <div className="leading-tight">
            <div className="font-display text-lg sm:text-xl">{name}</div>
            <div className="text-[10px] sm:text-xs opacity-90">{nameTe}</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-primary-foreground/95 transition hover:bg-white/15"
              activeProps={{ className: "bg-white/20" }}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleLang}
            className="text-primary-foreground hover:bg-white/15 gap-1.5"
            aria-label="Switch language"
          >
            <Languages className="h-4 w-4" />
            {lang === "en" ? "తెలుగు" : "English"}
          </Button>
          {isAdmin && (
            <Link to="/admin">
              <Button size="sm" variant="secondary" className="gap-1.5">
                <Shield className="h-4 w-4" /> {t("admin")}
              </Button>
            </Link>
          )}
          {user ? (
            <Button size="sm" variant="ghost" onClick={signOut} className="text-primary-foreground hover:bg-white/15">
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="secondary">{t("login")}</Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleLang}
            className="text-primary-foreground hover:bg-white/15 px-2"
            aria-label="Switch language"
          >
            <Languages className="h-4 w-4" />
            <span className="ml-1 text-xs">{lang === "en" ? "తె" : "EN"}</span>
          </Button>
          <button
            className="text-primary-foreground p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-navbar-gradient border-t border-white/20 animate-fade-in">
          <div className="flex flex-col px-4 py-3 gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-primary-foreground hover:bg-white/15 text-sm font-medium"
              >
                {t(l.key)}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2 flex gap-2">
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full gap-1.5">
                    <Shield className="h-4 w-4" /> {t("admin")}
                  </Button>
                </Link>
              )}
              {user ? (
                <Button size="sm" variant="secondary" onClick={() => { signOut(); setOpen(false); }} className="flex-1">
                  {t("signOut")}
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full">{t("login")}</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
