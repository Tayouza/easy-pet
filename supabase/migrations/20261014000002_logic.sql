-- =====================================================================
-- EasyPet — funções auxiliares, triggers e regras de negócio
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helpers de autorização
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_premium()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and plano = 'premium' and (premium_ate is null or premium_ate > now())
  );
$$;

create or replace function public.owns_store(p_store_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from stores where id = p_store_id and owner_id = auth.uid());
$$;

-- Plano ativo da loja (ou null)
create or replace function public.store_active_plan(p_store_id uuid)
returns public.store_plans language sql stable security definer set search_path = public as $$
  select sp.* from subscriptions s join store_plans sp on sp.id = s.plan_id
  where s.store_id = p_store_id and s.status = 'ativa'
  limit 1;
$$;

-- ---------------------------------------------------------------------
-- Novo usuário → perfil
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role := 'cliente';
begin
  if new.raw_user_meta_data ->> 'role' = 'lojista' then
    v_role := 'lojista';
  end if;
  insert into profiles (id, nome, email, telefone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'telefone',
    v_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Proteções: usuários comuns não alteram campos sensíveis
-- (funções security definer rodam como "postgres" e passam livremente)
-- ---------------------------------------------------------------------
create or replace function public.guard_profile_update()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.role is distinct from old.role
       or new.plano is distinct from old.plano
       or new.premium_ate is distinct from old.premium_ate
       or new.premium_desde is distinct from old.premium_desde then
      raise exception 'Operação não permitida';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

create or replace function public.guard_store_write()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pendente';
      new.destaque := false;
      new.nota_media := 0;
      new.total_avaliacoes := 0;
      new.aprovada_em := null;
    else
      new.status := old.status;
      new.destaque := old.destaque;
      new.nota_media := old.nota_media;
      new.total_avaliacoes := old.total_avaliacoes;
      new.aprovada_em := old.aprovada_em;
      new.owner_id := old.owner_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger stores_guard before insert or update on public.stores
  for each row execute function public.guard_store_write();

-- ---------------------------------------------------------------------
-- Limites por plano
-- ---------------------------------------------------------------------
create or replace function public.enforce_item_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plan store_plans;
  v_count int;
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;
  v_plan := public.store_active_plan(new.store_id);
  if v_plan.id is null then
    raise exception 'PLANO_NECESSARIO: assine um plano para cadastrar produtos e serviços';
  end if;
  if v_plan.max_itens is not null then
    select count(*) into v_count from store_items where store_id = new.store_id;
    if v_count >= v_plan.max_itens then
      raise exception 'LIMITE_ITENS: o plano % permite até % itens', v_plan.nome, v_plan.max_itens;
    end if;
  end if;
  return new;
end;
$$;

create trigger store_items_limit before insert on public.store_items
  for each row execute function public.enforce_item_limit();

create or replace function public.enforce_coupon_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plan store_plans;
begin
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;
  v_plan := public.store_active_plan(new.store_id);
  if v_plan.id is null or not v_plan.permite_cupons then
    raise exception 'PLANO_SEM_CUPONS: cupons estão disponíveis a partir do plano Profissional';
  end if;
  return new;
end;
$$;

create trigger coupons_plan before insert on public.coupons
  for each row execute function public.enforce_coupon_plan();

create or replace function public.enforce_favorite_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_count int;
  v_premium boolean;
begin
  select (plano = 'premium' and (premium_ate is null or premium_ate > now()))
    into v_premium from profiles where id = new.user_id;
  if coalesce(v_premium, false) then
    return new;
  end if;
  select count(*) into v_count from favorites where user_id = new.user_id;
  if v_count >= 5 then
    raise exception 'LIMITE_FAVORITOS: a versão gratuita permite até 5 favoritos';
  end if;
  return new;
end;
$$;

create trigger favorites_limit before insert on public.favorites
  for each row execute function public.enforce_favorite_limit();

-- ---------------------------------------------------------------------
-- Avaliações: nome do autor + nota média da loja
-- ---------------------------------------------------------------------
create or replace function public.review_fill_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select nome into new.autor_nome from profiles where id = new.user_id;
  return new;
end;
$$;

create trigger reviews_author before insert or update on public.reviews
  for each row execute function public.review_fill_author();

create or replace function public.refresh_store_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_store uuid := coalesce(new.store_id, old.store_id);
begin
  update stores s set
    nota_media = coalesce((select round(avg(nota)::numeric, 1) from reviews where store_id = v_store), 0),
    total_avaliacoes = (select count(*) from reviews where store_id = v_store)
  where s.id = v_store;
  return null;
end;
$$;

create trigger reviews_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_store_rating();

-- ---------------------------------------------------------------------
-- Busca geográfica
-- ---------------------------------------------------------------------
create or replace function public.nearby_stores(
  p_lat double precision,
  p_lng double precision,
  p_raio_m double precision default 5000,
  p_categoria text default null,
  p_busca text default null
)
returns table (
  id uuid,
  nome text,
  descricao text,
  categoria_id text,
  endereco text,
  bairro text,
  lat double precision,
  lng double precision,
  telefone text,
  whatsapp text,
  aberto_24h boolean,
  horarios jsonb,
  tags text[],
  logo_url text,
  capa_url text,
  destaque boolean,
  nota_media numeric,
  total_avaliacoes int,
  distancia_m double precision
)
language sql stable set search_path = public, extensions as $$
  select
    s.id, s.nome, s.descricao, s.categoria_id, s.endereco, s.bairro, s.lat, s.lng,
    s.telefone, s.whatsapp, s.aberto_24h, s.horarios, s.tags, s.logo_url, s.capa_url,
    s.destaque, s.nota_media, s.total_avaliacoes,
    st_distance(s.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) as distancia_m
  from stores s
  where s.status = 'ativa'
    and st_dwithin(s.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, p_raio_m)
    and (p_categoria is null or s.categoria_id = p_categoria)
    and (
      p_busca is null or p_busca = ''
      or s.nome ilike '%' || p_busca || '%'
      or s.descricao ilike '%' || p_busca || '%'
      or s.bairro ilike '%' || p_busca || '%'
      or exists (select 1 from unnest(s.tags) t where t ilike '%' || p_busca || '%')
      or exists (select 1 from store_items i where i.store_id = s.id and i.ativo and i.nome ilike '%' || p_busca || '%')
    )
  order by s.destaque desc, distancia_m asc;
$$;

-- ---------------------------------------------------------------------
-- Cupons de uma loja (código só aparece para Premium, dono ou admin)
-- ---------------------------------------------------------------------
create or replace function public.store_coupons(p_store_id uuid)
returns table (
  id uuid, titulo text, descricao text, desconto text, validade date, codigo text, bloqueado boolean
)
language sql stable security definer set search_path = public as $$
  select c.id, c.titulo, c.descricao, c.desconto, c.validade,
    case when public.is_premium() or public.owns_store(p_store_id) or public.is_admin() then c.codigo end,
    not (public.is_premium() or public.owns_store(p_store_id) or public.is_admin())
  from coupons c
  join stores s on s.id = c.store_id
  where c.store_id = p_store_id and c.ativo and s.status = 'ativa'
    and (c.validade is null or c.validade >= current_date)
  order by c.created_at desc;
$$;

-- Todos os cupons ativos (tela "Cupons" do Premium)
create or replace function public.all_coupons()
returns table (
  id uuid, store_id uuid, store_nome text, categoria_id text, titulo text, descricao text,
  desconto text, validade date, codigo text, bloqueado boolean
)
language sql stable security definer set search_path = public as $$
  select c.id, s.id, s.nome, s.categoria_id, c.titulo, c.descricao, c.desconto, c.validade,
    case when public.is_premium() or public.is_admin() then c.codigo end,
    not (public.is_premium() or public.is_admin())
  from coupons c
  join stores s on s.id = c.store_id
  where c.ativo and s.status = 'ativa' and (c.validade is null or c.validade >= current_date)
  order by s.destaque desc, c.created_at desc;
$$;

-- ---------------------------------------------------------------------
-- Checkout simulado
-- ---------------------------------------------------------------------
create or replace function public.assinar_premium(p_metodo public.payment_method default 'pix')
returns public.profiles language plpgsql security definer set search_path = public as $$
declare
  v_profile profiles;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  update profiles set
    plano = 'premium',
    premium_desde = coalesce(case when plano = 'premium' then premium_desde end, now()),
    premium_ate = greatest(coalesce(premium_ate, now()), now()) + interval '30 days'
  where id = auth.uid()
  returning * into v_profile;

  insert into payments (user_id, tipo, metodo, valor_centavos, plan_id)
  values (auth.uid(), 'premium_cliente', p_metodo, 990, 'premium');
  return v_profile;
end;
$$;

create or replace function public.cancelar_premium()
returns public.profiles language plpgsql security definer set search_path = public as $$
declare
  v_profile profiles;
begin
  update profiles set plano = 'free', premium_ate = null, premium_desde = null
  where id = auth.uid() returning * into v_profile;
  return v_profile;
end;
$$;

create or replace function public.assinar_plano_loja(
  p_store_id uuid,
  p_plan_id text,
  p_metodo public.payment_method default 'pix'
)
returns public.subscriptions language plpgsql security definer set search_path = public as $$
declare
  v_plan store_plans;
  v_sub subscriptions;
begin
  if not (public.owns_store(p_store_id) or public.is_admin()) then
    raise exception 'Loja não pertence a este usuário';
  end if;
  select * into v_plan from store_plans where id = p_plan_id;
  if v_plan.id is null then raise exception 'Plano inválido'; end if;

  update subscriptions set status = 'cancelada', fim = now()
  where store_id = p_store_id and status = 'ativa';

  insert into subscriptions (store_id, plan_id, valor_centavos)
  values (p_store_id, p_plan_id, v_plan.preco_centavos)
  returning * into v_sub;

  update stores set destaque = v_plan.destaque where id = p_store_id;

  insert into payments (user_id, store_id, tipo, plan_id, metodo, valor_centavos)
  values ((select owner_id from stores where id = p_store_id), p_store_id, 'assinatura_loja', p_plan_id, p_metodo, v_plan.preco_centavos);

  return v_sub;
end;
$$;

create or replace function public.cancelar_plano_loja(p_store_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.owns_store(p_store_id) or public.is_admin()) then
    raise exception 'Loja não pertence a este usuário';
  end if;
  update subscriptions set status = 'cancelada', fim = now()
  where store_id = p_store_id and status = 'ativa';
  update stores set destaque = false where id = p_store_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Moderação (admin)
-- ---------------------------------------------------------------------
create or replace function public.moderar_loja(p_store_id uuid, p_status public.store_status, p_motivo text default null)
returns public.stores language plpgsql security definer set search_path = public as $$
declare
  v_store stores;
begin
  if not public.is_admin() then raise exception 'Apenas administradores'; end if;
  update stores set
    status = p_status,
    motivo_status = p_motivo,
    aprovada_em = case when p_status = 'ativa' then coalesce(aprovada_em, now()) else aprovada_em end
  where id = p_store_id
  returning * into v_store;
  return v_store;
end;
$$;

-- ---------------------------------------------------------------------
-- Métricas
-- ---------------------------------------------------------------------
create or replace function public.registrar_evento(p_store_id uuid, p_tipo public.event_kind)
returns void language sql security definer set search_path = public as $$
  insert into store_events (store_id, tipo, user_id) values (p_store_id, p_tipo, auth.uid());
$$;

create or replace function public.store_stats(p_store_id uuid, p_dias int default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v jsonb;
begin
  if not (public.owns_store(p_store_id) or public.is_admin()) then
    raise exception 'Sem permissão';
  end if;
  select jsonb_build_object(
    'views', count(*) filter (where tipo = 'view'),
    'whatsapp', count(*) filter (where tipo = 'whatsapp'),
    'rota', count(*) filter (where tipo = 'rota'),
    'telefone', count(*) filter (where tipo = 'telefone'),
    'favoritos', (select count(*) from favorites where store_id = p_store_id),
    'serie', (
      select coalesce(jsonb_agg(jsonb_build_object('dia', d::date, 'views', coalesce(x.views, 0), 'contatos', coalesce(x.contatos, 0)) order by d), '[]'::jsonb)
      from generate_series(current_date - (p_dias - 1), current_date, interval '1 day') d
      left join (
        select created_at::date dia,
          count(*) filter (where tipo = 'view') views,
          count(*) filter (where tipo <> 'view') contatos
        from store_events where store_id = p_store_id and created_at >= current_date - (p_dias - 1)
        group by 1
      ) x on x.dia = d::date
    )
  ) into v
  from store_events
  where store_id = p_store_id and created_at >= current_date - (p_dias - 1);
  return v;
end;
$$;

create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v jsonb;
begin
  if not public.is_admin() then raise exception 'Apenas administradores'; end if;
  select jsonb_build_object(
    'lojas_ativas', (select count(*) from stores where status = 'ativa'),
    'lojas_pendentes', (select count(*) from stores where status = 'pendente'),
    'clientes', (select count(*) from profiles where role = 'cliente'),
    'lojistas', (select count(*) from profiles where role = 'lojista'),
    'premium', (select count(*) from profiles where plano = 'premium' and (premium_ate is null or premium_ate > now())),
    'mrr_lojas', (select coalesce(sum(valor_centavos), 0) from subscriptions where status = 'ativa'),
    'mrr_premium', (select count(*) * 990 from profiles where plano = 'premium' and (premium_ate is null or premium_ate > now())),
    'receita_mensal', (
      select coalesce(jsonb_agg(jsonb_build_object('mes', to_char(m, 'YYYY-MM'), 'lojas', coalesce(x.lojas, 0), 'premium', coalesce(x.premium, 0)) order by m), '[]'::jsonb)
      from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
      left join (
        select date_trunc('month', created_at) mes,
          sum(valor_centavos) filter (where tipo = 'assinatura_loja') lojas,
          sum(valor_centavos) filter (where tipo = 'premium_cliente') premium
        from payments group by 1
      ) x on x.mes = m
    ),
    'lojas_por_categoria', (
      select coalesce(jsonb_agg(jsonb_build_object('categoria', c.nome, 'cor', c.cor, 'total', coalesce(x.total, 0)) order by x.total desc nulls last), '[]'::jsonb)
      from categories c
      left join (select categoria_id, count(*) total from stores where status = 'ativa' group by 1) x on x.categoria_id = c.id
    ),
    'assinaturas_por_plano', (
      select coalesce(jsonb_agg(jsonb_build_object('plano', sp.nome, 'total', coalesce(x.total, 0)) order by sp.ordem), '[]'::jsonb)
      from store_plans sp
      left join (select plan_id, count(*) total from subscriptions where status = 'ativa' group by 1) x on x.plan_id = sp.id
    )
  ) into v;
  return v;
end;
$$;
