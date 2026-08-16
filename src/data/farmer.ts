import {
  CloudRain,
  Droplets,
  Sun,
  Thermometer,
  TrendingUp,
  Wrench,
  Sprout,
  Truck,
} from "lucide-react";

export const sensors = [
  { icon: Thermometer, label: "Temperature", value: "24°C", hint: "normal" },
  { icon: Droplets, label: "Soil moisture", value: "38%", hint: "below normal" },
  { icon: CloudRain, label: "Rainfall (7 days)", value: "2 mm", hint: "low" },
  { icon: Sun, label: "Drought risk", value: "Medium", hint: "plot #2" },
];

export const aiInsight =
  "3 days without rainfall and temperatures above +25°C are expected. Additional irrigation of plot #2 (tomatoes) is recommended this evening — ~12 L/m². The NDVI index for plot #1 remains stable, no intervention needed.";

export const financeTips = [
  {
    icon: Droplets,
    title: "Drip irrigation, plot #2",
    priority: "High",
    amount: "~₽85,000",
    reason: "ROI within 1 season given the dry forecast.",
    cost: 85000,
    rating: 4.9,
    reviews: 214,
    roiMonths: 12,
  },
  {
    icon: Sprout,
    title: "Organic fertilizer",
    priority: "Medium",
    amount: "~₽24,000",
    reason: "Will improve cucumber yield by 12–18%.",
    cost: 24000,
    rating: 4.7,
    reviews: 158,
    roiMonths: 9,
  },
  {
    icon: Wrench,
    title: "MTZ tractor repair",
    priority: "Medium",
    amount: "~₽40,000",
    reason: "Preventive maintenance before harvest.",
    cost: 40000,
    rating: 4.5,
    reviews: 96,
    roiMonths: 18,
  },
  {
    icon: TrendingUp,
    title: "Agronomy course (online)",
    priority: "Low",
    amount: "~₽9,000",
    reason: "Long-term investment in skills.",
    cost: 9000,
    rating: 4.8,
    reviews: 341,
    roiMonths: 6,
  },
  {
    icon: Truck,
    title: "Refrigerated truck rental",
    priority: "Low",
    amount: "~₽15,000/mo",
    reason: "Will reduce losses on deliveries to the city.",
    cost: 15000,
    rating: 4.4,
    reviews: 77,
    roiMonths: 24,
  },
];

export const videos = [
  {
    id: "1",
    title: "DIY drip irrigation",
    duration: "12:34",
    cover: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format",
    yt: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "2",
    title: "Crop rotation: a practical plan",
    duration: "18:02",
    cover: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&auto=format",
    yt: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "3",
    title: "Fighting late blight without chemicals",
    duration: "09:15",
    cover: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7a3d?w=600&auto=format",
    yt: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "4",
    title: "How to read sensor data",
    duration: "14:40",
    cover: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format",
    yt: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "5",
    title: "Compost in 30 days",
    duration: "07:50",
    cover: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format",
    yt: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "6",
    title: "Marketing farm products",
    duration: "22:11",
    cover: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format",
    yt: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

export const farmNews = [
  {
    farm: "Zarya Farm",
    date: "July 24, 2026",
    tag: "Tomatoes",
    text: "Installed moisture sensors — 22% water savings per month. Yield up 8% from last season.",
  },
  {
    farm: "Polesye Farm",
    date: "July 19, 2026",
    tag: "Cucumbers",
    text: "Switched to biological pest control. Lab tests confirmed no pesticide residue.",
  },
  {
    farm: "Utro Farm",
    date: "July 12, 2026",
    tag: "Eggs",
    text: "Launched free-range access for hens. New batch is undergoing 'free-range' certification.",
  },
  {
    farm: "Zarya Farm",
    date: "July 05, 2026",
    tag: "General",
    text: "QR labeling pilot: 1,200 packages with full traceability shipped to a retail chain.",
  },
];
