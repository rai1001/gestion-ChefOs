-- Seed sample suppliers/products for compras demo (org-demo)
-- Run in Supabase SQL editor or supabase cli: supabase db execute --file supabase/seed_purchases.sql

insert into suppliers (org_id, name, lead_time_days, delivery_days, cutoff_time, prep_hours, ship_hours, contact_phone, contact_email)
values
  ('org-demo', 'Frutas SA', 1, '{1,3,5}', '16:00', 12, 24, '+34 600 123 123', null),
  ('org-demo', 'Lácteos del Norte', 2, '{2,4,6}', '14:00', 6, 24, '+34 600 222 222', null)
on conflict (id) do nothing;

insert into products (org_id, name, sku, unit, category, cost_cents)
values
  ('org-demo', 'Manzana Fuji', 'APL-FUJ', 'kg', 'Fruta', 220),
  ('org-demo', 'Naranja Navel', 'ORG-NAV', 'kg', 'Fruta', 180),
  ('org-demo', 'Leche entera 1L', 'MILK-1L', 'L', 'Lácteos', 95)
on conflict (id) do nothing;

-- Link catalog items to suppliers (skip if already present)
insert into supplier_products (org_id, supplier_id, product_id, price_cents)
select 'org-demo', s.id, p.id, p.cost_cents
from products p
join suppliers s
  on s.org_id = p.org_id
 and (
   (p.category = 'Fruta' and s.name = 'Frutas SA') or
   (p.category = 'Lácteos' and s.name = 'Lácteos del Norte')
 )
on conflict (id) do nothing;
