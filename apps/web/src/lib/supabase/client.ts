import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/shared";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Cliente Supabase do navegador (sessão em cookies, compartilhada com o proxy). */
export function supabaseBrowser() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}

export const STORE_IMAGES_BUCKET = "store-images";
