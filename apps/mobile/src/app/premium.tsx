import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { supabase, Row } from "../lib/supabase";
import { reportError, useSession } from "../lib/session";
import { Button, Card, Field, Page, s, Txt } from "../features/ui";
import { PREMIUM_BENEFITS, formatPrice } from "../shared";
export default function Premium() {
  const { profile, refresh } = useSession();
  const merchant = profile?.role === "lojista";
  const [plans, setPlans] = useState<Row<"store_plans">[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [plan, setPlan] = useState("profissional");
  const [method, setMethod] = useState<"pix" | "cartao">("pix");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [card, setCard] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  useEffect(() => {
    if (!merchant || !profile) return;
    void supabase
      .from("store_plans")
      .select("*")
      .order("ordem")
      .then(({ data, error }) => {
        if (error) reportError(error);
        setPlans(data ?? []);
      });
    void supabase
      .from("stores")
      .select("id")
      .eq("owner_id", profile.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setStoreId(data?.id ?? null));
  }, [merchant, profile]);
  const pay = async () => {
    if (!profile) return;
    if (merchant && !storeId)
      return Alert.alert(
        "Cadastre sua loja primeiro",
        "Salve os dados da loja e volte para escolher o plano.",
      );
    if (
      method === "cartao" &&
      (card.replace(/\D/g, "").length < 13 ||
        !name.trim() ||
        !/^\d{2}\/\d{2}$/.test(expiry) ||
        cvv.length < 3)
    )
      return Alert.alert(
        "Confira o cartão de demonstração",
        "Preencha número, titular, validade MM/AA e CVV. Nenhuma cobrança real será feita.",
      );
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const { error } = merchant
      ? await supabase.rpc("assinar_plano_loja", {
          p_store_id: storeId!,
          p_plan_id: plan,
          p_metodo: method,
        })
      : await supabase.rpc("assinar_premium", { p_metodo: method });
    setBusy(false);
    if (error) reportError(error, merchant);
    else {
      await refresh();
      setSuccess(true);
    }
  };
  const cancel = () =>
    Alert.alert(
      "Cancelar assinatura?",
      "Os benefícios seguem as regras do plano contratado.",
      [
        { text: "Manter", style: "cancel" },
        {
          text: "Cancelar assinatura",
          style: "destructive",
          onPress: () => {
            void (
              merchant && storeId
                ? supabase.rpc("cancelar_plano_loja", { p_store_id: storeId })
                : supabase.rpc("cancelar_premium")
            ).then(async ({ error }) => {
              if (error) reportError(error);
              else {
                await refresh();
                Alert.alert("Assinatura cancelada");
                router.back();
              }
            });
          },
        },
      ],
    );
  if (success)
    return (
      <Page>
        <Txt title>Deu tudo certo! ✨</Txt>
        <Card>
          <Txt>Seu plano já está ativo. Aproveite todos os benefícios.</Txt>
          <Button label="Continuar" onPress={() => router.back()} />
        </Card>
      </Page>
    );
  return (
    <Page>
      <Txt title>
        {merchant
          ? "Seu negócio merece crescer"
          : "Mais cuidado. Mais vantagens."}
      </Txt>
      <Txt muted>Checkout de demonstração · nenhuma cobrança real.</Txt>
      {merchant ? (
        plans.map((p) => (
          <Card key={p.id}>
            <Txt title>
              {p.nome} · {formatPrice(p.preco_centavos)}/mês
            </Txt>
            {p.beneficios.map((b) => (
              <Txt key={b}>✓ {b}</Txt>
            ))}
            <Button
              secondary={plan !== p.id}
              label={plan === p.id ? "✓ Selecionado" : "Escolher plano"}
              onPress={() => setPlan(p.id)}
            />
          </Card>
        ))
      ) : (
        <Card>
          <Txt title>EasyPet Premium · R$ 9,90/mês</Txt>
          {PREMIUM_BENEFITS.map((b) => (
            <View key={b.titulo}>
              <Txt>✓ {b.titulo}</Txt>
              <Txt muted>{b.descricao}</Txt>
            </View>
          ))}
        </Card>
      )}
      <View style={s.row}>
        <Button
          secondary={method !== "pix"}
          label="Pix"
          onPress={() => setMethod("pix")}
        />
        <Button
          secondary={method !== "cartao"}
          label="Cartão"
          onPress={() => setMethod("cartao")}
        />
      </View>
      {method === "pix" ? (
        <Card>
          <Txt title>Pix de demonstração</Txt>
          <View
            style={{
              alignSelf: "center",
              padding: 16,
              borderWidth: 8,
              borderColor: "#1E1B18",
            }}
          >
            {Array.from({ length: 9 }, (_, y) => (
              <View key={y} style={{ flexDirection: "row" }}>
                {Array.from({ length: 9 }, (_, x) => (
                  <View
                    key={x}
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor:
                        (x * 7 + y * 3 + x * y) % 5 < 3 ? "#1E1B18" : "white",
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
          <Txt muted>QR ilustrativo, sem valor de pagamento.</Txt>
          <Button
            secondary
            label="Copiar Pix simulado"
            onPress={() =>
              void Clipboard.setStringAsync("EASYPET-DEMO-SEM-VALOR").then(() =>
                Alert.alert("Pix de demonstração copiado"),
              )
            }
          />
        </Card>
      ) : (
        <Card>
          <Field
            label="Número fictício do cartão"
            keyboardType="number-pad"
            value={card}
            onChangeText={setCard}
          />
          <Field label="Titular" value={name} onChangeText={setName} />
          <Field
            label="Validade MM/AA"
            value={expiry}
            onChangeText={setExpiry}
          />
          <Field
            label="CVV"
            keyboardType="number-pad"
            secureTextEntry
            value={cvv}
            onChangeText={setCvv}
          />
        </Card>
      )}
      <Button
        disabled={busy}
        label={busy ? "Processando…" : "Confirmar assinatura simulada"}
        onPress={() => void pay()}
      />
      {((merchant && storeId) || profile?.plano === "premium") && (
        <Button secondary label="Cancelar assinatura atual" onPress={cancel} />
      )}
    </Page>
  );
}
