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
('TOM-2026-001', 'Pink Cherry Tomatoes', 'Zarya Farm', 'Krasnodar Krai, Poltavskaya stanitsa', 'July 22, 2026',
 '[{"stage":"Sowing","date":"March 12, 2026","note":"Plot #2, greenhouse"},{"stage":"Harvest","date":"July 20, 2026","note":"Hand-picked, 95% ripeness"},{"stage":"Packaging","date":"July 22, 2026","note":"500 g container, bio-film"},{"stage":"Inspection","date":"July 23, 2026","note":"AgroTest laboratory"},{"stage":"On shelf","date":"July 25, 2026","note":"Pyaterochka chain, Krasnodar"}]'::jsonb),
('CUC-2026-014', 'Field-grown Cucumbers', 'Polesye Farm', 'Bryansk Region, Dubrovka village', 'July 20, 2026',
 '[{"stage":"Sowing","date":"May 01, 2026","note":"Open field, plot #4"},{"stage":"Harvest","date":"July 18, 2026","note":"Mechanized harvest"},{"stage":"Packaging","date":"July 20, 2026","note":"5 kg crates"},{"stage":"Inspection","date":"July 21, 2026","note":"BioLab laboratory"},{"stage":"On shelf","date":"July 23, 2026","note":"Magnit, Bryansk"}]'::jsonb),
('EGG-2026-088', 'Grade C1 Free-Range Chicken Eggs', 'Utro Farm', 'Tula Region, Ramenye village', 'July 25, 2026',
 '[{"stage":"Laying","date":"July 23-25, 2026","note":"Laying hens, Lohmann Brown breed"},{"stage":"Sorting","date":"July 25, 2026","note":"Automatic by weight"},{"stage":"Packaging","date":"July 25, 2026","note":"Cardboard tray, 10 pcs"},{"stage":"Inspection","date":"July 26, 2026","note":"Veterinary service"},{"stage":"On shelf","date":"July 27, 2026","note":"VkusVill, Tula"}]'::jsonb),
('MD-CAR-050826-F07', 'Fresh Basket Washed Carrots 500 g', 'GELINO-GRUP SRL', 'Orhei, Republic of Moldova', 'August 7, 2026',
 '[{"stage":"Sowing","date":"March 18, 2026","note":"Field F-07, Orhei - variety Nandrin F1"},{"stage":"Harvest","date":"August 5, 2026","note":"Field F-07, yield 48.6 t/ha"},{"stage":"Washing & sorting","date":"August 6, 2026","note":"Washed with drinking water, calibrated 20-40 mm"},{"stage":"Packaging","date":"August 7, 2026","note":"500 g tray, Fresh Basket brand, GTIN 4842142001196"},{"stage":"Cold storage","date":"August 7, 2026","note":"Cold chain +5...+7 C"},{"stage":"On shelf","date":"August 7, 2026","note":"GELINO-GRUP distribution"}]'::jsonb);

-- Link product quality checks (English, matches the consumer UI).
INSERT INTO public.inspection_cards
  (product_name, farm, lab, inspection_date, result, notes, product_code)
VALUES
  ('Pink Cherry Tomatoes', 'Zarya Farm', 'AgroTest', '2026-07-23', 'passed', 'Pesticides', 'TOM-2026-001'),
  ('Pink Cherry Tomatoes', 'Zarya Farm', 'AgroTest', '2026-07-23', 'passed', 'Heavy metals', 'TOM-2026-001'),
  ('Pink Cherry Tomatoes', 'Zarya Farm', 'SanExpert', '2026-07-24', 'passed', 'Microbiology', 'TOM-2026-001'),
  ('Field-grown Cucumbers', 'Polesye Farm', 'BioLab', '2026-07-21', 'passed', 'Pesticides', 'CUC-2026-014'),
  ('Field-grown Cucumbers', 'Polesye Farm', 'BioLab', '2026-07-21', 'passed', 'Nitrates', 'CUC-2026-014'),
  ('Grade C1 Free-Range Chicken Eggs', 'Utro Farm', 'VetLab', '2026-07-26', 'passed', 'Salmonella', 'EGG-2026-088'),
  ('Grade C1 Free-Range Chicken Eggs', 'Utro Farm', 'VetLab', '2026-07-26', 'passed', 'Antibiotics', 'EGG-2026-088'),
  ('Grade C1 Free-Range Chicken Eggs', 'Utro Farm', 'VetLab', '2026-07-26', 'passed', 'Freshness', 'EGG-2026-088'),
  ('Fresh Basket Washed Carrots', 'GELINO-GRUP SRL', 'AgroTest', '2026-08-06', 'passed', 'Pesticides', 'MD-CAR-050826-F07'),
  ('Fresh Basket Washed Carrots', 'GELINO-GRUP SRL', 'AgroTest', '2026-08-06', 'passed', 'Nitrates', 'MD-CAR-050826-F07'),
  ('Fresh Basket Washed Carrots', 'GELINO-GRUP SRL', 'SanExpert', '2026-08-06', 'passed', 'Microbiology', 'MD-CAR-050826-F07');