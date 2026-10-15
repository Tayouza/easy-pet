-- =====================================================================
-- EasyPet — endurecimento
-- =====================================================================

-- registrar_evento: ignora (sem erro) lojas que não estejam ativas.
-- "create or replace" preserva os grants (anon + authenticated).
create or replace function public.registrar_evento(p_store_id uuid, p_tipo public.event_kind)
returns void language sql security definer set search_path = public as $$
  insert into store_events (store_id, tipo, user_id)
  select s.id, p_tipo, auth.uid()
  from stores s
  where s.id = p_store_id and s.status = 'ativa';
$$;
