-- Tea-focus catalogue: add the "Tea Blends" category and the eight microgreen
-- tea-bag blends the client provided. These are the primary product line for the
-- app's tea-first direction; the mobile Explore screen ("Tea Blends") filters to
-- packs named "… (Bag)" / products in this category.

insert into public.categories (slug, name, description, image, icon, color) values
  ('tea-blends', 'Tea Blends', 'Functional microgreen tea blends — brewed fresh, caffeine-free.', '', 'cafe', '#6f8f4a')
on conflict (slug) do nothing;

insert into public.products
  (slug, name, description, price, category_id, unit, weight, nutrition, benefits, storage,
   is_featured, is_seasonal, is_best_seller, rating, review_count, tags, stock, is_available, created_at)
values
  ('green-vitality-bag', 'Green Vitality (Bag)',
   'Pea shoots + broccoli microgreens with lemongrass and mint. Fresh, mild, and refreshing everyday green goodness.',
   150, (select id from public.categories where slug = 'tea-blends'), 'box', '15 sachets',
   jsonb_build_object('calories', 2, 'protein', '0g', 'carbs', '0g', 'fat', '0g', 'fiber', '0g', 'vitamins', ARRAY['Vitamin K', 'Antioxidants']::text[]),
   ARRAY['Everyday green wellness', 'Naturally caffeine-free']::text[], 'Store in a cool, dry place.',
   true, false, true, 4.7, 34, ARRAY['tea', 'blend', 'everyday', 'caffeine-free']::text[], 100, true, '2026-09-08'::date),

  ('green-lemon-bag', 'Green Lemon (Bag)',
   'Broccoli + sunflower microgreens with lemongrass and lemon peel. Light, citrusy, and vibrant.',
   150, (select id from public.categories where slug = 'tea-blends'), 'box', '15 sachets',
   jsonb_build_object('calories', 2, 'protein', '0g', 'carbs', '0g', 'fat', '0g', 'fiber', '0g', 'vitamins', ARRAY['Vitamin C', 'Antioxidants']::text[]),
   ARRAY['Bright citrus lift', 'Naturally caffeine-free']::text[], 'Store in a cool, dry place.',
   false, false, true, 4.6, 21, ARRAY['tea', 'blend', 'citrus', 'caffeine-free']::text[], 100, true, '2026-09-08'::date),

  ('green-detox-bag', 'Green Detox (Bag)',
   'Broccoli + arugula microgreens with mint and coriander. Fresh with a gentle spicy kick for daily wellness.',
   150, (select id from public.categories where slug = 'tea-blends'), 'box', '15 sachets',
   jsonb_build_object('calories', 2, 'protein', '0g', 'carbs', '0g', 'fat', '0g', 'fiber', '0g', 'vitamins', ARRAY['Chlorophyll', 'Antioxidants']::text[]),
   ARRAY['Daily detox support', 'Naturally caffeine-free']::text[], 'Store in a cool, dry place.',
   false, false, false, 4.5, 18, ARRAY['tea', 'blend', 'everyday', 'detox', 'caffeine-free']::text[], 100, true, '2026-09-08'::date),

  ('green-masala-bag', 'Green Masala (Bag)',
   'Pea shoots + broccoli microgreens with ginger, tulsi, and cardamom. A warm, aromatic Indian herbal-tea style blend.',
   150, (select id from public.categories where slug = 'tea-blends'), 'box', '15 sachets',
   jsonb_build_object('calories', 3, 'protein', '0g', 'carbs', '1g', 'fat', '0g', 'fiber', '0g', 'vitamins', ARRAY['Antioxidants']::text[]),
   ARRAY['Warming and aromatic', 'Naturally caffeine-free']::text[], 'Store in a cool, dry place.',
   true, false, true, 4.8, 29, ARRAY['tea', 'blend', 'spiced', 'masala', 'caffeine-free']::text[], 100, true, '2026-09-08'::date),

  ('mint-green-bag', 'Mint Green (Bag)',
   'Broccoli + pea microgreens with refreshing mint and lemongrass. Cool, light, and naturally soothing.',
   150, (select id from public.categories where slug = 'tea-blends'), 'box', '15 sachets',
   jsonb_build_object('calories', 2, 'protein', '0g', 'carbs', '0g', 'fat', '0g', 'fiber', '0g', 'vitamins', ARRAY['Antioxidants']::text[]),
   ARRAY['Cooling and soothing', 'Naturally caffeine-free']::text[], 'Store in a cool, dry place.',
   false, false, true, 4.7, 25, ARRAY['tea', 'blend', 'minty', 'caffeine-free']::text[], 100, true, '2026-09-08'::date),

  ('green-apple-bag', 'Green Apple (Bag)',
   'Broccoli + sunflower microgreens with dried apple and cinnamon. Mild, fruity, and subtly sweet.',
   150, (select id from public.categories where slug = 'tea-blends'), 'box', '15 sachets',
   jsonb_build_object('calories', 4, 'protein', '0g', 'carbs', '1g', 'fat', '0g', 'fiber', '0g', 'vitamins', ARRAY['Antioxidants']::text[]),
   ARRAY['Naturally sweet, no sugar added', 'Naturally caffeine-free']::text[], 'Store in a cool, dry place.',
   false, false, false, 4.5, 16, ARRAY['tea', 'blend', 'fruity', 'caffeine-free']::text[], 100, true, '2026-09-08'::date),

  ('ginger-green-bag', 'Ginger Green (Bag)',
   'Broccoli + pea microgreens with warming ginger and zesty lemon peel. Warm, citrusy with a comforting kick.',
   150, (select id from public.categories where slug = 'tea-blends'), 'box', '15 sachets',
   jsonb_build_object('calories', 3, 'protein', '0g', 'carbs', '1g', 'fat', '0g', 'fiber', '0g', 'vitamins', ARRAY['Antioxidants']::text[]),
   ARRAY['Warming and comforting', 'Naturally caffeine-free']::text[], 'Store in a cool, dry place.',
   false, false, false, 4.6, 19, ARRAY['tea', 'blend', 'warming', 'ginger', 'caffeine-free']::text[], 100, true, '2026-09-08'::date),

  ('green-hibiscus-bag', 'Green Hibiscus (Bag)',
   'Sunflower microgreens with hibiscus, mint, and lemon peel. Tart, refreshing, and naturally uplifting.',
   150, (select id from public.categories where slug = 'tea-blends'), 'box', '15 sachets',
   jsonb_build_object('calories', 2, 'protein', '0g', 'carbs', '0g', 'fat', '0g', 'fiber', '0g', 'vitamins', ARRAY['Vitamin C', 'Antioxidants']::text[]),
   ARRAY['Tart and uplifting', 'Naturally caffeine-free']::text[], 'Store in a cool, dry place.',
   false, false, true, 4.7, 23, ARRAY['tea', 'blend', 'floral', 'hibiscus', 'caffeine-free']::text[], 100, true, '2026-09-08'::date)
on conflict (slug) do nothing;
