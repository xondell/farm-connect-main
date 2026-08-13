import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Newspaper,
  ShieldCheck,
  Trash2,
  Plus,
  Ticket as TicketIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — AgroHelp" }] }),
  component: AdminPage,
});

type News = { id: string; title: string; body: string; category: string; published_at: string };
type Inspection = {
  id: string;
  product_name: string;
  farm: string;
  lab: string;
  inspection_date: string;
  result: string;
};
type Ticket = {
  id: string;
  subject: string;
  status: string;
  callback_requested: boolean;
  created_at: string;
};

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Administrator role required");
      navigate({ to: "/" });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return null;

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
          <Badge variant="outline">Admin panel</Badge>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-semibold">Content management</h1>
        <Tabs defaultValue="news">
          <TabsList>
            <TabsTrigger value="news">
              <Newspaper className="mr-2 h-4 w-4" /> News
            </TabsTrigger>
            <TabsTrigger value="inspections">
              <ShieldCheck className="mr-2 h-4 w-4" /> Inspections
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <TicketIcon className="mr-2 h-4 w-4" /> Tickets
            </TabsTrigger>
          </TabsList>
          <TabsContent value="news">
            <NewsAdmin />
          </TabsContent>
          <TabsContent value="inspections">
            <InspectionsAdmin />
          </TabsContent>
          <TabsContent value="tickets">
            <TicketsAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function NewsAdmin() {
  const [items, setItems] = useState<News[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");

  async function load() {
    const { data } = await supabase
      .from("news_items")
      .select("*")
      .order("published_at", { ascending: false });
    setItems((data ?? []) as News[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("news_items")
      .insert({ title, body, category, created_by: userRes.user?.id });
    if (error) return toast.error(error.message);
    toast.success("News item published");
    setTitle("");
    setBody("");
    setCategory("general");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this news item?")) return;
    const { error } = await supabase.from("news_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[360px_1fr]">
      <form onSubmit={create} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="font-semibold">New news item</h3>
        <div>
          <Label>Title</Label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} maxLength={40} />
        </div>
        <div>
          <Label>Text</Label>
          <Textarea
            required
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
          />
        </div>
        <Button type="submit" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Publish
        </Button>
      </form>
      <div className="space-y-3">
        {items.map((n) => (
          <article key={n.id} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{n.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.published_at).toLocaleDateString("en-US")}
                  </span>
                </div>
                <h4 className="mt-1 font-medium">{n.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(n.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function InspectionsAdmin() {
  const [items, setItems] = useState<Inspection[]>([]);
  const [product, setProduct] = useState("");
  const [farm, setFarm] = useState("");
  const [lab, setLab] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<"passed" | "failed">("passed");

  async function load() {
    const { data } = await supabase
      .from("inspection_cards")
      .select("*")
      .order("inspection_date", { ascending: false });
    setItems((data ?? []) as Inspection[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("inspection_cards").insert({
      product_name: product,
      farm,
      lab,
      inspection_date: date,
      result,
      created_by: userRes.user?.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Inspection card added");
    setProduct("");
    setFarm("");
    setLab("");
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this inspection?")) return;
    const { error } = await supabase.from("inspection_cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[360px_1fr]">
      <form onSubmit={create} className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="font-semibold">New inspection card</h3>
        <div>
          <Label>Product</Label>
          <Input required value={product} onChange={(e) => setProduct(e.target.value)} />
        </div>
        <div>
          <Label>Farm</Label>
          <Input required value={farm} onChange={(e) => setFarm(e.target.value)} />
        </div>
        <div>
          <Label>Lab</Label>
          <Input required value={lab} onChange={(e) => setLab(e.target.value)} />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Result</Label>
          <select
            value={result}
            onChange={(e) => setResult(e.target.value as "passed" | "failed")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <Button type="submit" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </form>
      <div className="space-y-3">
        {items.map((i) => (
          <article key={i.id} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-medium">{i.product_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {i.farm} · {i.lab} · {new Date(i.inspection_date).toLocaleDateString("en-US")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    i.result === "passed"
                      ? "bg-emerald-500/15 text-emerald-700"
                      : "bg-red-500/15 text-red-700"
                  }
                >
                  {i.result === "passed" ? "Passed" : "Failed"}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => remove(i.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TicketsAdmin() {
  const [items, setItems] = useState<Ticket[]>([]);
  useEffect(() => {
    supabase
      .from("tickets")
      .select("id, subject, status, callback_requested, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []) as Ticket[]);
      });
  }, []);
  return (
    <div className="mt-6 space-y-3">
      {items.length === 0 && <p className="text-muted-foreground">No tickets yet.</p>}
      {items.map((t) => (
        <Link
          key={t.id}
          to="/tickets/$id"
          params={{ id: t.id }}
          className="block rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-medium">{t.subject}</h4>
              <p className="text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleString("en-US")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {t.callback_requested && <Badge variant="outline">Callback</Badge>}
              <Badge>{t.status}</Badge>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
