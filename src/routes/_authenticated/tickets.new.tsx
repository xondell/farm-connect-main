import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/tickets/new")({
  head: () => ({ meta: [{ title: "New ticket — AgroLink" }] }),
  component: NewTicket,
});

function NewTicket() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [callback, setCallback] = useState(false);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (callback && !phone.trim())
      return toast.error("Please provide a phone number for the callback");
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      setSaving(false);
      return toast.error("Sign-in required");
    }
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        user_id: userRes.user.id,
        subject: subject.trim(),
        description: description.trim(),
        callback_requested: callback,
        callback_phone: callback ? phone.trim() : null,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Ticket created");
    navigate({ to: "/tickets/$id", params: { id: data.id } });
  }

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> To tickets
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-semibold">New ticket</h1>
        <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              required
              maxLength={140}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe the issue"
            />
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              required
              rows={6}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the situation, include the product QR code if relevant"
            />
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Request a callback</p>
                <p className="text-sm text-muted-foreground">
                  An operator will call you back during business hours
                </p>
              </div>
              <Switch checked={callback} onCheckedChange={setCallback} />
            </div>
            {callback && (
              <div className="mt-4">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 ___ ___-____"
                  required
                  maxLength={30}
                />
              </div>
            )}
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Sending…" : "Submit ticket"}
          </Button>
        </form>
      </div>
    </main>
  );
}
