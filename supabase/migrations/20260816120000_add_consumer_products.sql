-- Consumer product traceability. Public read; admin write (like news_items / inspection_cards).
CREATE TABLE public.products (
  code TEXT PRIMARY KEY CHECK (char_length(code) BETWEEN 1 AND 64),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 180),
  farm TEXT NOT NULL CHECK (char_length(farm) BETWEEN 1 AND 180),
  region TEXT NOT NULL CHECK (char_length(region) BETWEEN 1 AND 200),
  produced_at TEXT NOT NULL,
  image_url TEXT,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_name_idx ON public.products(name);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Link quality checks to a product so the consumer page can show its lab tests.
ALTER TABLE public.inspection_cards
  ADD COLUMN product_code TEXT REFERENCES public.products(code) ON DELETE SET NULL;
CREATE INDEX inspection_cards_product_code_idx ON public.inspection_cards(product_code);

-- Seed the traceability catalog (same demo products as the fallback UI).
INSERT INTO public.products (code, name, farm, region, produced_at, timeline) VALUES
('MD-CAR-050826-F07', 'Fresh Basket Washed Carrots 500 g', 'GELINO-GRUP SRL', 'Orhei, Republic of Moldova', 'August 7, 2026',
 '[{"stage":"Sowing","date":"March 18, 2026","note":"Field F-07, Orhei - variety Nandrin F1"},{"stage":"Harvest","date":"August 5, 2026","note":"Field F-07, yield 48.6 t/ha"},{"stage":"Washing & sorting","date":"August 6, 2026","note":"Washed with drinking water, calibrated 20-40 mm"},{"stage":"Packaging","date":"August 7, 2026","note":"500 g tray, Fresh Basket brand, GTIN 4842142001196"},{"stage":"Cold storage","date":"August 7, 2026","note":"Cold chain +5...+7 C"},{"stage":"On shelf","date":"August 7, 2026","note":"GELINO-GRUP distribution"}]'::jsonb),
('MAR-2026-001', 'Marata Action 9 Fruits Juice 250 ml', 'Sklavenitis Group', 'Peristeri, Athens, Greece', 'Best before 25.08.2027',
 '[{"stage":"Blending","date":"Greece","note":"100% juice from 9 fruits: apple 30%, peach puree, grape, orange, kiwi, apricot, passion fruit, mango, pineapple"},{"stage":"Vitamins","date":"250 ml pack","note":"7 added vitamins (E, C, B1, B2, B6, B3, B9) - 50% of reference intake each"},{"stage":"Pasteurization","date":"Production line","note":"Heat-treated, stored cool and dry until opening"},{"stage":"Packaging","date":"2026","note":"250 ml SIG aseptic carton, FSC certified, EAN 5202576043978"},{"stage":"On shelf","date":"Sklavenitis","note":"Single pack 0.40 EUR (1.60 EUR/l), shake well before drinking"}]'::jsonb);

-- Link product quality checks (English, matches the consumer UI).
INSERT INTO public.inspection_cards
  (product_name, farm, lab, inspection_date, result, notes, product_code)
VALUES
  ('Fresh Basket Washed Carrots', 'GELINO-GRUP SRL', 'AgroTest', '2026-08-06', 'passed', 'Pesticides', 'MD-CAR-050826-F07'),
  ('Fresh Basket Washed Carrots', 'GELINO-GRUP SRL', 'AgroTest', '2026-08-06', 'passed', 'Nitrates', 'MD-CAR-050826-F07'),
  ('Fresh Basket Washed Carrots', 'GELINO-GRUP SRL', 'SanExpert', '2026-08-06', 'passed', 'Microbiology', 'MD-CAR-050826-F07'),
  ('Marata Action 9 Fruits Juice', 'Sklavenitis Group', 'LabCheck', '2026-08-10', 'passed', 'Sugars & composition', 'MAR-2026-001'),
  ('Marata Action 9 Fruits Juice', 'Sklavenitis Group', 'LabCheck', '2026-08-10', 'passed', 'Vitamins', 'MAR-2026-001'),
  ('Marata Action 9 Fruits Juice', 'Sklavenitis Group', 'SanExpert', '2026-08-11', 'passed', 'Microbiology', 'MAR-2026-001');