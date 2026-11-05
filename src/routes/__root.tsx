import { useState } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteFrame } from "@/components/site-frame";
import { copy } from "@/content/ui";
import { parsePrefs, PrefsProvider, type Prefs } from "@/lib/prefs";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: async () => {
    if (typeof document !== "undefined") return parsePrefs(document.cookie);
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    return parsePrefs(getRequestHeader("cookie"));
  },
  head: ({ loaderData }) => {
    const prefs = loaderData ?? { locale: "en" as const, theme: "light" as const };
    const ui = copy[prefs.locale];
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: `${ui.siteName} — ${ui.kicker}` },
        {
          name: "description",
          content:
            prefs.locale === "vi"
              ? "Một khóa đọc ngắn về framework web Axum. Ghi chú trong bộ nhớ: tạo, liệt kê, lấy một cái."
              : "A short Axum course for readers who already know Rust. In-memory notes: create, list, get one.",
        },
        { name: "theme-color", content: prefs.theme === "dark" ? "#141210" : "#F3EFE6" },
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      ],
    };
  },
  component: Root,
});

function Root() {
  const loaded = Route.useLoaderData();
  const [prefs, setPrefs] = useState<Prefs>(loaded);
  return (
    <html lang={prefs.locale === "vi" ? "vi" : "en"} data-theme={prefs.theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-paper text-ink font-sans antialiased" suppressHydrationWarning>
        <PreviewHostBridge />
        <PrefsProvider prefs={prefs} onChange={setPrefs}>
          <AuthProvider>
            <SiteFrame>
              <Outlet />
            </SiteFrame>
          </AuthProvider>
        </PrefsProvider>
        <Scripts />
      </body>
    </html>
  );
}
