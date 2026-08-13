import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, PhoneCall, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/tickets")({
  head: () => ({ meta: [{ title: "My tickets — AgroHelp" }] }),
  component: TicketsList,
});

type Ticket = {
  id: string;
  subject: string;
  status: string;
  callback_requested: boolean;
  created_at: string;
  updated_at: string;
};

const statusLabels: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  open: {
    label: "Open",
    icon: Clock,
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  },
  in_progress: {
    label: "In progress",
    icon: MessageSquare,
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  closed: { label: "Closed", icon: CheckCircle2, className: "bg-muted text-muted-foreground" },
};

function TicketsList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("tickets")
      .select("id, subject, status, callback_requested, created_at, updated_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setTickets(data as Ticket[]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            to="/consumer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Button onClick={() => navigate({ to: "/tickets/new" })}>
            <Plus className="mr-2 h-4 w-4" /> New ticket
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-semibold">My tickets</h1>
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <p className="mb-4 text-muted-foreground">You don't have any tickets yet.</p>
            <Button onClick={() => navigate({ to: "/tickets/new" })}>
              Create your first ticket
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const s = statusLabels[t.status] ?? statusLabels.open;
              const Icon = s.icon;
              return (
                <Link
                  key={t.id}
                  to="/tickets/$id"
                  params={{ id: t.id }}
                  className="block rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">{t.subject}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Created: {new Date(t.created_at).toLocaleString("en-US")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.callback_requested && (
                        <Badge variant="outline" className="gap-1">
                          <PhoneCall className="h-3 w-3" /> Callback
                        </Badge>
                      )}
                      <Badge className={s.className}>
                        <Icon className="mr-1 h-3 w-3" /> {s.label}
                      </Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
