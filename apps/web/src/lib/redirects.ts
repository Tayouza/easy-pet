import type { UserRole } from "./types";

export function homeForRole(role: UserRole | null | undefined) {
  if (role === "admin") return "/admin";
  if (role === "lojista") return "/painel";
  return "/explorar";
}

/** Só aceita caminhos internos. */
export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}
