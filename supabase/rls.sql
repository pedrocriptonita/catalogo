-- ============================================================================
-- Row Level Security (RLS) — Catálogo de Atacado
-- ============================================================================
-- Contexto importante:
--   * O app Next.js conecta via Prisma com o usuário `postgres` (dono das
--     tabelas), que NÃO é afetado por RLS. Estas policies protegem o acesso
--     via Data API do Supabase (PostgREST) com as chaves anon/authenticated.
--   * Leitura pública: apenas registros visíveis da vitrine.
--   * Escrita: somente usuários autenticados presentes em `admins`.
-- Idempotente: pode ser executado mais de uma vez.
-- ============================================================================

-- 1) Habilita RLS em todas as tabelas -----------------------------------------
alter table public.admins          enable row level security;
alter table public.stores          enable row level security;
alter table public.categories     enable row level security;
alter table public.products        enable row level security;
alter table public.product_images enable row level security;
alter table public.product_colors enable row level security;

-- 2) Função auxiliar: usuário logado é admin? --------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where a.auth_id = (select auth.uid())::text
      and a.deleted_at is null
  );
$$;

-- 3) Leitura pública (anon + authenticated) ----------------------------------
drop policy if exists "public_read_stores" on public.stores;
create policy "public_read_stores"
  on public.stores for select
  to anon, authenticated
  using (true);

drop policy if exists "public_read_categories" on public.categories;
create policy "public_read_categories"
  on public.categories for select
  to anon, authenticated
  using (deleted_at is null);

drop policy if exists "public_read_products" on public.products;
create policy "public_read_products"
  on public.products for select
  to anon, authenticated
  using (is_active = true and deleted_at is null);

drop policy if exists "public_read_product_images" on public.product_images;
create policy "public_read_product_images"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.is_active = true
        and p.deleted_at is null
    )
  );

drop policy if exists "public_read_product_colors" on public.product_colors;
create policy "public_read_product_colors"
  on public.product_colors for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.is_active = true
        and p.deleted_at is null
    )
  );

-- 4) Admin: leitura completa + escrita ----------------------------------------
drop policy if exists "admin_select_admins" on public.admins;
create policy "admin_select_admins"
  on public.admins for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin_all_stores" on public.stores;
create policy "admin_all_stores"
  on public.stores for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_all_categories" on public.categories;
create policy "admin_all_categories"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_all_products" on public.products;
create policy "admin_all_products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_all_product_images" on public.product_images;
create policy "admin_all_product_images"
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_all_product_colors" on public.product_colors;
create policy "admin_all_product_colors"
  on public.product_colors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5) Storage: bucket `products` -----------------------------------------------
-- Leitura pública; upload/update/delete apenas para admins autenticados.
drop policy if exists "public_read_products_bucket" on storage.objects;
create policy "public_read_products_bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists "admin_insert_products_bucket" on storage.objects;
create policy "admin_insert_products_bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "admin_update_products_bucket" on storage.objects;
create policy "admin_update_products_bucket"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists "admin_delete_products_bucket" on storage.objects;
create policy "admin_delete_products_bucket"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and public.is_admin());
