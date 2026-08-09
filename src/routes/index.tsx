import { createFileRoute, Link } from "@tanstack/react-router";
import { Sprout, ShoppingBasket, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-field.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgroLink — transparent agriculture" },
      {
        name: "description",
        content: "Farm data, AI recommendations, and QR-code product traceability.",
      },
      { property: "og:title", content: "AgroLink — transparent agriculture" },
      {
        property: "og:description",
        content: "Farm data, AI recommendations, and QR-code product traceability.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Wheat field at sunset"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-36">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            2026 Pilot · 12 farms
          </p>
          <h1 className="text-5xl font-semibold leading-tight md:text-7xl">AgroLink</h1>
          <p className="mt-4 max-w-xl text-lg text-foreground/80 md:text-xl">
            One platform between the farm and your table. Data, AI, and full transparency for every
            product.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-2xl">
            <RoleCard
              to="/farmer"
              icon={<Sprout className="h-6 w-6" />}
              title="I'm a farmer"
              text="Sensors, weather, financial advice, training, and news."
            />
            <RoleCard
              to="/consumer"
              icon={<ShoppingBasket className="h-6 w-6" />}
              title="I'm a consumer"
              text="Scan a QR code, track a product's journey, and ask questions."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function RoleCard({
  to,
  icon,
  title,
  text,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      <ArrowRight className="absolute right-6 top-6 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
