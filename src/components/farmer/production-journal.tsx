import { Link } from "@tanstack/react-router";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

type Status = "planned" | "in_progress" | "completed" | "cancelled";
type Priority = "low" | "medium" | "high" | "critical";
type OperationType =
  | "sowing"
  | "irrigation"
  | "treatment"
  | "harvest"
  | "processing"
  | "logistics"
  | "maintenance"
  | "other";

type Operation = {
  id: string;
  user_id: string;
  title: string;
  operation_type: OperationType;
  field_name: string | null;
  crop: string | null;
  responsible: string | null;
  priority: Priority;
  status: Status;
  planned_start: string;
  planned_end: string | null;
  notes: string | null;
  completed_at: string | null;
};

type FormState = {
  title: string;
  operationType: OperationType;
  fieldName: string;
  crop: string;
  responsible: string;
  priority: Priority;
  status: Status;
  start: string;
  end: string;
  notes: string;
};

const operationTypes: Array<[OperationType, string]> = [
  ["sowing", "Sowing / planting"],
  ["irrigation", "Irrigation"],
  ["treatment", "Crop treatment"],
  ["harvest", "Harvest"],
  ["processing", "Post-harvest processing"],
  ["logistics", "Logistics / delivery"],
  ["maintenance", "Equipment maintenance"],
  ["other", "Other"],
];

