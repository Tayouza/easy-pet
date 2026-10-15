import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { reportError, useSession } from "../lib/session";
import { Button, Card, Field, Page, Txt } from "./ui";
export default function Profile() {
  const { profile, refresh } = useSession();
  const [nome, setNome] = useState(profile?.nome ?? "");
  const [telefone, setTelefone] = useState(profile?.telefone ?? "");
  const [plan, setPlan] = useState("Sem plano");
  useEffect(() => {
    if (profile?.role === "lojista")
      void supabase
        .from("stores")
        .select("subscriptions(plan_id,status)")
        .eq("owner_id", profile.id)
        .then(({ data }) => {
          setPlan(
            data?.[0]?.subscriptions.find((s) => s.status === "ativa")
              ?.plan_id ?? "Sem plano",
          );
        });
  }, [profile]);
  if (!profile) return null;
  const merchant = profile.role === "lojista";
  return (
    <Page>
      <Txt title>Olá, {profile.nome.split(" ")[0]} 🐾</Txt>
      <Card>
        <Txt>{profile.email}</Txt>
        <Field label="Nome" value={nome} onChangeText={setNome} />
        <Field
          label="Telefone"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />
        <Button
          label="Salvar meus dados"
          onPress={() =>
            void supabase
              .from("profiles")
              .update({ nome, telefone })
              .eq("id", profile.id)
              .then(async ({ error }) => {
                if (error) reportError(error);
                else {
                  await refresh();
                  Alert.alert("Dados atualizados");
                }
              })
          }
        />
      </Card>
      <Card>
        <Txt title>
          {merchant
            ? `Plano ${plan}`
            : profile.plano === "premium"
              ? "✨ Você é Premium"
              : "Seu plano gratuito"}
        </Txt>
        <Txt muted>
          {merchant
            ? "Seu negócio mais perto dos tutores."
            : "Cuide de quem faz sua vida mais feliz."}
        </Txt>
        <Button
          label={
            merchant
              ? "Trocar plano"
              : profile.plano === "premium"
                ? "Gerenciar Premium"
                : "Seja Premium · R$ 9,90/mês"
          }
          onPress={() => router.push("/premium")}
        />
      </Card>
      {!merchant && (
        <Button
          secondary
          label="Meus pets · carteirinha e vacinas"
          onPress={() =>
            router.push(profile.plano === "premium" ? "/pets" : "/premium")
          }
        />
      )}
      <Button
        secondary
        label="Sair da conta"
        onPress={() =>
          void supabase.auth.signOut().then(({ error }) => {
            if (error) reportError(error);
            else router.replace("/");
          })
        }
      />
    </Page>
  );
}
