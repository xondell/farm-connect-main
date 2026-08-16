import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, MapPin, Calendar, MessageCircle } from "lucide-react";
import type { Product } from "@/data/consumer";
import { loadInspections, loadProduct } from "@/lib/consumer-store";
import { Badge } from "@/components/ui/badge";
import { HelpChat } from "@/components/consumer/help-chat";

export const Route = createFileRoute("/consumer_/product/$id")({
  head: ({ loaderData }: { loaderData?: Product }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — AgroHelp` : "Product — AgroHelp" },
      {
        name: "description",
        content: loaderData
          ? `The journey of ${loaderData.name} from ${loaderData.farm} to the shelf.`
          : "Product information.",
      },
      {
        property: "og:title",
        content: loaderData ? `${loaderData.name} — AgroHelp` : "Product — AgroHelp",
      },
      {
        property: "og:description",
        content: loaderData
          ? `The journey of ${loaderData.name} from ${loaderData.farm} to the shelf.`
          : "Product information.",
      },
    ],
  }),
  loader: async ({ params }): Promise<Product> => {
    const code = params.id.toUpperCase();
    const product = await loadProduct(code);
    if (!product) throw notFound();
    product.inspections = await loadInspections(code);
    return product;
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">Product not found</h1>
      <p className="mt-2 text-muted-foreground">
        Check the code on the package — there might be a typo.
      </p>
      <Link
        to="/consumer"
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back to scanner
      </Link>
    </main>
  );
}

function ProductPage() {
  const p = Route.useLoaderData() as Product;
  const [chatOpen, setChatOpen] = useState(false);

  // We currently only have an approximate geographic location for this
  // demo product, not the exact coordinates of field F-07.
  const farmLocation =
    p.id === "MD-CAR-050826-F07"
      ? {
          lat: 47.3884177,
          lon: 28.8285808,
          label: "Orhei, Republic of Moldova",
        }
      : null;

  const osmEmbedUrl = farmLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        farmLocation.lon - 0.055
      }%2C${farmLocation.lat - 0.035}%2C${farmLocation.lon + 0.055}%2C${
        farmLocation.lat + 0.035
      }&layer=mapnik&marker=${farmLocation.lat}%2C${farmLocation.lon}`
    : "";

  const osmPageUrl = farmLocation
    ? `https://www.openstreetmap.org/?mlat=${farmLocation.lat}&mlon=${farmLocation.lon}#map=13/${farmLocation.lat}/${farmLocation.lon}`
    : "";

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            to="/consumer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to scanner
          </Link>
          <div className="font-mono text-xs text-muted-foreground">{p.id}</div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-10 px-6 py-10">
        <section className="grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border bg-card">
            <img
              src={p.image}
              alt={p.name}
              className="h-full w-full object-cover"
              width={1024}
              height={1024}
            />
          </div>
          <div className="space-y-4">
            <Badge variant="secondary">Verified by AgroHelp</Badge>
            <h1 className="text-4xl font-semibold leading-tight">{p.name}</h1>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {p.farm}, {p.region}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Produced: {p.producedAt}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Product journey</h2>
          <ol className="relative border-l-2 border-primary/30 pl-6">
            {p.timeline.map((t, i) => (
              <li key={i} className="mb-6 last:mb-0">
                <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                <div className="text-sm font-semibold text-primary">{t.stage}</div>
                <div className="text-xs text-muted-foreground">{t.date}</div>
                <div className="mt-1 text-sm">{t.note}</div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Lab tests</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {p.inspections.map((ins, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{ins.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ins.lab} · {ins.date}
                  </div>
                </div>
                <Badge>Passed</Badge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-muted/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">Farm location</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.region}</p>
            </div>

            {farmLocation && (
              <a
                href={osmPageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <MapPin className="h-4 w-4" />
                Open in OpenStreetMap
              </a>
            )}
          </div>

          {farmLocation ? (
            <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-sm">
              <iframe
                title={`OpenStreetMap location of ${p.farm}`}
                src={osmEmbedUrl}
                className="h-[360px] w-full border-0 sm:h-[440px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-background px-4 py-3 text-xs text-muted-foreground">
                <span>
                  Approximate location · {farmLocation.label} · {farmLocation.lat.toFixed(5)},{" "}
                  {farmLocation.lon.toFixed(5)}
                </span>

                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-foreground hover:underline"
                >
                  © OpenStreetMap contributors
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
              Precise map coordinates are not available for this product yet.
            </div>
          )}
        </section>
      </div>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 inline-flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-primary-foreground shadow-lg hover:opacity-95"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Help</span>
      </button>

      <HelpChat open={chatOpen} onOpenChange={setChatOpen} />
    </main>
  );
}
