import { useCallback, useState } from "react";
import { Alert, Switch } from "react-native";
import { useFocusEffect } from "expo-router";
import { useStore } from "./merchant";
import { supabase, Row } from "../lib/supabase";
import { reportError } from "../lib/session";
import { Button, Busy, Card, Empty, Field, Page, Txt } from "./ui";
import { formatPrice } from "../shared";
type Entry = Row<"store_items"> | Row<"coupons">;
export default function Catalog({ coupons = false }: { coupons?: boolean }) {
  const { store, loading } = useStore();
  const [rows, setRows] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [price, setPrice] = useState("");
  const [tipo, setTipo] = useState<"produto" | "servico">("produto");
  const [aPartir, setAPartir] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [validade, setValidade] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!store) return;
    const { data, error } = coupons
      ? await supabase
          .from("coupons")
          .select("*")
          .eq("store_id", store.id)
          .order("created_at", { ascending: false })
      : await supabase
          .from("store_items")
          .select("*")
          .eq("store_id", store.id)
          .order("created_at", { ascending: false });
    if (error) reportError(error, true);
    else setRows(data ?? []);
  }, [store, coupons]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const clear = () => {
    setEditing(null);
    setNome("");
    setDescricao("");
    setPrice("");
    setCodigo("");
    setValidade("");
    setAtivo(true);
  };
  const save = async () => {
    if (!store) return;
    if (!nome.trim() || (coupons && (!codigo.trim() || !price.trim())))
      return Alert.alert(
        "Confira os dados",
        "Preencha nome, código e desconto do cupom.",
      );
    const cents = price
      ? Math.round(Number(price.replace(",", ".")) * 100)
      : null;
    if (!coupons && cents !== null && (!Number.isFinite(cents) || cents < 0))
      return Alert.alert("Informe um preço válido");
    setBusy(true);
    let result;
    if (coupons) {
      const payload = {
        store_id: store.id,
        titulo: nome,
        descricao,
        codigo,
        desconto: price,
        validade: validade || null,
        ativo,
      };
      result = editing
        ? await supabase.from("coupons").update(payload).eq("id", editing)
        : await supabase.from("coupons").insert(payload);
    } else {
      const payload = {
        store_id: store.id,
        nome,
        descricao,
        tipo,
        preco_centavos: cents,
        preco_a_partir: aPartir,
        ativo,
      };
      result = editing
        ? await supabase.from("store_items").update(payload).eq("id", editing)
        : await supabase.from("store_items").insert(payload);
    }
    setBusy(false);
    if (result.error) reportError(result.error, true);
    else {
      clear();
      await load();
      Alert.alert("Salvo com sucesso");
    }
  };
  if (loading) return <Busy />;
  if (!store)
    return (
      <Page>
        <Empty text="Cadastre sua loja na aba Minha loja para começar." />
      </Page>
    );
  return (
    <Page>
      <Txt title>
        {coupons ? "Vantagens que aproximam" : "Produtos e serviços"}
      </Txt>
      {!rows.length && <Empty text="Seu catálogo começa aqui." />}
      {rows.map((r) => (
        <Card key={r.id}>
          <Txt title>{"titulo" in r ? r.titulo : r.nome}</Txt>
          <Txt muted>
            {"desconto" in r
              ? `${r.desconto} · ${r.codigo}`
              : formatPrice(r.preco_centavos, r.preco_a_partir)}{" "}
            · {r.ativo ? "Ativo" : "Inativo"}
          </Txt>
          <Button
            secondary
            label="Editar"
            onPress={() => {
              setEditing(r.id);
              setDescricao(r.descricao);
              setAtivo(r.ativo);
              if ("titulo" in r) {
                setNome(r.titulo);
                setCodigo(r.codigo);
                setPrice(r.desconto);
                setValidade(r.validade ?? "");
              } else {
                setNome(r.nome);
                setPrice(
                  r.preco_centavos === null
                    ? ""
                    : String(r.preco_centavos / 100),
                );
                setTipo(r.tipo);
                setAPartir(r.preco_a_partir);
              }
            }}
          />
          <Button
            secondary
            label="Excluir"
            onPress={() =>
              Alert.alert("Excluir cadastro?", "Esta ação remove o registro.", [
                { text: "Voltar" },
                {
                  text: "Excluir",
                  style: "destructive",
                  onPress: () => {
                    void (
                      coupons
                        ? supabase.from("coupons").delete().eq("id", r.id)
                        : supabase.from("store_items").delete().eq("id", r.id)
                    ).then(({ error }) => {
                      if (error) reportError(error, true);
                      else void load();
                    });
                  },
                },
              ])
            }
          />
        </Card>
      ))}
      <Card>
        <Txt title>
          {editing ? "Editar cadastro" : coupons ? "Novo cupom" : "Novo item"}
        </Txt>
        <Field
          label={coupons ? "Título" : "Nome"}
          value={nome}
          onChangeText={setNome}
        />
        <Field
          label="Descrição"
          value={descricao}
          multiline
          onChangeText={setDescricao}
        />
        {coupons ? (
          <>
            <Field
              label="Código"
              autoCapitalize="characters"
              value={codigo}
              onChangeText={setCodigo}
            />
            <Field
              label="Desconto (ex.: 15% OFF)"
              value={price}
              onChangeText={setPrice}
            />
            <Field
              label="Validade (AAAA-MM-DD)"
              value={validade}
              onChangeText={setValidade}
            />
          </>
        ) : (
          <>
            <Button
              secondary
              label={
                tipo === "produto"
                  ? "Produto · tocar para Serviço"
                  : "Serviço · tocar para Produto"
              }
              onPress={() =>
                setTipo(tipo === "produto" ? "servico" : "produto")
              }
            />
            <Field
              label="Preço em R$ (vazio = sob consulta)"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
            <Txt>Preço a partir de</Txt>
            <Switch value={aPartir} onValueChange={setAPartir} />
          </>
        )}
        <Txt>Ativo</Txt>
        <Switch value={ativo} onValueChange={setAtivo} />
        <Button
          disabled={busy}
          label={busy ? "Salvando…" : "Salvar"}
          onPress={() => void save()}
        />
        {editing && (
          <Button secondary label="Cancelar edição" onPress={clear} />
        )}
      </Card>
    </Page>
  );
}
