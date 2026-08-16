import { supabase } from "@/integrations/supabase/client";
import {
  inspectionNews as staticNews,
  products as staticProducts,
  type InspectionNewsItem,
  type Product,
} from "@/data/consumer";

export function supabaseConfigured(): boolean {
  const url =
    import.meta.env.VITE_SUPABASE_URL ??
    (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined);
  return Boolean(url);
}

function formatDate(value: string): string {
  if (!value) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[2]}/${match[3]}/${match[1]}`;
}

function mapRowToProduct(row: {
  code: string;
  name: string;
  farm: string;
  region: string;
  produced_at: string;
  image_url: string | null;
  timeline: unknown;
}): Product {
  return {
    id: row.code,
    name: row.name,
    farm: row.farm,
    region: row.region,
    producedAt: row.produced_at,
    image: row.image_url ?? staticProducts[row.code]?.image ?? "",
    timeline: Array.isArray(row.timeline)
      ? (row.timeline as Product["timeline"])
      : (staticProducts[row.code]?.timeline ?? []),
    inspections: [],
  };
}

// Merge DB catalog with the local fallback so the store never appears empty.
export async function loadProducts(): Promise<Product[]> {
  if (!supabaseConfigured()) return Object.values(staticProducts);
  try {
    const { data, error } = await supabase
      .from("products")
      .select("code,name,farm,region,produced_at,image_url,timeline");
    if (error || !data || data.length === 0) return Object.values(staticProducts);
    const merged = new Map<string, Product>();
    for (const fallback of Object.values(staticProducts)) merged.set(fallback.id, fallback);
    for (const row of data) merged.set(row.code, mapRowToProduct(row));
    return Array.from(merged.values());
  } catch {
    return Object.values(staticProducts);
  }
}

export async function loadProduct(code: string): Promise<Product | null> {
  if (!supabaseConfigured()) return staticProducts[code] ?? null;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("code,name,farm,region,produced_at,image_url,timeline")
      .eq("code", code)
      .maybeSingle();
    if (error || !data) return staticProducts[code] ?? null;
    return mapRowToProduct(data);
  } catch {
    return staticProducts[code] ?? null;
  }
}

// Quality checks stored on Supabase, falling back to the built-in demo checks.
export async function loadInspections(code: string): Promise<Product["inspections"]> {
  const fallback = staticProducts[code]?.inspections ?? [];
  if (!supabaseConfigured()) return fallback;
  try {
    const { data, error } = await supabase
      .from("inspection_cards")
      .select("lab,inspection_date,result,notes")
      .eq("product_code", code);
    if (error || !data || data.length === 0) return fallback;
    return data.map((row) => ({
      name: row.notes ?? row.lab,
      lab: row.lab,
      date: formatDate(row.inspection_date),
      result: row.result === "failed" ? "failed" : "passed",
    }));
  } catch {
    return fallback;
  }
}

export async function loadInspectionNews(): Promise<InspectionNewsItem[]> {
  if (!supabaseConfigured()) return staticNews;
  try {
    const { data, error } = await supabase
      .from("inspection_cards")
      .select("product_name,farm,lab,inspection_date,result")
      .not("product_code", "is", null)
      .order("inspection_date", { ascending: false })
      .limit(30);
    if (error || !data || data.length === 0) return staticNews;
    return data.map((row) => ({
      product: row.product_name,
      farm: row.farm,
      date: formatDate(row.inspection_date),
      lab: row.lab,
      result: row.result === "failed" ? ("failed" as const) : ("passed" as const),
    }));
  } catch {
    return staticNews;
  }
}

export type ConsumerHomeData = {
  products: Product[];
  news: InspectionNewsItem[];
};
