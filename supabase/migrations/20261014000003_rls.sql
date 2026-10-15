-- =====================================================================
-- EasyPet — Row Level Security, grants e storage
-- =====================================================================
-- Convenções:
--  * Políticas para "anon" nunca chamam helpers (is_admin, owns_store...):
--    anon não tem EXECUTE neles. Políticas "to authenticated" podem chamar.
--  * Escrita sensível (assinaturas, pagamentos, moderação, eventos) só via
--    RPC security definer — sem políticas de escrita nessas tabelas.

-- ---------------------------------------------------------------------
-- Helper extra
-- ---------------------------------------------------------------------
create or replace function public.is_lojista()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'lojista');
$$;

-- ---------------------------------------------------------------------
-- RLS ligado em todas as tabelas
-- ---------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.store_plans   enable row level security;
alter table public.stores        enable row level security;
alter table public.store_items   enable row level security;
alter table public.coupons       enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments      enable row level security;
alter table public.reviews       enable row level security;
alter table public.favorites     enable row level security;
alter table public.store_events  enable row level security;
alter table public.pets          enable row level security;
alter table public.pet_vaccines  enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- o trigger profiles_guard impede mudar role/plano/premium_*
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- categories / store_plans (catálogo público)
-- ---------------------------------------------------------------------
create policy categories_select on public.categories for select to anon, authenticated
  using (true);
create policy categories_admin_insert on public.categories for insert to authenticated
  with check (public.is_admin());
create policy categories_admin_update on public.categories for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy categories_admin_delete on public.categories for delete to authenticated
  using (public.is_admin());

create policy store_plans_select on public.store_plans for select to anon, authenticated
  using (true);
create policy store_plans_admin_insert on public.store_plans for insert to authenticated
  with check (public.is_admin());
create policy store_plans_admin_update on public.store_plans for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy store_plans_admin_delete on public.store_plans for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- stores
-- ---------------------------------------------------------------------
create policy stores_select_anon on public.stores for select to anon
  using (status = 'ativa');
create policy stores_select on public.stores for select to authenticated
  using (status = 'ativa' or owner_id = auth.uid() or public.is_admin());

-- o trigger stores_guard força status 'pendente' e zera destaque/nota
create policy stores_insert on public.stores for insert to authenticated
  with check ((owner_id = auth.uid() and public.is_lojista()) or public.is_admin());

create policy stores_update on public.stores for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy stores_delete on public.stores for delete to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- store_items
-- ---------------------------------------------------------------------
create policy store_items_select_anon on public.store_items for select to anon
  using (ativo and exists (select 1 from public.stores s where s.id = store_id and s.status = 'ativa'));
create policy store_items_select on public.store_items for select to authenticated
  using (
    (ativo and exists (select 1 from public.stores s where s.id = store_id and s.status = 'ativa'))
    or public.owns_store(store_id) or public.is_admin()
  );
create policy store_items_insert on public.store_items for insert to authenticated
  with check (public.owns_store(store_id) or public.is_admin());
create policy store_items_update on public.store_items for update to authenticated
  using (public.owns_store(store_id) or public.is_admin())
  with check (public.owns_store(store_id) or public.is_admin());
create policy store_items_delete on public.store_items for delete to authenticated
  using (public.owns_store(store_id) or public.is_admin());

-- ---------------------------------------------------------------------
-- coupons (público lê via RPC store_coupons / all_coupons)
-- ---------------------------------------------------------------------
create policy coupons_select on public.coupons for select to authenticated
  using (public.owns_store(store_id) or public.is_admin());
create policy coupons_insert on public.coupons for insert to authenticated
  with check (public.owns_store(store_id) or public.is_admin());
create policy coupons_update on public.coupons for update to authenticated
  using (public.owns_store(store_id) or public.is_admin())
  with check (public.owns_store(store_id) or public.is_admin());
create policy coupons_delete on public.coupons for delete to authenticated
  using (public.owns_store(store_id) or public.is_admin());

-- ---------------------------------------------------------------------
-- subscriptions / payments (escrita só via RPC)
-- ---------------------------------------------------------------------
create policy subscriptions_select on public.subscriptions for select to authenticated
  using (public.owns_store(store_id) or public.is_admin());

create policy payments_select on public.payments for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------
create policy reviews_select on public.reviews for select to anon, authenticated
  using (true);
-- só em loja ativa e nunca na própria loja
create policy reviews_insert on public.reviews for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.stores s where s.id = store_id and s.status = 'ativa')
    and not public.owns_store(store_id)
  );
create policy reviews_update on public.reviews for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy reviews_delete on public.reviews for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------
create policy favorites_select on public.favorites for select to authenticated
  using (user_id = auth.uid());
create policy favorites_insert on public.favorites for insert to authenticated
  with check (user_id = auth.uid());
create policy favorites_delete on public.favorites for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- store_events (insert só via registrar_evento)
-- ---------------------------------------------------------------------
create policy store_events_select on public.store_events for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- pets / pet_vaccines (carteirinha — Premium)
-- ---------------------------------------------------------------------
create policy pets_select on public.pets for select to authenticated
  using (owner_id = auth.uid());
create policy pets_insert on public.pets for insert to authenticated
  with check (owner_id = auth.uid() and public.is_premium());
create policy pets_update on public.pets for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
create policy pets_delete on public.pets for delete to authenticated
  using (owner_id = auth.uid());

create policy pet_vaccines_select on public.pet_vaccines for select to authenticated
  using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));
create policy pet_vaccines_insert on public.pet_vaccines for insert to authenticated
  with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));
create policy pet_vaccines_update on public.pet_vaccines for update to authenticated
  using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));
create policy pet_vaccines_delete on public.pet_vaccines for delete to authenticated
  using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

-- ---------------------------------------------------------------------
-- Grants de funções: anon só executa as RPCs públicas
-- ---------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;

grant execute on function public.nearby_stores(double precision, double precision, double precision, text, text) to anon;
grant execute on function public.store_coupons(uuid) to anon;
grant execute on function public.all_coupons() to anon;
grant execute on function public.registrar_evento(uuid, public.event_kind) to anon;

-- funções criadas em migrations futuras também nascem fechadas para anon
alter default privileges for role postgres in schema public revoke execute on functions from public, anon;

-- ---------------------------------------------------------------------
-- Storage: bucket público de imagens das lojas
--   leitura pública; escrita só em "<auth.uid()>/..."
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-images', 'store-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy store_images_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'store-images');
create policy store_images_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'store-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy store_images_update on storage.objects for update to authenticated
  using (bucket_id = 'store-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'store-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy store_images_delete on storage.objects for delete to authenticated
  using (bucket_id = 'store-images' and (storage.foldername(name))[1] = auth.uid()::text);
