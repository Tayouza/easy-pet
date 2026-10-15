import type { Database } from "@/shared";

type T = Database["public"]["Tables"];
type F = Database["public"]["Functions"];
type E = Database["public"]["Enums"];

export type Profile = T["profiles"]["Row"];
export type Store = T["stores"]["Row"];
export type StoreItem = T["store_items"]["Row"];
export type Coupon = T["coupons"]["Row"];
export type StorePlan = T["store_plans"]["Row"];
export type Subscription = T["subscriptions"]["Row"];
export type Payment = T["payments"]["Row"];
export type Review = T["reviews"]["Row"];
export type Pet = T["pets"]["Row"];
export type PetVaccine = T["pet_vaccines"]["Row"];
export type NearbyStore = F["nearby_stores"]["Returns"][number];
export type StoreCoupon = F["store_coupons"]["Returns"][number];
export type AnyCoupon = F["all_coupons"]["Returns"][number];
export type UserRole = E["user_role"];
export type StoreStatus = E["store_status"];
export type PaymentMethod = E["payment_method"];

export interface StoreStats {
  views: number;
  whatsapp: number;
  rota: number;
  telefone: number;
  favoritos: number;
  serie: { dia: string; views: number; contatos: number }[];
}

export interface AdminStats {
  lojas_ativas: number;
  lojas_pendentes: number;
  clientes: number;
  lojistas: number;
  premium: number;
  mrr_lojas: number;
  mrr_premium: number;
  receita_mensal: { mes: string; lojas: number; premium: number }[];
  lojas_por_categoria: { categoria: string; cor: string; total: number }[];
  assinaturas_por_plano: { plano: string; total: number }[];
}

/** Subconjunto da loja usado nos cards (compatível com nearby_stores e com a tabela). */
export type StoreCardData = Pick<
  Store,
  | "id"
  | "nome"
  | "categoria_id"
  | "endereco"
  | "bairro"
  | "aberto_24h"
  | "horarios"
  | "logo_url"
  | "capa_url"
  | "destaque"
  | "nota_media"
  | "total_avaliacoes"
  | "lat"
  | "lng"
> & { distancia_m?: number | null; tags?: string[] };
