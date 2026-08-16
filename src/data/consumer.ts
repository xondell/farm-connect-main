import carrotImg from "@/assets/product-carrot.png";
import juiceImg from "@/assets/product-juice.png";

export type Product = {
  id: string;
  name: string;
  farm: string;
  region: string;
  producedAt: string;
  image: string;
  timeline: { stage: string; date: string; note: string }[];
  inspections: { name: string; lab: string; date: string; result: "passed" | "failed" }[];
};

export const products: Record<string, Product> = {
  "MD-CAR-050826-F07": {
    id: "MD-CAR-050826-F07",
    name: "Fresh Basket Washed Carrots 500 g",
    farm: "GELINO-GRUP SRL",
    region: "Orhei, Republic of Moldova",
    producedAt: "August 7, 2026",
    image: carrotImg,
    timeline: [
      { stage: "Sowing", date: "March 18, 2026", note: "Field F-07, Orhei — variety Nandrin F1" },
      { stage: "Harvest", date: "August 5, 2026", note: "Field F-07, yield 48.6 t/ha" },
      {
        stage: "Washing & sorting",
        date: "August 6, 2026",
        note: "Washed with drinking water, calibrated 20–40 mm",
      },
      {
        stage: "Packaging",
        date: "August 7, 2026",
        note: "500 g tray, Fresh Basket brand, GTIN 4842142001196",
      },
      { stage: "Cold storage", date: "August 7, 2026", note: "Cold chain +5…+7 °C" },
      { stage: "On shelf", date: "August 7, 2026", note: "GELINO-GRUP distribution" },
    ],
    inspections: [
      { name: "Pesticides", lab: "AgroTest", date: "08/06/2026", result: "passed" },
      { name: "Nitrates", lab: "AgroTest", date: "08/06/2026", result: "passed" },
      { name: "Microbiology", lab: "SanExpert", date: "08/06/2026", result: "passed" },
    ],
  },
  "MAR-2026-001": {
    id: "MAR-2026-001",
    name: "Marata Action 9 Fruits Juice 250 ml",
    farm: "Sklavenitis Group",
    region: "Peristeri, Athens, Greece",
    producedAt: "Best before 25.08.2027",
    image: juiceImg,
    timeline: [
      {
        stage: "Blending",
        date: "Greece",
        note: "100% juice from 9 fruits: apple 30%, peach purée, grape, orange, kiwi, apricot, passion fruit, mango, pineapple",
      },
      {
        stage: "Vitamins",
        date: "250 ml pack",
        note: "7 added vitamins (E, C, B1, B2, B6, B3, B9) — 50% of reference intake each",
      },
      {
        stage: "Pasteurization",
        date: "Production line",
        note: "Heat-treated, stored cool and dry until opening",
      },
      {
        stage: "Packaging",
        date: "2026",
        note: "250 ml SIG aseptic carton, FSC certified, EAN 5202576043978",
      },
      {
        stage: "On shelf",
        date: "Sklavenitis",
        note: "Single pack €0.40 (€1.60/l), shake well before drinking",
      },
    ],
    inspections: [
      { name: "Sugars & composition", lab: "LabCheck", date: "08/10/2026", result: "passed" },
      { name: "Vitamins", lab: "LabCheck", date: "08/10/2026", result: "passed" },
      { name: "Microbiology", lab: "SanExpert", date: "08/11/2026", result: "passed" },
    ],
  },
};

export type InspectionNewsItem = {
  product: string;
  farm: string;
  date: string;
  lab: string;
  result: "passed" | "failed";
};

export const inspectionNews: InspectionNewsItem[] = [
  {
    product: "Fresh Basket Washed Carrots",
    farm: "GELINO-GRUP SRL",
    date: "August 6, 2026",
    lab: "AgroTest",
    result: "passed" as const,
  },
  {
    product: "Marata Action 9 Fruits Juice",
    farm: "Sklavenitis Group",
    date: "August 10, 2026",
    lab: "LabCheck",
    result: "passed" as const,
  },
];
