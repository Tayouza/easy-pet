import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import {
  categoryMeta,
  formatDistance,
  formatRating,
  getOpenStatus,
  Horarios,
  initials,
} from "../shared";
import { Row } from "../lib/supabase";
import { Card, s, Txt } from "./ui";
export type Store = Pick<
  Row<"stores">,
  | "id"
  | "nome"
  | "categoria_id"
  | "capa_url"
  | "logo_url"
  | "nota_media"
  | "horarios"
  | "aberto_24h"
  | "destaque"
  | "bairro"
  | "lat"
  | "lng"
> & { distancia_m?: number };
export function Cover({
  store,
  height = 130,
}: {
  store: Store;
  height?: number;
}) {
  const c = categoryMeta(store.categoria_id);
  return store.capa_url ? (
    <Image
      source={store.capa_url}
      contentFit="cover"
      style={{ height, borderRadius: 12 }}
    />
  ) : (
    <LinearGradient
      colors={[c.cor, `${c.cor}99`]}
      style={{
        height,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name={c.ionicon as keyof typeof Ionicons.glyphMap}
        size={54}
        color="white"
      />
    </LinearGradient>
  );
}
export function StoreCard({
  store,
  ads = false,
}: {
  store: Store;
  ads?: boolean;
}) {
  const c = categoryMeta(store.categoria_id);
  const status = getOpenStatus(store.horarios as Horarios, store.aberto_24h);
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/loja/[id]", params: { id: store.id } })
      }
    >
      <Card>
        <Cover store={store} />
        <View style={s.row}>
          {store.logo_url ? (
            <Image
              source={store.logo_url}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />
          ) : (
            <View
              style={{ backgroundColor: c.cor, padding: 12, borderRadius: 30 }}
            >
              <Txt>{initials(store.nome)}</Txt>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Txt title>{store.nome}</Txt>
            <Txt muted>
              {c.nome} · {store.bairro}
            </Txt>
          </View>
        </View>
        <Txt>
          ★ {formatRating(store.nota_media)}{" "}
          {store.distancia_m !== undefined
            ? ` · ${formatDistance(store.distancia_m)}`
            : ""}
        </Txt>
        <Txt muted>
          {status.label}
          {ads && store.destaque ? " · Patrocinado" : ""}
        </Txt>
      </Card>
    </Pressable>
  );
}
