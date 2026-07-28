import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CHAT_URL =
  "https://wa.me/919121077054?text=Hello%20Gedela%20Vedhi%20Team!%20I%20would%20like%20to%20know%20more%20about%20your%20community.";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19.11 17.29c-.28-.14-1.65-.81-1.9-.9-.26-.09-.44-.14-.63.14-.19.28-.72.9-.88 1.09-.16.19-.32.21-.6.07-.28-.14-1.17-.43-2.23-1.38-.83-.74-1.38-1.65-1.54-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.34s1.01 2.72 1.15 2.9c.14.19 1.98 3.03 4.8 4.25.67.29 1.19.46 1.6.59.67.21 1.28.18 1.77.11.54-.08 1.65-.68 1.89-1.34.23-.66.23-1.22.16-1.34-.07-.12-.26-.19-.54-.33zM16.03 6.4c-5.32 0-9.63 4.32-9.63 9.63 0 1.7.44 3.36 1.29 4.82L6.4 25.6l4.87-1.27a9.6 9.6 0 0 0 4.74 1.24h.01c5.31 0 9.63-4.32 9.63-9.63 0-2.57-1-4.99-2.82-6.81a9.57 9.57 0 0 0-6.8-2.82zm5.66 15.29a7.98 7.98 0 0 1-5.66 2.35h-.01a7.97 7.97 0 0 1-4.06-1.11l-.29-.17-3.02.79.81-2.94-.19-.3a7.99 7.99 0 0 1-1.22-4.28c0-4.42 3.6-8.02 8.03-8.02 2.14 0 4.16.84 5.67 2.35a7.96 7.96 0 0 1 2.35 5.67c0 4.42-3.6 8.02-8.02 8.02z" />
    </svg>
  );
}

export function WhatsAppFloat() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={CHAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Gedela Vedhi on WhatsApp"
          className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full text-white shadow-[0_0_0_0_rgba(37,211,102,0.6)] transition-transform duration-300 hover:scale-110 hover:shadow-[0_10px_30px_-5px_rgba(37,211,102,0.7)] active:scale-95"
          style={{ backgroundColor: "#25D366" }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full animate-ping opacity-40"
            style={{ backgroundColor: "#25D366", animationDuration: "2.4s" }}
          />
          <WhatsAppIcon className="relative h-7 w-7 sm:h-8 sm:w-8 drop-shadow" />
        </a>
      </TooltipTrigger>
      <TooltipContent side="left" className="font-medium">
        Chat with Gedela Vedhi
      </TooltipContent>
    </Tooltip>
  );
}

export function WhatsAppGroupButton({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-5 py-2.5 text-sm gap-2.5",
    lg: "px-6 py-3 text-base gap-3",
  };
  return (
    <a
      href="https://chat.whatsapp.com/Ew0H3IFrvSZApFlZobRgpa"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our WhatsApp group"
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#25D366]/50 active:translate-y-0 ${sizes[size]} ${className}`}
      style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span>Join Our WhatsApp Group</span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-90" fill="currentColor" aria-hidden>
        <path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.67 0-8 1.34-8 4v3h10v-3c0-.97.36-1.83.94-2.55C9.24 13.16 8.5 13 8 13zm8 0c-.29 0-.62.02-.97.05A4.99 4.99 0 0 1 17 17v3h7v-3c0-2.66-5.33-4-8-4z" />
      </svg>
    </a>
  );
}

export function WhatsAppChatButton({
  className = "",
  size = "md",
  label = "Chat Now",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizes = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-5 py-2.5 text-sm gap-2.5",
    lg: "px-6 py-3 text-base gap-3",
  };
  return (
    <a
      href={CHAT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#25D366]/50 active:translate-y-0 ${sizes[size]} ${className}`}
      style={{ backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </a>
  );
}
