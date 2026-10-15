import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { reportError } from "../../lib/session";
import { Busy, Button, Empty, Page, Txt } from "../../features/ui";
import { Coupon, CouponCard } from "../../features/coupons";
export default function Coupons() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const load = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("all_coupons");
    setFailed(!!error);
    if (error) reportError(error);
    else setRows(data ?? []);
    setBusy(false);
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  return busy ? (
    <Busy />
  ) : (
    <Page>
      <Txt title>Vantagens para vocês ✨</Txt>
      <Txt muted>Mais carinho, por menos. Descubra os cupons da cidade.</Txt>
      {failed ? (
        <Button label="Tentar novamente" onPress={() => void load()} />
      ) : rows.length ? (
        rows.map((c) => <CouponCard key={c.id} coupon={c} />)
      ) : (
        <Empty text="Novos cupons chegam em breve." />
      )}
    </Page>
  );
}
