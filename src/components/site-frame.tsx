import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { lessons } from "@/content/lessons";
import { useUi } from "@/content/localize";
import { doneCount, useCourseProgress } from "@/lib/course-progress";
import { usePrefs } from "@/lib/prefs";
import clsx from "clsx";

function Mark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-ink" aria-hidden="true">
      <rect x="1" y="3" width="14" height="2" className="fill-current" />
      <rect x="1" y="8" width="9" height="2" className="fill-oxide" />
    </svg>
  );
}

function IconButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-11 w-11 items-center justify-center text-ink hover:text-oxide"
    >
      {children}
    </button>
  );
}

function Sun() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <circle cx="8" cy="8" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1.4v1.7M8 12.9v1.7M1.4 8h1.7M12.9 8h1.7M3.1 3.1l1.2 1.2M11.7 11.7l1.2 1.2M3.1 12.9l1.2-1.2M11.7 4.3l1.2-1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <path d="M9.1 1.6a5.4 5.4 0 1 0 5.2 7 4.3 4.3 0 1 1-5.2-7z" className="fill-current" />
    </svg>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  const ui = useUi();
  const { locale, theme, setLocale, setTheme } = usePrefs();
  const { answers } = useCourseProgress();
  const done = doneCount(answers);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onPath = pathname === "/path" || pathname.startsWith("/lessons");

  const nav = [
    { to: "/path" as const, label: ui.path, active: onPath },
    { to: "/glossary" as const, label: ui.glossary, active: pathname === "/glossary" },
    { to: "/pocket" as const, label: ui.pocket, active: pathname === "/pocket" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:bg-card focus:px-3 focus:py-2">
        {ui.skip}
      </a>
      <header className="sticky top-0 z-20 border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-5 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Link to="/" className="inline-flex h-14 items-center gap-2 font-display text-xl text-ink">
            <Mark />
            {ui.siteName}
          </Link>
          <nav className="col-span-2 -mx-1 flex items-center gap-1 overflow-x-auto pb-2 md:col-span-1 md:col-start-2 md:row-start-1 md:mx-0 md:pb-0" aria-label={ui.path}>
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  "inline-flex h-11 shrink-0 items-center border-b-2 px-2 md:h-14",
                  item.active ? "border-oxide text-oxide" : "border-transparent text-ink-soft",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="col-start-2 row-start-1 flex items-center justify-self-end md:col-start-3">
            <IconButton
              pressed={theme === "dark"}
              label={`${ui.themeLabel}: ${theme === "dark" ? ui.themeDark : ui.themeLight}`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Moon /> : <Sun />}
            </IconButton>
            <IconButton
              pressed={locale === "vi"}
              label={`${ui.langLabel}: ${locale === "vi" ? "VI" : "EN"}`}
              onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
            >
              <span className="font-mono text-[11px] tracking-wide">{locale === "vi" ? "VI" : "EN"}</span>
            </IconButton>
            <p className="ml-1 font-mono text-sm tabular-nums text-muted" aria-label={`${done}/${lessons.length}`}>
              <span className="text-ink">{done}</span>/{lessons.length}
            </p>
          </div>
        </div>
      </header>
      <div id="content" className="flex-1">
        {children}
      </div>
      <footer className="border-t border-line px-5 py-6">
        <p className="mx-auto max-w-6xl text-sm text-muted">{ui.footer}</p>
      </footer>
    </div>
  );
}
