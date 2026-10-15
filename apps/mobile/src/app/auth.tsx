import { useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams, Redirect } from "expo-router";
import { supabase } from "../lib/supabase";
import { reportError, useSession } from "../lib/session";
import { Button, Card, Field, Page, Txt } from "../features/ui";
export default function Auth() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { profile } = useSession();
  const [signup, setSignup] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  if (profile) return <Redirect href="/" />;
  const submit = async () => {
    if (!email.includes("@") || password.length < 6 || (signup && !nome.trim()))
      return Alert.alert(
        "Confira os dados",
        "Informe nome, e-mail e senha de pelo menos 6 caracteres.",
      );
    setBusy(true);
    const { data, error } = signup
      ? await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { nome, role: role === "lojista" ? "lojista" : "cliente" },
          },
        })
      : await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
    setBusy(false);
    if (error) reportError(error);
    else if (signup && !data.session)
      Alert.alert(
        "Confirme seu e-mail",
        "Enviamos um link para ativar sua conta.",
      );
    else router.replace("/");
  };
  return (
    <Page>
      <Txt title>
        {signup ? "Faça parte da família" : "Que bom ter você aqui!"}
      </Txt>
      <Txt muted>
        {role === "lojista"
          ? "Seu negócio mais perto de quem ama pets."
          : "Os melhores cuidados estão pertinho."}
      </Txt>
      <Card>
        {signup && (
          <Field label="Seu nome" value={nome} onChangeText={setNome} />
        )}
        <Field
          label="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <Field
          label="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button
          disabled={busy}
          label={busy ? "Aguarde…" : signup ? "Criar conta" : "Entrar"}
          onPress={() => void submit()}
        />
        <Button
          secondary
          label={signup ? "Já tenho uma conta" : "Quero me cadastrar"}
          onPress={() => setSignup(!signup)}
        />
      </Card>
    </Page>
  );
}
