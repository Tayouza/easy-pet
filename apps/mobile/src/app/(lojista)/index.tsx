import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useStore } from "../../features/merchant";
import { Button, Busy, Card, Page, Txt } from "../../features/ui";
import { supabase } from "../../lib/supabase";
import { reportError } from "../../lib/session";
type Stats = {
  views: number;
  whatsapp: number;
  rota: number;
  telefone: number;
  favoritos: number;
  serie: { dia: string; views: number; contatos: number }[];
};
export default function Dashboard() {
  const { store, loading } = useStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [fetching, setFetching] = useState(true);
  useEffect(() => {
    if (!store) return;
    void (async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("store_plans(estatisticas)")
        .eq("store_id", store.id)
        .eq("status", "ativa")
        .maybeSingle();
      if (error) reportError(error, true);
      const ok = !!data?.store_plans?.estatisticas;
      setAllowed(ok);
      if (ok) {
        const result = await supabase.rpc("store_stats", {
          p_store_id: store.id,
          p_dias: 30,
        });
        if (result.error) reportError(result.error, true);
        else setStats(result.data as Stats);
      }
      setFetching(false);
    })();
  }, [store]);
  if (loading || (store && fetching)) return <Busy />;
  return (
    <Page>
      <Txt title>Seu negócio, cada vez mais perto 🐾</Txt>
      <Card>
        <Txt title>{store?.nome ?? "Vamos começar?"}</Txt>
        <Txt muted>
          {store
            ? `Status da loja: ${store.status}`
            : "Cadastre sua loja para aparecer no EasyPet."}
        </Txt>
        {store?.motivo_status && <Txt>{store.motivo_status}</Txt>}
        <Button
          label="Editar minha loja"
          onPress={() => router.push("/(lojista)/loja")}
        />
      </Card>
      {!allowed ? (
        <Card>
          <Txt title>Conheça seus resultados</Txt>
          <Txt muted>
            Estatísticas de visitas e contatos nos planos Profissional e
            Destaque.
          </Txt>
          <Button label="Ver planos" onPress={() => router.push("/premium")} />
        </Card>
      ) : (
        stats && (
          <>
            <Txt title>Últimos 30 dias</Txt>
            {(
              [
                ["Visualizações", stats.views],
                ["WhatsApp", stats.whatsapp],
                ["Rotas", stats.rota],
                ["Ligações", stats.telefone],
                ["Favoritos", stats.favoritos],
              ] as const
            ).map(([label, value]) => (
              <Card key={label}>
                <Txt muted>{label}</Txt>
                <Txt title>{value}</Txt>
              </Card>
            ))}
            <Card>
              <Txt title>Visitas por dia</Txt>
              <View
                accessibilityLabel="Gráfico de visualizações dos últimos 30 dias"
                style={{
                  height: 140,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 3,
                }}
              >
                {stats.serie.map((d) => (
                  <View
                    key={d.dia}
                    accessibilityLabel={`${d.dia}: ${d.views} visitas`}
                    style={{
                      flex: 1,
                      height: Math.max(
                        3,
                        (d.views /
                          Math.max(...stats.serie.map((v) => v.views), 1)) *
                          120,
                      ),
                      backgroundColor: "#FF6B35",
                      borderRadius: 3,
                    }}
                  />
                ))}
              </View>
              <Txt muted>
                {stats.serie[0]?.dia} — {stats.serie.at(-1)?.dia}
              </Txt>
            </Card>
          </>
        )
      )}
    </Page>
  );
}
