import { resolveStorageUrl } from "../shared";

/** Resolve local Storage origins only when displaying, preserving the database value. */
export function imageUrl(url: string | null | undefined) {
  return resolveStorageUrl(url, process.env.EXPO_PUBLIC_SUPABASE_URL);
}