const statuses: Array<[Status, string]> = [
  ["planned", "Planned"],
  ["in_progress", "In progress"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

function localDateTime(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function emptyForm(): FormState {
  const start = new Date();
  start.setMinutes(Math.ceil(start.getMinutes() / 30) * 30, 0, 0);
  return {
    title: "",
    operationType: "harvest",
    fieldName: "",
    crop: "",
    responsible: "",
    priority: "medium",
    status: "planned",
    start: localDateTime(start),
    end: localDateTime(new Date(start.getTime() + 2 * 60 * 60 * 1000)),
    notes: "",
  };
}

function dateLabel(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function typeLabel(value: OperationType) {
  return operationTypes.find(([type]) => type === value)?.[1] ?? value;
}

function statusLabel(value: Status) {
  return statuses.find(([status]) => status === value)?.[1] ?? value;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const journalTable = () =>
  (supabase as unknown as { from: (table: string) => any }).from("farm_operations");
/* eslint-enable @typescript-eslint/no-explicit-any */

export function ProductionJournal() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const [operations, setOperations] = useState<Operation[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setLoading(false);
      setOperations([]);
      return;
    }

    setLoading(true);
    journalTable()
      .select("*")
      .eq("user_id", userId)
      .order("planned_start", { ascending: true })
      .then(({ data, error: loadError }: { data: Operation[] | null; error: unknown }) => {
        setOperations(data ?? []);
        setError(loadError ? "Could not load the production journal." : null);
        setLoading(false);
      });
  }, [authLoading, userId]);

  const visibleOperations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return operations.filter((operation) => {
      if (statusFilter !== "all" && operation.status !== statusFilter) return false;
      if (!query) return true;
      return [
        operation.title,
        operation.field_name,
        operation.crop,
        operation.responsible,
        operation.notes,
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [operations, search, statusFilter]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const week = now + 7 * 24 * 60 * 60 * 1000;
    return {
      upcoming: operations.filter((item) => {
        const start = new Date(item.planned_start).getTime();
        return item.status === "planned" && start >= now && start <= week;
      }).length,
      active: operations.filter((item) => item.status === "in_progress").length,
      completed: operations.filter((item) => item.status === "completed").length,
      urgent: operations.filter(
        (item) =>
          !["completed", "cancelled"].includes(item.status) &&
          ["high", "critical"].includes(item.priority),
      ).length,
    };
  }, [operations]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setEditorOpen(true);
  }

  function startEdit(operation: Operation) {
    setEditingId(operation.id);
    setForm({
      title: operation.title,
      operationType: operation.operation_type,
      fieldName: operation.field_name ?? "",
      crop: operation.crop ?? "",
      responsible: operation.responsible ?? "",
      priority: operation.priority,
      status: operation.status,
      start: localDateTime(new Date(operation.planned_start)),
      end: operation.planned_end ? localDateTime(new Date(operation.planned_end)) : "",
      notes: operation.notes ?? "",
    });
    setError(null);
    setEditorOpen(true);
  }

  async function saveOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const start = new Date(form.start);
    const end = form.end ? new Date(form.end) : null;
    if (!form.title.trim()) return setError("Add an operation title.");
    if (Number.isNaN(start.getTime())) return setError("Choose a valid start time.");
    if (end && end < start) return setError("End time cannot be earlier than start time.");

    setSaving(true);
    setError(null);
    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      operation_type: form.operationType,
      field_name: form.fieldName.trim() || null,
      crop: form.crop.trim() || null,
      responsible: form.responsible.trim() || null,
      priority: form.priority,
      status: form.status,
      planned_start: start.toISOString(),
      planned_end: end?.toISOString() ?? null,
      notes: form.notes.trim() || null,
      completed_at: form.status === "completed" ? new Date().toISOString() : null,
    };

    const query = editingId
      ? journalTable().update(payload).eq("id", editingId).eq("user_id", user.id)
      : journalTable().insert(payload);
    const { data, error: saveError } = await query.select("*").single();

    if (saveError) {
      setError("Could not save this operation.");
      setSaving(false);
      return;
    }

    const saved = data as Operation;
    setOperations((current) => {
      const next = editingId
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [...current, saved];
      return next.sort(
        (a, b) => new Date(a.planned_start).getTime() - new Date(b.planned_start).getTime(),
      );
    });
    setSaving(false);
    setEditorOpen(false);
    setEditingId(null);
  }

  async function setStatus(operation: Operation, status: Status) {
    if (!user) return;
    const { data, error: updateError } = await journalTable()
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", operation.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (updateError) return setError("Could not update the operation status.");
    setOperations((current) =>
      current.map((item) => (item.id === operation.id ? (data as Operation) : item)),
    );
  }

  async function removeOperation(operation: Operation) {
    if (!user || !window.confirm(`Delete “${operation.title}”?`)) return;
    const { error: deleteError } = await journalTable()
      .delete()
      .eq("id", operation.id)
      .eq("user_id", user.id);
    if (deleteError) return setError("Could not delete this operation.");
    setOperations((current) => current.filter((item) => item.id !== operation.id));
  }

  return (
    <section id="production-journal" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <ClipboardList className="h-4 w-4" /> Farm operations
          </div>
          <h2 className="text-2xl font-semibold">Production journal & work planner</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Plan harvests, treatments, processing, logistics and maintenance; assign responsible
            people and keep a history of completed work.
          </p>
        </div>
        {user && (
          <Button onClick={startCreate}>
            <Plus className="mr-2 h-4 w-4" /> New operation
          </Button>
        )}
      </div>

      {!authLoading && !user ? (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="font-medium">Sign in to use the production journal</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your plan is private and synchronized with your AgroHelp account.
          </p>
          <Button asChild className="mt-4">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={CalendarDays} value={metrics.upcoming} label="Next 7 days" />
            <Metric icon={PlayCircle} value={metrics.active} label="In progress" />
            <Metric icon={CheckCircle2} value={metrics.completed} label="Completed" />
            <Metric icon={ClipboardList} value={metrics.urgent} label="High priority" />
          </div>

          {editorOpen && (
            <form
              onSubmit={saveOperation}
              className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">
                  {editingId ? "Edit operation" : "Plan new operation"}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditorOpen(false)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="journal-title">Operation title</Label>
                <Input
                  id="journal-title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Harvest tomatoes from greenhouse 3"
                  maxLength={180}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                  label="Type"
                  value={form.operationType}
                  options={operationTypes}
                  onChange={(value) => setForm({ ...form, operationType: value as OperationType })}
                />
                <SelectField
                  label="Priority"
                  value={form.priority}
                  options={[
                    ["low", "Low"],
                    ["medium", "Medium"],
                    ["high", "High"],
                    ["critical", "Critical"],
                  ]}
                  onChange={(value) => setForm({ ...form, priority: value as Priority })}
                />
                <SelectField
                  label="Status"
                  value={form.status}
                  options={statuses}
                  onChange={(value) => setForm({ ...form, status: value as Status })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <TextField
                  label="Field / facility"
                  value={form.fieldName}
                  onChange={(fieldName) => setForm({ ...form, fieldName })}
                />
                <TextField
                  label="Crop / product"
                  value={form.crop}
                  onChange={(crop) => setForm({ ...form, crop })}
                />
                <TextField
                  label="Responsible"
                  value={form.responsible}
                  onChange={(responsible) => setForm({ ...form, responsible })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="journal-start">Start</Label>
                  <Input
                    id="journal-start"
                    type="datetime-local"
                    value={form.start}
                    onChange={(event) => setForm({ ...form, start: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="journal-end">End</Label>
                  <Input
                    id="journal-end"
                    type="datetime-local"
                    value={form.end}
                    onChange={(event) => setForm({ ...form, end: event.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="journal-notes">Notes</Label>
                <Textarea
                  id="journal-notes"
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  rows={3}
                  maxLength={2000}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Save changes" : "Create operation"}
              </Button>
            </form>
          )}

          <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm md:grid-cols-[1fr_190px]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search operation, crop, field or person..."
                className="pl-9"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | Status)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              {statuses.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {error && !editorOpen && <p className="text-sm text-destructive">{error}</p>}
          {loading || authLoading ? (
            <div className="flex min-h-36 items-center justify-center rounded-2xl border bg-card">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : visibleOperations.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
              {operations.length === 0
                ? "No operations planned yet. Add the first production task."
                : "No operations match the current filter."}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleOperations.map((operation) => (
                <article key={operation.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{statusLabel(operation.status)}</Badge>
                        <Badge
                          variant={operation.priority === "critical" ? "destructive" : "secondary"}
                        >
                          {operation.priority} priority
                        </Badge>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          {typeLabel(operation.operation_type)}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">{operation.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {dateLabel(operation.planned_start)}
                        {operation.planned_end ? ` → ${dateLabel(operation.planned_end)}` : ""}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {[operation.field_name, operation.crop, operation.responsible]
                          .filter(Boolean)
                          .join(" · ") || "No field, crop or responsible person specified"}
                      </p>
                      {operation.notes && (
                        <p className="mt-2 whitespace-pre-wrap text-sm">{operation.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      {operation.status === "planned" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void setStatus(operation, "in_progress")}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" /> Start
                        </Button>
                      )}
                      {operation.status === "in_progress" && (
                        <Button size="sm" onClick={() => void setStatus(operation, "completed")}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(operation)}
                        aria-label="Edit operation"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => void removeOperation(operation)}
                        aria-label="Delete operation"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof CalendarDays;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <div>
          <div className="text-xl font-semibold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-medium">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
