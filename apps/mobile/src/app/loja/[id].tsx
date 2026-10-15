import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import EasyMap from "../../features/map/EasyMap";
import { supabase, Row } from "../../lib/supabase";
import { reportError, useSession } from "../../lib/session";
import {
  Button,
  Busy,
  Card,
  Empty,
  Field,
  Page,
  s,
  Txt,
} from "../../features/ui";
import { Cover } from "../../features/stores";
import { Coupon, CouponCard } from "../../features/coupons";
import {
  categoryMeta,
  initials,
  onlyDigits,
  directionsUrl,
  formatPrice,
  formatRating,
  formatWeek,
  getOpenStatus,
  Horarios,
  whatsappUrl,
} from "../../shared";
export default function StoreDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useSession();
  const [store, setStore] = useState<Row<"stores"> | null>(null);
  const [items, setItems] = useState<Row<"store_items">[]>([]);
  const [reviews, setReviews] = useState<Row<"reviews">[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("5");
  const load = useCallback(async () => {
    const results = await Promise.all([
      supabase.from("stores").select("*").eq("id", id).single(),
      supabase
        .from("store_items")
        .select("*")
        .eq("store_id", id)
        .eq("ativo", true),
      supabase
        .from("reviews")
        .select("*")
        .eq("store_id", id)
        .order("created_at", { ascending: false }),
      supabase.rpc("store_coupons", { p_store_id: id }),
      supabase
        .from("favorites")
        .select("*")
        .eq("store_id", id)
        .eq("user_id", profile?.id ?? "00000000-0000-0000-0000-000000000000"),
    ]);
    for (const r of results) if (r.error) reportError(r.error);
    setStore(results[0].data);
    setItems(results[1].data ?? []);
    setReviews(results[2].data ?? []);
    setCoupons(results[3].data ?? []);
    setFavorite(!!results[4].data?.length);
    setBusy(false);
  }, [id, profile?.id]);
  useEffect(() => {
    void Promise.resolve().then(load);
    void supabase
      .rpc("registrar_evento", { p_store_id: id, p_tipo: "view" })
      .then(({ error }) => {
        if (error) reportError(error);
      });
  }, [id, load]);
  const contact = async (
    type: "whatsapp" | "telefone" | "rota",
    url: string,
  ) => {
    try {
      const { error } = await supabase.rpc("registrar_evento", {
        p_store_id: id,
        p_tipo: type,
      });
      if (error) throw error;
      await Linking.openURL(url);
    } catch (e) {
      reportError(e);
    }
  };
  const toggle = async () => {
    if (!profile) return;
    const { error } = favorite
      ? await supabase
          .from("favorites")
          .delete()
          .eq("user_id", profile.id)
          .eq("store_id", id)
      : await supabase
          .from("favorites")
          .insert({ user_id: profile.id, store_id: id });
    if (error) reportError(error);
    else setFavorite(!favorite);
  };
  if (busy) return <Busy />;
  if (!store)
    return (
      <Page>
        <Empty text="Loja indisponível." />
        <Button label="Tentar novamente" onPress={() => void load()} />
      </Page>
    );
  const status = getOpenStatus(store.horarios as Horarios, store.aberto_24h);
  return (
    <Page>
      <Cover store={store} height={210} />
      <View style={s.row}>
        {store.logo_url ? (
          <Image
            source={store.logo_url}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={store.logo_url}
            accessibilityLabel={`Logo de ${store.nome}`}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
        ) : (
          <View
            style={{
              backgroundColor: categoryMeta(store.categoria_id).cor,
              padding: 16,
              borderRadius: 40,
            }}
          >
            <Txt>{initials(store.nome)}</Txt>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Txt title>{store.nome}</Txt>
          <Txt muted>{categoryMeta(store.categoria_id).nome}</Txt>
        </View>
      </View>
      <Txt>
        ★ {formatRating(store.nota_media)} · {store.total_avaliacoes} avaliações
      </Txt>
      <Txt muted>{status.label}</Txt>
      <Button
        secondary
        label={favorite ? "♥ Salva nos favoritos" : "♡ Favoritar loja"}
        onPress={() => void toggle()}
      />
      <Txt>{store.descricao}</Txt>
      {!!store.fotos.length && (
        <ScrollView horizontal contentContainerStyle={{ gap: 10 }}>
          {store.fotos.map((uri) => (
            <Image
              key={uri}
              source={uri}
              contentFit="cover"
              style={{ width: 260, height: 170, borderRadius: 16 }}
            />
          ))}
        </ScrollView>
      )}
      <View style={s.row}>
        {store.tags.map((t) => (
          <View key={t} style={s.chip}>
            <Txt>{t}</Txt>
          </View>
        ))}
      </View>
      <View style={s.row}>
        {store.whatsapp && (
          <Button
            label="WhatsApp"
            onPress={() =>
              void contact("whatsapp", whatsappUrl(store.whatsapp, store.nome))
            }
          />
        )}
        {store.telefone && (
          <Button
            secondary
            label="Ligar"
            onPress={() =>
              void contact("telefone", `tel:+55${onlyDigits(store.telefone)}`)
            }
          />
        )}
        <Button
          secondary
          label="Como chegar"
          onPress={() =>
            void contact("rota", directionsUrl(store.lat, store.lng))
          }
        />
      </View>
      <Card>
        <Txt title>Onde estamos</Txt>
        <Txt>
          {store.endereco} · {store.bairro}
        </Txt>
        <EasyMap
          interactive={false}
          style={{ height: 160, borderRadius: 12 }}
          region={{
            latitude: store.lat,
            longitude: store.lng,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          markers={[
            {
              id: store.id,
              lat: store.lat,
              lng: store.lng,
              cor: categoryMeta(store.categoria_id).cor,
              destaque: store.destaque,
              logo_url: store.logo_url,
            },
          ]}
        />
      </Card>
      <Card>
        <Txt title>Horários</Txt>
        {formatWeek(store.horarios as Horarios, store.aberto_24h).map((d) => (
          <View
            key={d.dia}
            style={[s.row, { justifyContent: "space-between" }]}
          >
            <Txt>
              {d.dia}
              {d.hoje ? " · hoje" : ""}
            </Txt>
            <Txt muted>{d.texto}</Txt>
          </View>
        ))}
      </Card>
      <Txt title>Produtos e serviços</Txt>
      {items.length ? (
        items.map((i) => (
          <Card key={i.id}>
            {i.imagem_url && (
              <Image
                source={i.imagem_url}
                style={{ height: 150, borderRadius: 12 }}
              />
            )}
            <Txt>{i.nome}</Txt>
            <Txt muted>{i.descricao}</Txt>
            <Txt>{formatPrice(i.preco_centavos, i.preco_a_partir)}</Txt>
          </Card>
        ))
      ) : (
        <Empty text="Consulte os serviços diretamente com a loja." />
      )}
      <Txt title>Cupons</Txt>
      {coupons.map((c) => (
        <CouponCard key={c.id} coupon={c} />
      ))}
      {!coupons.length && <Empty text="Esta loja ainda não tem cupons." />}
      <Txt title>Avaliações</Txt>
      {reviews.map((r) => (
        <Card key={r.id}>
          <Txt>
            {r.autor_nome} · {"★".repeat(r.nota)}
          </Txt>
          <Txt muted>{r.comentario}</Txt>
        </Card>
      ))}
      <Card>
        <Txt title>Conte sua experiência</Txt>
        <Field
          label="Nota (1 a 5)"
          keyboardType="number-pad"
          value={rating}
          onChangeText={setRating}
        />
        <Field
          label="Comentário"
          multiline
          value={comment}
          onChangeText={setComment}
        />
        <Button
          label="Publicar avaliação"
          onPress={() => {
            const nota = Number(rating);
            if (!Number.isInteger(nota) || nota < 1 || nota > 5)
              return Alert.alert("Escolha uma nota de 1 a 5");
            if (!profile) return;
            void supabase
              .from("reviews")
              .upsert(
                {
                  store_id: id,
                  user_id: profile.id,
                  nota,
                  comentario: comment,
                },
                { onConflict: "store_id,user_id" },
              )
              .then(({ error }) => {
                if (error) reportError(error);
                else {
                  setComment("");
                  void load();
                  Alert.alert("Obrigado pela avaliação!");
                }
              });
          }}
        />
      </Card>
    </Page>
  );
}
