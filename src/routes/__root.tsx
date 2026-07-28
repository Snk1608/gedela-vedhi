import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";


import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Gedela Vedhi Youth — Community of Gajarayuni Valasa" },
      {
        name: "description",
        content:
          "Official community website of Gedela Vedhi Youth, Gajarayuni Valasa. Festivals, events, gallery and Vinayaka Chavithi 2026 donations.",
      },
      { name: "theme-color", content: "#E67E22" },
      { property: "og:title", content: "Gedela Vedhi Youth — Community of Gajarayuni Valasa" },
      { property: "og:description", content: "Gedela Vedhi Connect is a modern, responsive full-stack community website for Gedela Vedhi Youth." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Gedela Vedhi Youth — Community of Gajarayuni Valasa" },
      { name: "description", content: "Gedela Vedhi Connect is a modern, responsive full-stack community website for Gedela Vedhi Youth." },
      { name: "twitter:description", content: "Gedela Vedhi Connect is a modern, responsive full-stack community website for Gedela Vedhi Youth." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/92224b4a-975e-4d39-990e-f03f51062b0b/id-preview-5fa6b858--67671283-d01f-4a07-b163-36bac7142ddb.lovable.app-1778471545931.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/92224b4a-975e-4d39-990e-f03f51062b0b/id-preview-5fa6b858--67671283-d01f-4a07-b163-36bac7142ddb.lovable.app-1778471545931.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Fira+Sans:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <div className="flex min-h-screen flex-col bg-background">
              <Navbar />
              <AnnouncementBar />
              <main className="flex-1">
                <Outlet />
              </main>
              
              <Footer />
            </div>
            <WhatsAppFloat />
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
