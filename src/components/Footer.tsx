import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Instagram } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import logoFallback from "@/assets/logo.png";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { WhatsAppChatButton, WhatsAppGroupButton } from "@/components/WhatsAppFloat";

export function Footer() {
  const { t } = useLanguage();
  const { logo_url, site_name } = useSiteSettings();
  const logo = logo_url || logoFallback;
  const name = site_name || "Gedela Vedhi Youth";
  return (
    <footer className="mt-16 bg-festive-gradient text-primary-foreground">
      <div className="marigold-border h-3" />
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img
              src={logo}
              alt={`${name} logo`}
              className="h-14 w-14 rounded-full bg-white p-0.5 shadow-soft object-contain"
            />
            <h3 className="font-display text-2xl">{name}</h3>
          </div>
          <p className="text-sm opacity-95 leading-relaxed">{t("tagline")}</p>
        </div>

        <div>
          <h4 className="font-display text-lg mb-3">{t("contactHeading")}</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Gajarayuni Valasa,<br />
                Gedela Vedhi,<br />
                Andhra Pradesh — 535578
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4" />
              <a href="tel:9121077054" className="hover:underline">9121077054</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4" />
              <a href="mailto:gedelavedhiboyz@gmail.com" className="hover:underline break-all">
                gedelavedhiboyz@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Instagram className="h-4 w-4" />
              <a
                href="https://instagram.com/gedelavedhi_boys"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                @gedelavedhi_boys
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-3">{t("quickLinks")}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">{t("home")}</Link></li>
            <li><Link to="/about" className="hover:underline">{t("about")}</Link></li>
            <li><Link to="/gallery" className="hover:underline">{t("gallery")}</Link></li>
            <li><Link to="/news" className="hover:underline">{t("news")}</Link></li>
            <li><Link to="/vinayaka-chavithi-2026" className="hover:underline">{t("vinayaka")}</Link></li>
            <li><Link to="/contact" className="hover:underline">{t("contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-3">Connect With Us</h4>
          <p className="text-sm opacity-90 mb-4">
            Reach out on WhatsApp or join our community group for updates and events.
          </p>
          <div className="flex flex-col gap-3 items-start">
            <WhatsAppChatButton size="sm" label="WhatsApp Chat" />
            <WhatsAppGroupButton size="sm" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs opacity-90">
        {t("copyright")}
      </div>
    </footer>
  );
}
