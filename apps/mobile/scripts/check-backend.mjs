import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [
        l.slice(0, i),
        l
          .slice(i + 1)
          .trim()
          .replace(/^['"]|['"]$/g, ""),
      ];
    }),
);
const make = () =>
  createClient(
    env.EXPO_PUBLIC_SUPABASE_URL,
    env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
const check = (result, label) => {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
};
for (const email of [
  "cliente@easypet.com",
  "premium@easypet.com",
  "lojista@easypet.com",
  "admin@easypet.com",
]) {
  const db = make();
  const auth = check(
    await db.auth.signInWithPassword({ email, password: "easypet123" }),
    "login",
  );
  const profile = check(
    await db.from("profiles").select("*").eq("id", auth.user.id).single(),
    "profile",
  );
  const stores = check(
    await db.rpc("nearby_stores", {
      p_lat: -30.0331,
      p_lng: -51.23,
      p_raio_m: 5000,
    }),
    "nearby_stores",
  );
  if (!stores.length) throw new Error("Seed sem lojas");
  const coupons = check(await db.rpc("all_coupons"), "all_coupons");
  if (profile.role === "cliente") {
    if (
      profile.plano === "free" &&
      coupons.some((c) => c.codigo !== null || !c.bloqueado)
    )
      throw new Error("Código de cupom vazou para free");
    if (
      profile.plano === "premium" &&
      !coupons.some((c) => c.codigo && !c.bloqueado)
    )
      throw new Error("Premium sem cupons");
    check(
      await db.from("favorites").select("stores(*)").eq("user_id", profile.id),
      "favorites",
    );
    if (profile.plano === "premium")
      check(
        await db
          .from("pets")
          .select("*,pet_vaccines(*)")
          .eq("owner_id", profile.id),
        "pets",
      );
  }
  if (profile.role === "lojista") {
    const own = check(
      await db
        .from("stores")
        .select("*,subscriptions(plan_id,status,store_plans(estatisticas))")
        .eq("owner_id", profile.id),
      "own store",
    )[0];
    if (!own) throw new Error("Lojista sem loja");
    check(
      await db.rpc("store_stats", { p_store_id: own.id, p_dias: 30 }),
      "store_stats",
    );
    check(
      await db.from("coupons").select("*").eq("store_id", own.id),
      "merchant coupons",
    );
  }
  const detail = stores[0];
  check(
    await db.rpc("store_coupons", { p_store_id: detail.id }),
    "store_coupons",
  );
  check(
    await db
      .from("store_items")
      .select("*")
      .eq("store_id", detail.id)
      .eq("ativo", true),
    "items",
  );
  check(
    await db.from("reviews").select("*").eq("store_id", detail.id),
    "reviews",
  );
  if (process.argv.includes("--write")) {
    if (profile.role === "cliente" && profile.plano === "free") {
      const existing = check(
        await db.from("favorites").select("store_id").eq("user_id", profile.id),
        "existing favorites",
      );
      const candidates = stores.filter(
        (st) => !existing.some((f) => f.store_id === st.id),
      );
      const added = [];
      try {
        for (let i = existing.length; i < 5; i++) {
          const candidate = candidates.shift();
          check(
            await db
              .from("favorites")
              .insert({ user_id: profile.id, store_id: candidate.id }),
            "insert favorite",
          );
          added.push(candidate.id);
        }
        const result = await db
          .from("favorites")
          .insert({ user_id: profile.id, store_id: candidates[0].id });
        if (!result.error?.message.includes("LIMITE_FAVORITOS"))
          throw new Error("Limite de favoritos não aplicado");
      } finally {
        for (const id of added)
          check(
            await db
              .from("favorites")
              .delete()
              .eq("user_id", profile.id)
              .eq("store_id", id),
            "cleanup favorite",
          );
      }
    }
    if (profile.role === "cliente" && profile.plano === "premium") {
      const pet = check(
        await db
          .from("pets")
          .insert({ owner_id: profile.id, nome: "Teste mobile temporário" })
          .select()
          .single(),
        "create pet",
      );
      try {
        check(
          await db.from("pets").update({ peso_kg: 12.3 }).eq("id", pet.id),
          "update pet",
        );
        const vaccine = check(
          await db
            .from("pet_vaccines")
            .insert({
              pet_id: pet.id,
              nome: "Teste vacina",
              aplicada_em: "2026-10-14",
              proxima_dose: "2027-10-14",
            })
            .select()
            .single(),
          "create vaccine",
        );
        check(
          await db
            .from("pet_vaccines")
            .update({ nome: "Teste atualizado" })
            .eq("id", vaccine.id),
          "update vaccine",
        );
        check(
          await db.from("pet_vaccines").delete().eq("id", vaccine.id),
          "delete vaccine",
        );
      } finally {
        check(await db.from("pets").delete().eq("id", pet.id), "cleanup pet");
      }
    }
    if (profile.role === "lojista") {
      const own = check(
        await db
          .from("stores")
          .select("id,nome")
          .eq("owner_id", profile.id)
          .limit(1)
          .single(),
        "store",
      );
      check(
        await db.from("stores").update({ nome: own.nome }).eq("id", own.id),
        "save store",
      );
      const item = check(
        await db
          .from("store_items")
          .insert({
            store_id: own.id,
            nome: "Teste temporário mobile",
            preco_centavos: 100,
          })
          .select()
          .single(),
        "create item",
      );
      try {
        check(
          await db
            .from("store_items")
            .update({ nome: "Teste atualizado" })
            .eq("id", item.id),
          "update item",
        );
      } finally {
        check(
          await db.from("store_items").delete().eq("id", item.id),
          "cleanup item",
        );
      }
      const coupon = check(
        await db
          .from("coupons")
          .insert({
            store_id: own.id,
            titulo: "Teste temporário mobile",
            codigo: "TESTEMOBILE",
            desconto: "1% OFF",
          })
          .select()
          .single(),
        "create coupon",
      );
      try {
        check(
          await db.from("coupons").update({ ativo: false }).eq("id", coupon.id),
          "update coupon",
        );
      } finally {
        check(
          await db.from("coupons").delete().eq("id", coupon.id),
          "cleanup coupon",
        );
      }
    }
  }
  console.log(
    `OK ${email}: ${profile.role}/${profile.plano}, ${stores.length} lojas, ${coupons.length} cupons`,
  );
  await db.auth.signOut({ scope: "local" });
}
