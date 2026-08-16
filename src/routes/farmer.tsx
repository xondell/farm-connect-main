import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, PlayCircle, X } from "lucide-react";
import { sensors, aiInsight, financeTips, videos, farmNews } from "@/data/farmer";
import { Badge } from "@/components/ui/badge";
import { AccountNav } from "@/components/account-nav";
import { ProductionJournal } from "@/components/farmer/production-journal";

export const Route = createFileRoute("/farmer")({
  head: () => ({
    meta: [
      { title: "Farmer Dashboard — AgroHelp" },
      {
        name: "description",
        content:
          "Production planning, sensors, weather, AI advice, training videos, and news for farm operations.",
      },
      { property: "og:title", content: "Farmer Dashboard — AgroHelp" },
      {
        property: "og:description",
        content:
          "Production planning, sensors, weather, AI advice, training videos, and news for farm operations.",
      },
    ],
  }),
  component: FarmerDashboard,
});

function FarmerDashboard() {
  const [openVideo, setOpenVideo] = useState<string | null>(null);
  const current = videos.find((v) => v.id === openVideo);

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <AccountNav variant="farmer" />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-6 py-10">
        <div>
          <h1 className="text-4xl font-semibold">Good morning, Ivan</h1>
          <p className="mt-1 text-muted-foreground">Today's summary, July 29, 2026</p>
        </div>

        <ProductionJournal />

        {/* Sensors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Sensors and weather</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sensors.map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-1 text-2xl font-semibold">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> AI analysis
            </div>
            <p className="text-sm leading-relaxed">{aiInsight}</p>
          </div>
        </section>

        {/* Financial tips */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Where to spend</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {financeTips.map((t) => (
              <div key={t.title} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-medium">{t.title}</h3>
                      <Badge variant={t.priority === "High" ? "default" : "secondary"}>
                        {t.priority}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-primary">{t.amount}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{t.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Training */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Training videos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => setOpenVideo(v.id)}
                className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={v.cover}
                    alt={v.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="h-12 w-12 text-background" />
                  </div>
                  <span className="absolute bottom-2 right-2 rounded bg-foreground/70 px-2 py-0.5 text-xs text-background">
                    {v.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium leading-snug">{v.title}</h3>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* News */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Pilot farm news</h2>
          <div className="space-y-3">
            {farmNews.map((n, i) => (
              <article key={i} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-medium">{n.farm}</span>
                  <Badge variant="secondary">{n.tag}</Badge>
                  <span className="text-muted-foreground">{n.date}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{n.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4"
          onClick={() => setOpenVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenVideo(null)}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video">
              <iframe
                src={current.yt}
                title={current.title}
                allow="autoplay; encrypted-media"
                className="h-full w-full"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{current.title}</h3>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
