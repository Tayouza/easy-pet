import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/shared";

// Áreas protegidas e o papel exigido (checagem otimista; o RLS garante no banco).
const PROTECTED: { prefix: string; roles: Array<Database["public"]["Enums"]["user_role"]> | null }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/painel", roles: ["lojista", "admin"] },
  { prefix: "/favoritos", roles: null },
  { prefix: "/meus-pets", roles: null },
  { prefix: "/conta", roles: null },
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Renova a sessão (não remova: mantém os cookies de auth atualizados).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const rule = PROTECTED.find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`));
  if (!rule) return response;

  const redirectTo = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    if (to === "/entrar") url.searchParams.set("next", path);
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user) return redirectTo("/entrar");
  if (rule.roles) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !rule.roles.includes(profile.role)) {
      return redirectTo(profile?.role === "lojista" ? "/painel" : profile?.role === "admin" ? "/admin" : "/");
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
