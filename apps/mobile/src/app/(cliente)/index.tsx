import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  CATEGORIES,
  categoryMeta,
  DEFAULT_LOCATION,
  getOpenStatus,
  Horarios,
} from "../../shared";
import { supabase } from "../../lib/supabase";
import { reportError, useSession } from "../../lib/session";
import { Button, Busy, Empty, Field, s, Txt } from "../../features/ui";
import { Store, StoreCard } from "../../features/stores";
export default function Explore() {
  const { profile } = useSession();
  const premium = profile?.plano === "premium";
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>(
    { latitude: DEFAULT_LOCATION.lat, longitude: DEFAULT_LOCATION.lng },
  );
  const [located, setLocated] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [radius, setRadius] = useState(5);
  const [list, setList] = useState(false);
  const [selected, setSelected] = useState<Store | null>(null);
  const [open, setOpen] = useState(false);
  const [rated, setRated] = useState(false);
  const locate = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Usando Praça da Matriz",
          "Você pode explorar Porto Alegre mesmo sem permitir a localização.",
        );
        return;
      }
      const p = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords(p.coords);
      setLocated(true);
    } catch {
      Alert.alert(
        "Localização indisponível",
        "Usando Praça da Matriz como referência.",
      );
    }
  };
  useEffect(() => {
    void Promise.resolve().then(locate);
  }, []);
  const load = useCallback(async () => {
    setBusy(true);
    setError(false);
    const { data, error } = await supabase.rpc("nearby_stores", {
      p_lat: coords.latitude,
      p_lng: coords.longitude,
      p_raio_m: radius * 1000,
      p_categoria: category ?? undefined,
      p_busca: search,
    });
    if (error) {
      setError(true);
      reportError(error);
    } else
      setStores(
        (data ?? []).map((st) => ({ ...st, horarios: st.horarios ?? {} })),
      );
    setBusy(false);
  }, [coords, category, radius, search]);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 350);
    return () => clearTimeout(timer);
  }, [load]);
  const advanced = (fn: () => void) =>
    premium ? fn() : router.push("/premium");
  let visible = stores.filter(
    (st) =>
      !open || getOpenStatus(st.horarios as Horarios, st.aberto_24h).aberto,
  );
  if (rated)
    visible = [...visible].sort(
      (a, b) => Number(b.nota_media) - Number(a.nota_media),
    );
  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 14, gap: 8 }}>
        <Field
          label={located ? "Perto de você" : "Praça da Matriz · Porto Alegre"}
          placeholder="O que seu pet precisa hoje?"
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable style={s.chip} onPress={() => setCategory(null)}>
            <Txt>Todas</Txt>
          </Pressable>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.id}
              style={[
                s.chip,
                category === c.id && { backgroundColor: "#E6F3F3" },
              ]}
              onPress={() => setCategory(c.id)}
            >
              <Txt>{c.nome}</Txt>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          <Button
            secondary
            label={list ? "Ver mapa" : "Ver lista"}
            onPress={() => setList(!list)}
          />
          <Button
            secondary
            label={`${premium ? "" : "🔒 "}${open ? "✓ " : ""}Aberto agora`}
            onPress={() => advanced(() => setOpen(!open))}
          />
          <Button
            secondary
            label={`${premium ? "" : "🔒 "}${rated ? "✓ " : ""}Melhor avaliadas`}
            onPress={() => advanced(() => setRated(!rated))}
          />
          <Button
            secondary
            label="Minha localização"
            onPress={() => void locate()}
          />
        </ScrollView>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Txt muted>Raio: {radius} km</Txt>
          <Slider
            accessibilityLabel="Raio de busca em quilômetros"
            style={{ flex: 1, height: 30 }}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={radius}
            minimumTrackTintColor="#FF6B35"
            thumbTintColor="#FF6B35"
            onSlidingComplete={setRadius}
          />
        </View>
      </View>
      {busy ? (
        <Busy />
      ) : error ? (
        <View style={{ padding: 20 }}>
          <Button label="Tentar novamente" onPress={() => void load()} />
        </View>
      ) : list ? (
        <ScrollView contentContainerStyle={s.page}>
          {visible.length ? (
            visible.map((st) => (
              <StoreCard key={st.id} store={st} ads={!premium} />
            ))
          ) : (
            <Empty text="Nenhuma loja encontrada. Experimente ampliar o raio." />
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            region={{
              ...coords,
              latitudeDelta: radius * 0.023,
              longitudeDelta: radius * 0.023,
            }}
            showsUserLocation={located}
            onPress={() => setSelected(null)}
          >
            {visible.map((st) => (
              <Marker
                key={st.id}
                coordinate={{ latitude: st.lat, longitude: st.lng }}
                onPress={() => setSelected(st)}
              >
                <View
                  style={{
                    backgroundColor: categoryMeta(st.categoria_id).cor,
                    borderRadius: 30,
                    borderWidth: 3,
                    borderColor: "white",
                    padding: st.destaque ? 13 : 9,
                  }}
                >
                  <Txt>{st.destaque ? "★" : "🐾"}</Txt>
                </View>
              </Marker>
            ))}
          </MapView>
          {selected && (
            <View
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                right: 12,
                maxHeight: 280,
              }}
            >
              <ScrollView>
                <StoreCard store={selected} ads={!premium} />
              </ScrollView>
            </View>
          )}
          {!visible.length && (
            <View
              style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}
            >
              <Empty text="Nenhuma loja neste raio." />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
