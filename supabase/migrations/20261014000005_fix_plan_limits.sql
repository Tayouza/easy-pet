-- =====================================================================
-- EasyPet — corrige enforce_item_limit / enforce_coupon_plan (limites por plano)
-- =====================================================================
-- Bug (QA): as duas funções são SECURITY DEFINER, então current_user é
-- sempre o dono (postgres) e o "current_user not in ('authenticated','anon')"
-- retornava cedo → limite de itens e bloqueio de cupons nunca rodavam.
-- auth.role() lê a role do JWT da requisição (GUC), que não muda dentro de
-- SECURITY DEFINER. Fora da API (psql, seed, migrations) é null → coalesce
-- mantém o bypass para essas conexões administrativas e para service_role.

create or replace function public.enforce_item_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plan store_plans;
  v_count int;
begin
  if coalesce(auth.role(), '') not in ('authenticated', 'anon') or public.is_admin() then
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

create or replace function public.enforce_coupon_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plan store_plans;
begin
  if coalesce(auth.role(), '') not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;
  v_plan := public.store_active_plan(new.store_id);
  if v_plan.id is null or not v_plan.permite_cupons then
    raise exception 'PLANO_SEM_CUPONS: cupons estão disponíveis a partir do plano Profissional';
  end if;
  return new;
end;
$$;
