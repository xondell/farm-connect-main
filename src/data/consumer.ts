import tomatoImg from "@/assets/product-tomato.jpg";
import cucumberImg from "@/assets/product-cucumber.jpg";
import eggsImg from "@/assets/product-eggs.jpg";
import carrotImg from "@/assets/product-carrot.png";

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
  "TOM-2026-001": {
    id: "TOM-2026-001",
    name: "Pink Cherry Tomatoes",
    farm: "Zarya Farm",
    region: "Krasnodar Krai, Poltavskaya stanitsa",
    producedAt: "July 22, 2026",
    image: tomatoImg,
    timeline: [
      { stage: "Sowing", date: "March 12, 2026", note: "Plot #2, greenhouse" },
      { stage: "Harvest", date: "July 20, 2026", note: "Hand-picked, 95% ripeness" },
      { stage: "Packaging", date: "July 22, 2026", note: "500 g container, bio-film" },
      { stage: "Inspection", date: "July 23, 2026", note: "AgroTest laboratory" },
      { stage: "On shelf", date: "July 25, 2026", note: "Pyaterochka chain, Krasnodar" },
    ],
    inspections: [
      { name: "Pesticides", lab: "AgroTest", date: "07/23/2026", result: "passed" },
      { name: "Heavy metals", lab: "AgroTest", date: "07/23/2026", result: "passed" },
      { name: "Microbiology", lab: "SanExpert", date: "07/24/2026", result: "passed" },
    ],
  },
  "CUC-2026-014": {
    id: "CUC-2026-014",
    name: "Field-grown Cucumbers",
    farm: "Polesye Farm",
    region: "Bryansk Region, Dubrovka village",
    producedAt: "July 20, 2026",
    image: cucumberImg,
    timeline: [
      { stage: "Sowing", date: "May 01, 2026", note: "Open field, plot #4" },
      { stage: "Harvest", date: "July 18, 2026", note: "Mechanized harvest" },
      { stage: "Packaging", date: "July 20, 2026", note: "5 kg crates" },
      { stage: "Inspection", date: "July 21, 2026", note: "BioLab laboratory" },
      { stage: "On shelf", date: "July 23, 2026", note: "Magnit, Bryansk" },
    ],
    inspections: [
      { name: "Pesticides", lab: "BioLab", date: "07/21/2026", result: "passed" },
      { name: "Nitrates", lab: "BioLab", date: "07/21/2026", result: "passed" },
    ],
  },
  "EGG-2026-088": {
    id: "EGG-2026-088",
    name: "Grade C1 Free-Range Chicken Eggs",
    farm: "Utro Farm",
    region: "Tula Region, Ramenye village",
    producedAt: "July 25, 2026",
    image: eggsImg,
    timeline: [
      { stage: "Laying", date: "July 23–25, 2026", note: "Laying hens, Lohmann Brown breed" },
      { stage: "Sorting", date: "July 25, 2026", note: "Automatic by weight" },
      { stage: "Packaging", date: "July 25, 2026", note: "Cardboard tray, 10 pcs" },
      { stage: "Inspection", date: "July 26, 2026", note: "Veterinary service" },
      { stage: "On shelf", date: "July 27, 2026", note: "VkusVill, Tula" },
    ],
    inspections: [
      { name: "Salmonella", lab: "VetLab", date: "07/26/2026", result: "passed" },
      { name: "Antibiotics", lab: "VetLab", date: "07/26/2026", result: "passed" },
      { name: "Freshness", lab: "VetLab", date: "07/26/2026", result: "passed" },
    ],
  },
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
};

export const inspectionNews = [
  {
    product: "Pink Cherry Tomatoes",
    farm: "Zarya Farm",
    date: "July 24, 2026",
    lab: "AgroTest",
    result: "passed" as const,
  },
  {
    product: "Field-grown Cucumbers",
    farm: "Polesye Farm",
    date: "July 21, 2026",
    lab: "BioLab",
    result: "passed" as const,
  },
  {
    product: "Grade C1 Eggs",
    farm: "Utro Farm",
    date: "July 26, 2026",
    lab: "VetLab",
    result: "passed" as const,
  },
  {
    product: "Pasteurized Milk",
    farm: "Rodnik Farm",
    date: "July 18, 2026",
    lab: "MolTest",
    result: "passed" as const,
  },
  {
    product: "Washed Carrots",
    farm: "Urozhay Farm",
    date: "July 15, 2026",
    lab: "AgroTest",
    result: "passed" as const,
  },
  {
    product: "Fresh Basket Washed Carrots",
    farm: "GELINO-GRUP SRL",
    date: "August 6, 2026",
    lab: "AgroTest",
    result: "passed" as const,
  },
];
