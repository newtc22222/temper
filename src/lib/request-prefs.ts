import { createServerFn } from "@tanstack/react-start";
import { parsePrefs, type Prefs } from "@/lib/prefs";

export const readRequestPrefs = createServerFn({ method: "GET" }).handler(async (): Promise<Prefs> => {
  const { requestCookieHeader } = await import("./request-cookie.server");
  return parsePrefs(requestCookieHeader());
});
