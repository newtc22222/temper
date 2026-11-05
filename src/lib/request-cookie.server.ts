import { getRequestHeader } from "@tanstack/react-start/server";

export function requestCookieHeader() {
  return getRequestHeader("cookie");
}
