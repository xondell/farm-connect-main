import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, PhoneCall, Send, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/tickets/$id")({
  head: () => ({ meta: [{ title: "Ticket — AgroLink" }] }),
  component: TicketDetail,
});

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  callback_requested: boolean;
  callback_phone: string | null;
  created_at: string;
};
type Msg = {
  id: string;
  author_id: string;
  author_type: string;
  content: string;
  created_at: string;
};

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

function TicketDetail() {
  const { id } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from("tickets").select("*").eq("id", id).maybeSingle(),
      supabase.from("ticket_messages").select("*").eq("ticket_id", id).order("created_at"),
    ]);
    setTicket(t as Ticket | null);
    setMessages((m ?? []) as Msg[]);
  }, [id]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`ticket-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${id}`,
        },
        (p) => {
          setMessages((prev) => [...prev, p.new as Msg]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [id, load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!reply.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: id,
      author_id: user.id,
      author_type: isAdmin && ticket?.user_id !== user.id ? "admin" : "user",
      content: reply.trim(),
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setReply("");
  }

  async function changeStatus(newStatus: string) {
    const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", id);
    if (error) return toast.error(error.message);
    setTicket((t) => (t ? { ...t, status: newStatus } : t));
    toast.success("Status updated");
  }

  if (!ticket) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> To tickets
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Created {new Date(ticket.created_at).toLocaleString("en-US")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ticket.callback_requested && (
                <Badge variant="outline" className="gap-1">
                  <PhoneCall className="h-3 w-3" /> {ticket.callback_phone}
                </Badge>
              )}
              {isAdmin ? (
                <select
                  value={ticket.status}
                  onChange={(e) => changeStatus(e.target.value)}
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge>{statusOptions.find((o) => o.value === ticket.status)?.label}</Badge>
              )}
            </div>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/90">
            {ticket.description}
          </p>
        </div>

        <div className="space-y-3">
          {messages.map((m) => {
            const isMe = m.author_id === user?.id;
            return (
              <div key={m.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                <div
                  className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.author_type === "admin" ? "bg-emerald-500/15 text-emerald-700" : "bg-primary/10 text-primary"}`}
                >
                  {m.author_type === "admin" ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {new Date(m.created_at).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {ticket.status !== "closed" && (
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <Textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Your reply…"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={send} disabled={sending || !reply.trim()}>
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
