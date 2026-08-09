import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Bell, CloudRain, Droplets, Trash2, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({ meta: [{ title: "Notifications — AgroLink" }] }),
  component: AlertsPage,
});

type Alert = {
  id: string;
  kind: string;
  severity: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};
type Settings = {
  drought_enabled: boolean;
  rain_enabled: boolean;
  anomaly_enabled: boolean;
  min_severity: string;
};

const kindIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  drought: Sun,
  rain: CloudRain,
  anomaly: AlertTriangle,
  info: Bell,
};
const severityStyles: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  high: "bg-red-500/15 text-red-700 dark:text-red-300",
};

function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("alerts").select("*").order("created_at", { ascending: false }),
      supabase.from("alert_settings").select("*").eq("user_id", user.id).maybeSingle(),
    ]).then(([a, s]) => {
      setAlerts((a.data ?? []) as Alert[]);
      setSettings(
        (s.data as Settings) ?? {
          drought_enabled: true,
          rain_enabled: true,
          anomaly_enabled: true,
          min_severity: "medium",
        },
      );
      setLoading(false);
      // mark unread as read
      const unread = ((a.data ?? []) as Alert[]).filter((x) => !x.read).map((x) => x.id);
      if (unread.length)
        supabase
          .from("alerts")
          .update({ read: true })
          .in("id", unread)
          .then(() => {});
    });
  }, [user]);

  async function saveSettings(patch: Partial<Settings>) {
    if (!user || !settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    const { error } = await supabase.from("alert_settings").upsert({ user_id: user.id, ...next });
    if (error) toast.error(error.message);
  }

  async function simulate() {
    if (!user) return;
    const samples = [
      {
        kind: "drought",
        severity: "high",
        title: "Drought risk — plot #2",
        message:
          "No rainfall expected for 5 days. Soil moisture 22%. Urgent irrigation recommended.",
      },
      {
        kind: "rain",
        severity: "medium",
        title: "Heavy rain approaching",
        message: "25 mm of precipitation expected in the next 12 hours. Cover seedlings.",
      },
      {
        kind: "anomaly",
        severity: "high",
        title: "Sensor anomaly",
        message: "Sensor #4: temperature +38°C — above normal range. Check the equipment.",
      },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    const { data, error } = await supabase
      .from("alerts")
      .insert({ user_id: user.id, ...pick })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setAlerts((prev) => [data as Alert, ...prev]);
    toast.info(pick.title);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("alerts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            to="/farmer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <Button variant="outline" size="sm" onClick={simulate}>
            Test notification
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-4xl gap-8 px-6 py-10 md:grid-cols-[1fr_320px]">
        <section>
          <h1 className="mb-6 text-3xl font-semibold">Notifications</h1>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : alerts.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
              No notifications yet. We'll warn you about drought, rain, and anomalies.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => {
                const Icon = kindIcons[a.kind] ?? Bell;
                return (
                  <article key={a.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium">{a.title}</h3>
                          <Badge className={severityStyles[a.severity]}>
                            {a.severity === "high"
                              ? "High"
                              : a.severity === "medium"
                                ? "Medium"
                                : "Low"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleString("en-US")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Bell className="h-4 w-4" /> Settings
            </h2>
            {settings && (
              <div className="space-y-4">
                <SettingRow
                  icon={<Sun className="h-4 w-4" />}
                  label="Drought"
                  checked={settings.drought_enabled}
                  onChange={(v) => saveSettings({ drought_enabled: v })}
                />
                <SettingRow
                  icon={<CloudRain className="h-4 w-4" />}
                  label="Rain"
                  checked={settings.rain_enabled}
                  onChange={(v) => saveSettings({ rain_enabled: v })}
                />
                <SettingRow
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="Sensor anomalies"
                  checked={settings.anomaly_enabled}
                  onChange={(v) => saveSettings({ anomaly_enabled: v })}
                />
                <div>
                  <Label className="mb-2 block text-sm">Minimum severity</Label>
                  <select
                    value={settings.min_severity}
                    onChange={(e) => saveSettings({ min_severity: e.target.value })}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-2xl border bg-muted/40 p-4 text-xs text-muted-foreground">
            <Droplets className="mb-2 h-4 w-4" />
            In this demo, notifications are generated manually. In production they connect to sensor
            streams and weather APIs.
          </div>
        </aside>
      </div>
    </main>
  );
}

function SettingRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        {icon} {label}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
