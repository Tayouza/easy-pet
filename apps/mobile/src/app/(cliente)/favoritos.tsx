import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { reportError, useSession } from "../../lib/session";
import { Busy, Empty, Page, Txt } from "../../features/ui";
import { Store, StoreCard } from "../../features/stores";
export default function Favorites() {
  const { profile } = useSession();
  const [rows, setRows] = useState<Store[]>([]);
  const [busy, setBusy] = useState(true);
  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      setBusy(true);
      void supabase
        .from("favorites")
        .select("stores(*)")
        .eq("user_id", profile.id)
        .then(({ data, error }) => {
          if (error) reportError(error);
          else
            setRows((data ?? []).flatMap((r) => (r.stores ? [r.stores] : [])));
          setBusy(false);
        });
    }, [profile]),
  );
  return busy ? (
    <Busy />
  ) : (
    <Page>
      <Txt title>Seus lugares queridos</Txt>
      <Txt muted>
        {profile?.plano === "premium"
          ? "Favoritos ilimitados"
          : `${rows.length} de 5 favoritos gratuitos`}
      </Txt>
      {rows.length ? (
        rows.map((st) => <StoreCard key={st.id} store={st} />)
      ) : (
        <Empty text="Toque no coração de uma loja para guardar aqui." />
      )}
    </Page>
  );
}
