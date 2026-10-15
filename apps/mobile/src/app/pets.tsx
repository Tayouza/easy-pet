import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase, Row } from "../lib/supabase";
import { reportError, useSession } from "../lib/session";
import { Button, Busy, Card, Empty, Field, Page, Txt } from "../features/ui";
import { formatDate } from "../shared";
type Pet = Row<"pets"> & { pet_vaccines: Row<"pet_vaccines">[] };
export default function Pets() {
  const { profile } = useSession();
  const [pets, setPets] = useState<Pet[]>([]);
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("Cachorro");
  const [raca, setRaca] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [peso, setPeso] = useState("");
  const [petId, setPetId] = useState<string | null>(null);
  const [vacina, setVacina] = useState("");
  const [aplicada, setAplicada] = useState("");
  const [proxima, setProxima] = useState("");
  const load = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("pets")
      .select("*,pet_vaccines(*)")
      .eq("owner_id", profile.id);
    if (error) reportError(error);
    else setPets(data ?? []);
    setBusy(false);
  }, [profile]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  if (busy) return <Busy />;
  const save = async () => {
    if (!profile || !nome.trim()) return Alert.alert("Informe o nome do pet");
    const payload = {
      owner_id: profile.id,
      nome,
      especie,
      raca,
      nascimento: nascimento || null,
      peso_kg: peso ? Number(peso.replace(",", ".")) : null,
    };
    const { error } = editing
      ? await supabase.from("pets").update(payload).eq("id", editing)
      : await supabase.from("pets").insert(payload);
    if (error) reportError(error);
    else {
      setNome("");
      setEditing(null);
      await load();
    }
  };
  return (
    <Page>
      <Txt title>Saúde sempre por perto 🐾</Txt>
      {!pets.length && <Empty text="Cadastre seu primeiro companheiro." />}
      {pets.map((p) => {
        const next = [...p.pet_vaccines]
          .filter((v) => v.proxima_dose)
          .sort((a, b) => a.proxima_dose!.localeCompare(b.proxima_dose!))[0];
        return (
          <Card key={p.id}>
            <Txt title>{p.nome}</Txt>
            <Txt muted>
              {p.especie} · {p.raca ?? "Raça não informada"}
              {p.peso_kg ? ` · ${p.peso_kg} kg` : ""}
            </Txt>
            {next && (
              <Card>
                <Txt>💉 Próxima dose: {next.nome}</Txt>
                <Txt>{formatDate(next.proxima_dose)}</Txt>
              </Card>
            )}
            {p.pet_vaccines.map((v) => (
              <Card key={v.id}>
                <Txt>{v.nome}</Txt>
                <Txt muted>
                  Aplicada: {formatDate(v.aplicada_em)} · Reforço:{" "}
                  {formatDate(v.proxima_dose) || "Não informado"}
                </Txt>
                <Button
                  secondary
                  label="Excluir vacina"
                  onPress={() =>
                    Alert.alert("Excluir vacina?", v.nome, [
                      { text: "Voltar" },
                      {
                        text: "Excluir",
                        style: "destructive",
                        onPress: () =>
                          void supabase
                            .from("pet_vaccines")
                            .delete()
                            .eq("id", v.id)
                            .then(({ error }) => {
                              if (error) reportError(error);
                              else void load();
                            }),
                      },
                    ])
                  }
                />
              </Card>
            ))}
            <Button
              secondary
              label="Adicionar vacina"
              onPress={() => setPetId(p.id)}
            />
            <Button
              secondary
              label="Editar pet"
              onPress={() => {
                setEditing(p.id);
                setNome(p.nome);
                setEspecie(p.especie);
                setRaca(p.raca ?? "");
                setNascimento(p.nascimento ?? "");
                setPeso(String(p.peso_kg ?? ""));
              }}
            />
            <Button
              secondary
              label="Excluir pet"
              onPress={() =>
                Alert.alert(
                  "Excluir pet?",
                  `A carteirinha de ${p.nome} será excluída.`,
                  [
                    { text: "Voltar" },
                    {
                      text: "Excluir",
                      style: "destructive",
                      onPress: () =>
                        void supabase
                          .from("pets")
                          .delete()
                          .eq("id", p.id)
                          .then(({ error }) => {
                            if (error) reportError(error);
                            else void load();
                          }),
                    },
                  ],
                )
              }
            />
          </Card>
        );
      })}
      {petId && (
        <Card>
          <Txt title>Nova vacina</Txt>
          <Field
            label="Nome da vacina"
            value={vacina}
            onChangeText={setVacina}
          />
          <Field
            label="Aplicada em (AAAA-MM-DD)"
            value={aplicada}
            onChangeText={setAplicada}
          />
          <Field
            label="Próxima dose (AAAA-MM-DD, opcional)"
            value={proxima}
            onChangeText={setProxima}
          />
          <Button
            label="Salvar vacina"
            onPress={() => {
              if (!vacina || !aplicada)
                return Alert.alert("Preencha nome e aplicação");
              void supabase
                .from("pet_vaccines")
                .insert({
                  pet_id: petId,
                  nome: vacina,
                  aplicada_em: aplicada,
                  proxima_dose: proxima || null,
                })
                .then(({ error }) => {
                  if (error) reportError(error);
                  else {
                    setPetId(null);
                    setVacina("");
                    void load();
                  }
                });
            }}
          />
          <Button secondary label="Voltar" onPress={() => setPetId(null)} />
        </Card>
      )}
      <Card>
        <Txt title>{editing ? "Editar carteirinha" : "Adicionar pet"}</Txt>
        <Field label="Nome" value={nome} onChangeText={setNome} />
        <Field label="Espécie" value={especie} onChangeText={setEspecie} />
        <Field label="Raça" value={raca} onChangeText={setRaca} />
        <Field
          label="Nascimento (AAAA-MM-DD)"
          value={nascimento}
          onChangeText={setNascimento}
        />
        <Field
          label="Peso em kg"
          keyboardType="decimal-pad"
          value={peso}
          onChangeText={setPeso}
        />
        <Button label="Salvar pet" onPress={() => void save()} />
      </Card>
    </Page>
  );
}
