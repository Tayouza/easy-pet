import { resolveStorageUrl } from "@/shared";

/** URLs do Storage gravadas com host local/LAN passam a usar a origem de NEXT_PUBLIC_SUPABASE_URL. */
export const assetUrl = (url: string | null | undefined) => resolveStorageUrl(url, process.env.NEXT_PUBLIC_SUPABASE_URL);
