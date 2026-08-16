import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, QrCode, ShieldCheck, MessageCircle, ChevronRight } from "lucide-react";
import { loadInspectionNews, loadProducts, type ConsumerHomeData } from "@/lib/consumer-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HelpChat } from "@/components/consumer/help-chat";
import { AccountNav } from "@/components/account-nav";

export const Route = createFileRoute("/consumer")({
  head: () => ({
    meta: [
      { title: "Product Transparency — AgroLink" },
      {
        name: "description",
        content:
          "Scan a QR code, see the product's journey from farm to shelf, and ask the AI assistant questions.",
      },
      { property: "og:title", content: "Product Transparency — AgroLink" },
      {
        property: "og:description",
        content:
          "Scan a QR code, see the product's journey from farm to shelf, and ask the AI assistant questions.",
      },
    ],
  }),
  loader: async (): Promise<ConsumerHomeData> => {
    const [products, news] = await Promise.all([loadProducts(), loadInspectionNews()]);
    return { products, news };
  },
  component: ConsumerHome,
});

function ConsumerHome() {
  const { products, news } = Route.useLoaderData();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const examples = Object.keys(products);

  function go(id: string) {
    navigate({ to: "/consumer/product/$id", params: { id } });
  }

  function findProductId(name: string): string | undefined {
    return Object.values(products).find((p) => p.name.toLowerCase().startsWith(name.toLowerCase()))
      ?.id;
  }

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <AccountNav variant="consumer" />
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-12 px-6 py-10">
        {/* Scanner */}
        <section className="rounded-3xl border bg-card p-8 shadow-sm">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <QrCode className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold">Check a product</h1>
              <p className="mt-1 text-muted-foreground">
                Enter the code from the package or scan the QR code — find out where the product
                came from and which checks it has passed.
              </p>
            </div>
          </div>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) go(code.trim().toUpperCase());
            }}
          >
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="E.g. TOM-2026-001"
              className="h-12 text-base"
            />
            <Button type="submit" size="lg" className="h-12">
              Check
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {examples.map((id) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="rounded-full border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                {id}
              </button>
            ))}
          </div>
        </section>

        {/* Catalog */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Products</h2>
            <span className="text-sm text-muted-foreground">
              Tap a card to open the product page
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(products).map((p) => (
              <Link
                key={p.id}
                to="/consumer/product/$id"
                params={{ id: p.id }}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    width={1024}
                    height={768}
                  />
                </div>
                <div className="p-4">
                  <div className="font-medium">{p.name}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {p.farm} · {p.region}
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{p.id}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* News */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Inspection news</h2>
          <div className="space-y-3">
            {news.map((n, i) => {
              const productId = findProductId(n.product);
              const card = (
                <article
                  key={i}
                  className="rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-muted/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{n.product}</h3>
                      <p className="text-sm text-muted-foreground">
                        {n.farm} · {n.lab} · {n.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Passed
                      </Badge>
                      {productId && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </article>
              );
              return productId ? (
                <Link
                  key={i}
                  to="/consumer/product/$id"
                  params={{ id: productId }}
                  className="block"
                >
                  {card}
                </Link>
              ) : (
                card
              );
            })}
          </div>
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
