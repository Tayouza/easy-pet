-- =====================================================================
-- EasyPet — schema principal
-- =====================================================================

create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.user_role as enum ('cliente', 'lojista', 'admin');
create type public.user_plan as enum ('free', 'premium');
create type public.store_status as enum ('pendente', 'ativa', 'suspensa', 'recusada');
create type public.subscription_status as enum ('ativa', 'cancelada', 'expirada');
create type public.item_kind as enum ('produto', 'servico');
create type public.event_kind as enum ('view', 'whatsapp', 'rota', 'telefone');
create type public.payment_kind as enum ('premium_cliente', 'assinatura_loja');
create type public.payment_method as enum ('pix', 'cartao', 'boleto');

-- ---------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  email text not null default '',
  telefone text,
  avatar_url text,
  role public.user_role not null default 'cliente',
  plano public.user_plan not null default 'free',
  premium_desde timestamptz,
  premium_ate timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------
create table public.categories (
  id text primary key,
  nome text not null,
  icone text not null,          -- nome do ícone (lucide / ionicons) usado pelos apps
  cor text not null,            -- cor do pin no mapa
  ordem int not null default 0
);

create table public.store_plans (
  id text primary key,
  nome text not null,
  preco_centavos int not null,
  max_itens int,                -- null = ilimitado
  permite_cupons boolean not null default false,
  estatisticas boolean not null default false,
  destaque boolean not null default false,
  beneficios text[] not null default '{}',
  ordem int not null default 0
);

-- ---------------------------------------------------------------------
-- Lojas
-- ---------------------------------------------------------------------
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  categoria_id text not null references public.categories (id),
  nome text not null,
  descricao text not null default '',
  endereco text not null,
  bairro text not null default '',
  cidade text not null default 'Porto Alegre',
  uf text not null default 'RS',
  cep text,
  lat double precision not null,
  lng double precision not null,
  location extensions.geography(point, 4326)
    generated always as (extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography) stored,
  telefone text,
  whatsapp text,
  instagram text,
  site text,
  aberto_24h boolean not null default false,
  -- {"0": [["09:00","13:00"]], "1": [["08:00","19:00"]], ...}  (0 = domingo)
  horarios jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  logo_url text,
  capa_url text,
  fotos text[] not null default '{}',
  status public.store_status not null default 'pendente',
  destaque boolean not null default false,
  nota_media numeric(2, 1) not null default 0,
  total_avaliacoes int not null default 0,
  motivo_status text,
  aprovada_em timestamptz,
  created_at timestamptz not null default now()
);

create index stores_location_idx on public.stores using gist (location);
create index stores_owner_idx on public.stores (owner_id);
create index stores_status_idx on public.stores (status);

create table public.store_items (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  tipo public.item_kind not null default 'produto',
  nome text not null,
  descricao text not null default '',
  preco_centavos int,
  preco_a_partir boolean not null default false,
  imagem_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index store_items_store_idx on public.store_items (store_id);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  codigo text not null,
  titulo text not null,
  descricao text not null default '',
  desconto text not null,       -- "15% OFF", "R$ 20 OFF", "Frete grátis"
  validade date,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index coupons_store_idx on public.coupons (store_id);

-- ---------------------------------------------------------------------
-- Assinaturas e pagamentos (simulados)
-- ---------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  plan_id text not null references public.store_plans (id),
  status public.subscription_status not null default 'ativa',
  valor_centavos int not null,
  inicio timestamptz not null default now(),
  fim timestamptz,
  created_at timestamptz not null default now()
);
create index subscriptions_store_idx on public.subscriptions (store_id);
create unique index subscriptions_one_active on public.subscriptions (store_id) where status = 'ativa';

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  store_id uuid references public.stores (id) on delete set null,
  tipo public.payment_kind not null,
  plan_id text,
  metodo public.payment_method not null default 'pix',
  valor_centavos int not null,
  status text not null default 'aprovado',
  created_at timestamptz not null default now()
);
create index payments_created_idx on public.payments (created_at);

-- ---------------------------------------------------------------------
-- Interações
-- ---------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  autor_nome text not null default '',
  nota int not null check (nota between 1 and 5),
  comentario text not null default '',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);
create index reviews_store_idx on public.reviews (store_id);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  store_id uuid not null references public.stores (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, store_id)
);

create table public.store_events (
  id bigint generated always as identity primary key,
  store_id uuid not null references public.stores (id) on delete cascade,
  tipo public.event_kind not null,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index store_events_store_idx on public.store_events (store_id, created_at);

-- ---------------------------------------------------------------------
-- Carteirinha do pet (benefício Premium)
-- ---------------------------------------------------------------------
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  nome text not null,
  especie text not null default 'Cachorro',
  raca text,
  nascimento date,
  peso_kg numeric(5, 2),
  foto_url text,
  created_at timestamptz not null default now()
);

create table public.pet_vaccines (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  nome text not null,
  aplicada_em date not null,
  proxima_dose date,
  created_at timestamptz not null default now()
);
