import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { supabase, Row } from "../lib/supabase";
import { reportError, useSession } from "../lib/session";
export function useStore() {
  const { profile } = useSession();
  const [store, setStore] = useState<Row<"stores"> | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("owner_id", profile.id)
      .order("created_at")
      .limit(1)
      .maybeSingle();
    if (error) reportError(error, true);
    setStore(data);
    setLoading(false);
  }, [profile]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  return { store, loading, load };
}
