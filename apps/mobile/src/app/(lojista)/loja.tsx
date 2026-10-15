import { imageUrl } from "../../lib/images";
import { useState } from "react";
import { Alert, ScrollView, Switch, View } from "react-native";
import EasyMap from "../../features/map/EasyMap";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useStore } from "../../features/merchant";
import { supabase } from "../../lib/supabase";
import { reportError, useSession } from "../../lib/session";
import { Button, Busy, Card, Field, Page, Txt } from "../../features/ui";
import { CATEGORIES, DEFAULT_LOCATION, Horarios, WEEKDAYS } from "../../shared";
type Form = {
  nome: string;
  descricao: string;
  endereco: string;
  bairro: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  site: string;
  categoria_id: string;
  tags: string;
  lat: number;
  lng: number;
  aberto_24h: boolean;
  horarios: Horarios;
  capa_url: string | null;
  logo_url: string | null;
  fotos: string[];
};
const initial: Form = {
  nome: "",
  descricao: "",
  endereco: "",
  bairro: "",
  telefone: "",
  whatsapp: "",
  instagram: "",
  site: "",
  categoria_id: "pet-shop",
  tags: "",
  lat: DEFAULT_LOCATION.lat,
  lng: DEFAULT_LOCATION.lng,
  aberto_24h: false,
  horarios: {},
  capa_url: null,
  logo_url: null,
  fotos: [],
};
export default function EditStore() {
  const { store, loading, load } = useStore();
  if (loading) return <Busy />;
  return <StoreForm key={store?.id ?? "new"} store={store} load={load} />;
}
function StoreForm({
  store,
  load,
}: {
  store: ReturnType<typeof useStore>["store"];
  load: () => Promise<void>;
}) {
  const { profile } = useSession();
  const [form, setForm] = useState<Form>(() =>
    store
      ? {
          ...(Object.fromEntries(
            Object.keys(initial).map((k) => [
              k,
              store[k as keyof typeof store],
            ]),
          ) as Form),
          telefone: store.telefone ?? "",
          whatsapp: store.whatsapp ?? "",
          instagram: store.instagram ?? "",
          site: store.site ?? "",
          tags: store.tags.join(", "),
          horarios: store.horarios as Horarios,
        }
      : initial,
  );
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const photo = async (target: "capa_url" | "logo_url" | "fotos") => {
    if (!profile) return;
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted)
        return Alert.alert(
          "Permita acesso às fotos",
          "Autorize a galeria nas configurações do aparelho.",
        );
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.75,
      });
      if (result.canceled) return;
      setBusy(true);
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024)
        throw new Error("Escolha uma imagem de até 5 MB.");
      const ext = (asset.mimeType ?? "image/jpeg")
        .split("/")[1]
        .replace("jpeg", "jpg");
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const bytes = await (await fetch(asset.uri)).arrayBuffer();
      const { error } = await supabase.storage
        .from("store-images")
        .upload(path, bytes, { contentType: asset.mimeType ?? "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("store-images").getPublicUrl(path);
      if (target === "fotos") set("fotos", [...form.fotos, data.publicUrl]);
      else set(target, data.publicUrl);
    } catch (e) {
      reportError(e, true);
    } finally {
      setBusy(false);
    }
  };
  const locate = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        return Alert.alert("Arraste o pin para localizar sua loja");
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setForm((f) => ({ ...f, lat: coords.latitude, lng: coords.longitude }));
    } catch (e) {
      reportError(e, true);
    }
  };
  const save = async () => {
    if (!profile) return;
    if (!form.nome.trim() || !form.endereco.trim())
      return Alert.alert("Preencha nome e endereço");
    for (const periods of Object.values(form.horarios)) {
      for (const [a, b] of periods ?? [])
        if (
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(a) ||
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(b) ||
          a >= b
        )
          return Alert.alert(
            "Confira os horários",
            "Use HH:MM e encerramento após a abertura.",
          );
    }
    setBusy(true);
    const payload = {
      ...form,
      owner_id: profile.id,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const { error } = store
      ? await supabase.from("stores").update(payload).eq("id", store.id)
      : await supabase.from("stores").insert(payload);
    setBusy(false);
    if (error) reportError(error, true);
    else {
      Alert.alert(
        "Loja salva!",
        store
          ? "Dados atualizados."
          : "Sua loja será analisada pela equipe. Escolha seu plano no Perfil.",
      );
      await load();
    }
  };
  return (
    <Page>
      <Txt title>
        {store ? "Sua vitrine no EasyPet" : "Conte sobre sua loja"}
      </Txt>
      {store && <Txt muted>Status: {store.status}</Txt>}
      <Card>
        {(
          [
            "nome",
            "descricao",
            "endereco",
            "bairro",
            "telefone",
            "whatsapp",
            "instagram",
            "site",
          ] as const
        ).map((k) => (
          <Field
            key={k}
            label={
              {
                nome: "Nome da loja",
                descricao: "Descrição",
                endereco: "Endereço completo",
                bairro: "Bairro",
                telefone: "Telefone",
                whatsapp: "WhatsApp",
                instagram: "Instagram",
                site: "Site",
              }[k]
            }
            value={form[k]}
            multiline={k === "descricao"}
            onChangeText={(v) => set(k, v)}
          />
        ))}
        <Txt>Categoria</Txt>
        <ScrollView horizontal>
          {CATEGORIES.map((c) => (
            <View key={c.id} style={{ marginRight: 8 }}>
              <Button
                secondary={form.categoria_id !== c.id}
                label={c.nome}
                onPress={() => set("categoria_id", c.id)}
              />
            </View>
          ))}
        </ScrollView>
        <Field
          label="Tags separadas por vírgula"
          value={form.tags}
          onChangeText={(v) => set("tags", v)}
        />
      </Card>
      <Card>
        <Txt title>Localização</Txt>
        <Txt muted>Arraste o pin até a entrada da loja.</Txt>
        <EasyMap
          mode="picker"
          style={{ height: 250, borderRadius: 12 }}
          region={{
            latitude: form.lat,
            longitude: form.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPickerChange={(point) =>
            setForm((f) => ({ ...f, lat: point.lat, lng: point.lng }))
          }
        />
        <Button
          secondary
          label="Usar localização atual"
          onPress={() => void locate()}
        />
      </Card>
      <Card>
        <Txt title>Horários</Txt>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Txt>Aberta 24 horas</Txt>
          <Switch
            value={form.aberto_24h}
            onValueChange={(v) => set("aberto_24h", v)}
          />
        </View>
        {!form.aberto_24h &&
          WEEKDAYS.map((day, index) => {
            const key = String(index) as keyof Horarios;
            const periods = form.horarios[key] ?? [];
            return (
              <View key={day} style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Txt>{day}</Txt>
                  <Switch
                    value={!!periods.length}
                    onValueChange={(v) =>
                      set("horarios", {
                        ...form.horarios,
                        [key]: v ? [["08:00", "18:00"]] : [],
                      })
                    }
                  />
                </View>
                {periods.map(([start, end], i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Field
                        label="Abre"
                        value={start}
                        onChangeText={(v) =>
                          set("horarios", {
                            ...form.horarios,
                            [key]: periods.map((p, n) =>
                              n === i ? [v, p[1]] : p,
                            ),
                          })
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field
                        label="Fecha"
                        value={end}
                        onChangeText={(v) =>
                          set("horarios", {
                            ...form.horarios,
                            [key]: periods.map((p, n) =>
                              n === i ? [p[0], v] : p,
                            ),
                          })
                        }
                      />
                    </View>
                  </View>
                ))}
                {!!periods.length && (
                  <Button
                    secondary
                    label={
                      periods.length === 1
                        ? "Adicionar intervalo"
                        : "Remover intervalo extra"
                    }
                    onPress={() =>
                      set("horarios", {
                        ...form.horarios,
                        [key]:
                          periods.length === 1
                            ? [...periods, ["19:00", "21:00"]]
                            : periods.slice(0, 1),
                      })
                    }
                  />
                )}
              </View>
            );
          })}
      </Card>
      <Card>
        <Txt title>Fotos</Txt>
        {form.capa_url && (
          <Image
            source={imageUrl(form.capa_url)}
            style={{ height: 140, borderRadius: 12 }}
          />
        )}
        <Button
          secondary
          label="Escolher capa"
          disabled={busy}
          onPress={() => void photo("capa_url")}
        />
        <Button
          secondary
          label="Escolher logo"
          disabled={busy}
          onPress={() => void photo("logo_url")}
        />
        {form.fotos.map((url) => (
          <View key={url}>
            <Image
              source={imageUrl(url)}
              style={{ height: 120, borderRadius: 12 }}
            />
            <Button
              secondary
              label="Remover foto"
              onPress={() =>
                set(
                  "fotos",
                  form.fotos.filter((f) => f !== url),
                )
              }
            />
          </View>
        ))}
        <Button
          secondary
          label="Adicionar foto à galeria"
          disabled={busy}
          onPress={() => void photo("fotos")}
        />
      </Card>
      <Button
        label={busy ? "Salvando…" : "Salvar loja"}
        disabled={busy}
        onPress={() => void save()}
      />
    </Page>
  );
}
