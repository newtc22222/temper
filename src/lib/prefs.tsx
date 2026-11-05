import { createContext, useContext, type ReactNode } from "react";

export type Locale = "en" | "vi";
export type Theme = "light" | "dark";

export type Prefs = {
  locale: Locale;
  theme: Theme;
};

export const LOCALE_COOKIE = "temper-locale";
export const THEME_COOKIE = "temper-theme";

const YEAR = 60 * 60 * 24 * 365;

export function parsePrefs(cookieHeader: string | null | undefined): Prefs {
  const jar = readCookieJar(cookieHeader);
  return {
    locale: jar[LOCALE_COOKIE] === "vi" ? "vi" : "en",
    theme: jar[THEME_COOKIE] === "dark" ? "dark" : "light",
  };
}

export function prefsFromMatches(
  matches: ReadonlyArray<{ routeId: string; loaderData?: unknown }>,
): Prefs {
  const root = matches.find((match) => match.routeId === "__root__");
  const data = root?.loaderData;
  if (!data || typeof data !== "object") return { locale: "en", theme: "light" };
  const record = data as Partial<Prefs>;
  return {
    locale: record.locale === "vi" ? "vi" : "en",
    theme: record.theme === "dark" ? "dark" : "light",
  };
}

function readCookieJar(header: string | null | undefined): Record<string, string> {
  const jar: Record<string, string> = {};
  if (!header) return jar;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) jar[key] = decodeURIComponent(value);
  }
  return jar;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${YEAR}; SameSite=Lax`;
}

type PrefsContextValue = Prefs & {
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({
  prefs,
  onChange,
  children,
}: {
  prefs: Prefs;
  onChange: (next: Prefs) => void;
  children: ReactNode;
}) {
  const setLocale = (locale: Locale) => {
    writeCookie(LOCALE_COOKIE, locale);
    onChange({ ...prefs, locale });
  };

  const setTheme = (theme: Theme) => {
    writeCookie(THEME_COOKIE, theme);
    onChange({ ...prefs, theme });
  };

  return (
    <PrefsContext.Provider value={{ ...prefs, setLocale, setTheme }}>{children}</PrefsContext.Provider>
  );
}

export function usePrefs(): PrefsContextValue {
  const value = useContext(PrefsContext);
  if (!value) throw new Error("usePrefs must be used inside PrefsProvider");
  return value;
}
