
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "categories": {
                  Row: {
                    "cor": string,"icone": string,"id": string,"nome": string,"ordem": number
                  }
                  ComputedFields: never
                  Insert: {
                    "cor": string,"icone": string,"id": string,"nome": string,"ordem"?: number
                  }
                  Update: {
                    "cor"?: string,"icone"?: string,"id"?: string,"nome"?: string,"ordem"?: number
                  }
                  Relationships: [
                    
                  ]
                },"coupons": {
                  Row: {
                    "ativo": boolean,"codigo": string,"created_at": string,"desconto": string,"descricao": string,"id": string,"store_id": string,"titulo": string,"validade": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "ativo"?: boolean,"codigo": string,"created_at"?: string,"desconto": string,"descricao"?: string,"id"?: string,"store_id": string,"titulo": string,"validade"?: string | null
                  }
                  Update: {
                    "ativo"?: boolean,"codigo"?: string,"created_at"?: string,"desconto"?: string,"descricao"?: string,"id"?: string,"store_id"?: string,"titulo"?: string,"validade"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "coupons_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    }
                  ]
                },"favorites": {
                  Row: {
                    "created_at": string,"store_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"store_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"store_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "favorites_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "created_at": string,"id": string,"metodo": Database["public"]['Enums']["payment_method"],"plan_id": string | null,"status": string,"store_id": string | null,"tipo": Database["public"]['Enums']["payment_kind"],"user_id": string,"valor_centavos": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"metodo"?: Database["public"]['Enums']["payment_method"],"plan_id"?: string | null,"status"?: string,"store_id"?: string | null,"tipo": Database["public"]['Enums']["payment_kind"],"user_id": string,"valor_centavos": number
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"metodo"?: Database["public"]['Enums']["payment_method"],"plan_id"?: string | null,"status"?: string,"store_id"?: string | null,"tipo"?: Database["public"]['Enums']["payment_kind"],"user_id"?: string,"valor_centavos"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"pet_vaccines": {
                  Row: {
                    "aplicada_em": string,"created_at": string,"id": string,"nome": string,"pet_id": string,"proxima_dose": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "aplicada_em": string,"created_at"?: string,"id"?: string,"nome": string,"pet_id": string,"proxima_dose"?: string | null
                  }
                  Update: {
                    "aplicada_em"?: string,"created_at"?: string,"id"?: string,"nome"?: string,"pet_id"?: string,"proxima_dose"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "pet_vaccines_pet_id_fkey"
      columns: ["pet_id"]
isOneToOne: false
      referencedRelation: "pets"
      referencedColumns: ["id"]
    }
                  ]
                },"pets": {
                  Row: {
                    "created_at": string,"especie": string,"foto_url": string | null,"id": string,"nascimento": string | null,"nome": string,"owner_id": string,"peso_kg": number | null,"raca": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"especie"?: string,"foto_url"?: string | null,"id"?: string,"nascimento"?: string | null,"nome": string,"owner_id": string,"peso_kg"?: number | null,"raca"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"especie"?: string,"foto_url"?: string | null,"id"?: string,"nascimento"?: string | null,"nome"?: string,"owner_id"?: string,"peso_kg"?: number | null,"raca"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "pets_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"email": string,"id": string,"nome": string,"plano": Database["public"]['Enums']["user_plan"],"premium_ate": string | null,"premium_desde": string | null,"role": Database["public"]['Enums']["user_role"],"telefone": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"email"?: string,"id": string,"nome"?: string,"plano"?: Database["public"]['Enums']["user_plan"],"premium_ate"?: string | null,"premium_desde"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"telefone"?: string | null
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"email"?: string,"id"?: string,"nome"?: string,"plano"?: Database["public"]['Enums']["user_plan"],"premium_ate"?: string | null,"premium_desde"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"telefone"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"reviews": {
                  Row: {
                    "autor_nome": string,"comentario": string,"created_at": string,"id": string,"nota": number,"store_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "autor_nome"?: string,"comentario"?: string,"created_at"?: string,"id"?: string,"nota": number,"store_id": string,"user_id": string
                  }
                  Update: {
                    "autor_nome"?: string,"comentario"?: string,"created_at"?: string,"id"?: string,"nota"?: number,"store_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"store_events": {
                  Row: {
                    "created_at": string,"id": number,"store_id": string,"tipo": Database["public"]['Enums']["event_kind"],"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: never,"store_id": string,"tipo": Database["public"]['Enums']["event_kind"],"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: never,"store_id"?: string,"tipo"?: Database["public"]['Enums']["event_kind"],"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "store_events_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "store_events_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"store_items": {
                  Row: {
                    "ativo": boolean,"created_at": string,"descricao": string,"id": string,"imagem_url": string | null,"nome": string,"preco_a_partir": boolean,"preco_centavos": number | null,"store_id": string,"tipo": Database["public"]['Enums']["item_kind"]
                  }
                  ComputedFields: never
                  Insert: {
                    "ativo"?: boolean,"created_at"?: string,"descricao"?: string,"id"?: string,"imagem_url"?: string | null,"nome": string,"preco_a_partir"?: boolean,"preco_centavos"?: number | null,"store_id": string,"tipo"?: Database["public"]['Enums']["item_kind"]
                  }
                  Update: {
                    "ativo"?: boolean,"created_at"?: string,"descricao"?: string,"id"?: string,"imagem_url"?: string | null,"nome"?: string,"preco_a_partir"?: boolean,"preco_centavos"?: number | null,"store_id"?: string,"tipo"?: Database["public"]['Enums']["item_kind"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "store_items_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    }
                  ]
                },"store_plans": {
                  Row: {
                    "beneficios": (string)[],"destaque": boolean,"estatisticas": boolean,"id": string,"max_itens": number | null,"nome": string,"ordem": number,"permite_cupons": boolean,"preco_centavos": number
                  }
                  ComputedFields: never
                  Insert: {
                    "beneficios"?: (string)[],"destaque"?: boolean,"estatisticas"?: boolean,"id": string,"max_itens"?: number | null,"nome": string,"ordem"?: number,"permite_cupons"?: boolean,"preco_centavos": number
                  }
                  Update: {
                    "beneficios"?: (string)[],"destaque"?: boolean,"estatisticas"?: boolean,"id"?: string,"max_itens"?: number | null,"nome"?: string,"ordem"?: number,"permite_cupons"?: boolean,"preco_centavos"?: number
                  }
                  Relationships: [
                    
                  ]
                },"stores": {
                  Row: {
                    "aberto_24h": boolean,"aprovada_em": string | null,"bairro": string,"capa_url": string | null,"categoria_id": string,"cep": string | null,"cidade": string,"created_at": string,"descricao": string,"destaque": boolean,"endereco": string,"fotos": (string)[],"horarios": NonNullable<Json>,"id": string,"instagram": string | null,"lat": number,"lng": number,"location": unknown,"logo_url": string | null,"motivo_status": string | null,"nome": string,"nota_media": number,"owner_id": string,"site": string | null,"status": Database["public"]['Enums']["store_status"],"tags": (string)[],"telefone": string | null,"total_avaliacoes": number,"uf": string,"whatsapp": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "aberto_24h"?: boolean,"aprovada_em"?: string | null,"bairro"?: string,"capa_url"?: string | null,"categoria_id": string,"cep"?: string | null,"cidade"?: string,"created_at"?: string,"descricao"?: string,"destaque"?: boolean,"endereco": string,"fotos"?: (string)[],"horarios"?: NonNullable<Json>,"id"?: string,"instagram"?: string | null,"lat": number,"lng": number,"location"?: never,"logo_url"?: string | null,"motivo_status"?: string | null,"nome": string,"nota_media"?: number,"owner_id": string,"site"?: string | null,"status"?: Database["public"]['Enums']["store_status"],"tags"?: (string)[],"telefone"?: string | null,"total_avaliacoes"?: number,"uf"?: string,"whatsapp"?: string | null
                  }
                  Update: {
                    "aberto_24h"?: boolean,"aprovada_em"?: string | null,"bairro"?: string,"capa_url"?: string | null,"categoria_id"?: string,"cep"?: string | null,"cidade"?: string,"created_at"?: string,"descricao"?: string,"destaque"?: boolean,"endereco"?: string,"fotos"?: (string)[],"horarios"?: NonNullable<Json>,"id"?: string,"instagram"?: string | null,"lat"?: number,"lng"?: number,"location"?: never,"logo_url"?: string | null,"motivo_status"?: string | null,"nome"?: string,"nota_media"?: number,"owner_id"?: string,"site"?: string | null,"status"?: Database["public"]['Enums']["store_status"],"tags"?: (string)[],"telefone"?: string | null,"total_avaliacoes"?: number,"uf"?: string,"whatsapp"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "stores_categoria_id_fkey"
      columns: ["categoria_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "stores_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"subscriptions": {
                  Row: {
                    "created_at": string,"fim": string | null,"id": string,"inicio": string,"plan_id": string,"status": Database["public"]['Enums']["subscription_status"],"store_id": string,"valor_centavos": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"fim"?: string | null,"id"?: string,"inicio"?: string,"plan_id": string,"status"?: Database["public"]['Enums']["subscription_status"],"store_id": string,"valor_centavos": number
                  }
                  Update: {
                    "created_at"?: string,"fim"?: string | null,"id"?: string,"inicio"?: string,"plan_id"?: string,"status"?: Database["public"]['Enums']["subscription_status"],"store_id"?: string,"valor_centavos"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "subscriptions_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "store_plans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "subscriptions_store_id_fkey"
      columns: ["store_id"]
isOneToOne: false
      referencedRelation: "stores"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "admin_stats":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"all_coupons":
{ Args: Record<PropertyKey, never>; Returns: {
              "bloqueado": boolean,"categoria_id": string,"codigo": string,"desconto": string,"descricao": string,"id": string,"store_id": string,"store_nome": string,"titulo": string,"validade": string
            }[]
                           },
"assinar_plano_loja":
{ Args: { "p_metodo"?: Database["public"]['Enums']["payment_method"],"p_plan_id": string,"p_store_id": string }; Returns: {
              "created_at": string,
"fim": string | null,
"id": string,
"inicio": string,
"plan_id": string,
"status": Database["public"]['Enums']["subscription_status"],
"store_id": string,
"valor_centavos": number
            }
                          SetofOptions: {
        from: "*"
        to: "subscriptions"
        isOneToOne: true
        isSetofReturn: false
      } },
"assinar_premium":
{ Args: { "p_metodo"?: Database["public"]['Enums']["payment_method"] }; Returns: {
              "avatar_url": string | null,
"created_at": string,
"email": string,
"id": string,
"nome": string,
"plano": Database["public"]['Enums']["user_plan"],
"premium_ate": string | null,
"premium_desde": string | null,
"role": Database["public"]['Enums']["user_role"],
"telefone": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "profiles"
        isOneToOne: true
        isSetofReturn: false
      } },
"cancelar_plano_loja":
{ Args: { "p_store_id": string }; Returns: undefined
                           },
"cancelar_premium":
{ Args: Record<PropertyKey, never>; Returns: {
              "avatar_url": string | null,
"created_at": string,
"email": string,
"id": string,
"nome": string,
"plano": Database["public"]['Enums']["user_plan"],
"premium_ate": string | null,
"premium_desde": string | null,
"role": Database["public"]['Enums']["user_role"],
"telefone": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "profiles"
        isOneToOne: true
        isSetofReturn: false
      } },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_lojista":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_premium":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"moderar_loja":
{ Args: { "p_motivo"?: string,"p_status": Database["public"]['Enums']["store_status"],"p_store_id": string }; Returns: {
              "aberto_24h": boolean,
"aprovada_em": string | null,
"bairro": string,
"capa_url": string | null,
"categoria_id": string,
"cep": string | null,
"cidade": string,
"created_at": string,
"descricao": string,
"destaque": boolean,
"endereco": string,
"fotos": (string)[],
"horarios": NonNullable<Json>,
"id": string,
"instagram": string | null,
"lat": number,
"lng": number,
"location": unknown,
"logo_url": string | null,
"motivo_status": string | null,
"nome": string,
"nota_media": number,
"owner_id": string,
"site": string | null,
"status": Database["public"]['Enums']["store_status"],
"tags": (string)[],
"telefone": string | null,
"total_avaliacoes": number,
"uf": string,
"whatsapp": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "stores"
        isOneToOne: true
        isSetofReturn: false
      } },
"nearby_stores":
{ Args: { "p_busca"?: string,"p_categoria"?: string,"p_lat": number,"p_lng": number,"p_raio_m"?: number }; Returns: {
              "aberto_24h": boolean,"bairro": string,"capa_url": string,"categoria_id": string,"descricao": string,"destaque": boolean,"distancia_m": number,"endereco": string,"horarios": Json,"id": string,"lat": number,"lng": number,"logo_url": string,"nome": string,"nota_media": number,"tags": (string)[],"telefone": string,"total_avaliacoes": number,"whatsapp": string
            }[]
                           },
"owns_store":
{ Args: { "p_store_id": string }; Returns: boolean
                           },
"registrar_evento":
{ Args: { "p_store_id": string,"p_tipo": Database["public"]['Enums']["event_kind"] }; Returns: undefined
                           },
"store_active_plan":
{ Args: { "p_store_id": string }; Returns: {
              "beneficios": (string)[],
"destaque": boolean,
"estatisticas": boolean,
"id": string,
"max_itens": number | null,
"nome": string,
"ordem": number,
"permite_cupons": boolean,
"preco_centavos": number
            }
                          SetofOptions: {
        from: "*"
        to: "store_plans"
        isOneToOne: true
        isSetofReturn: false
      } },
"store_coupons":
{ Args: { "p_store_id": string }; Returns: {
              "bloqueado": boolean,"codigo": string,"desconto": string,"descricao": string,"id": string,"titulo": string,"validade": string
            }[]
                           },
"store_stats":
{ Args: { "p_dias"?: number,"p_store_id": string }; Returns: Json
                           }
          }
          Enums: {
            "event_kind": "view"|"whatsapp"|"rota"|"telefone","item_kind": "produto"|"servico","payment_kind": "premium_cliente"|"assinatura_loja","payment_method": "pix"|"cartao"|"boleto","store_status": "pendente"|"ativa"|"suspensa"|"recusada","subscription_status": "ativa"|"cancelada"|"expirada","user_plan": "free"|"premium","user_role": "cliente"|"lojista"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "event_kind": ["view", "whatsapp", "rota", "telefone"],"item_kind": ["produto", "servico"],"payment_kind": ["premium_cliente", "assinatura_loja"],"payment_method": ["pix", "cartao", "boleto"],"store_status": ["pendente", "ativa", "suspensa", "recusada"],"subscription_status": ["ativa", "cancelada", "expirada"],"user_plan": ["free", "premium"],"user_role": ["cliente", "lojista", "admin"]
          }
        }
} as const
