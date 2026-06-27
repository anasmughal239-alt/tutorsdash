import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2, Clock, Plus, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";

export const Route = createFileRoute("/school-scheme")({
  component: SchoolSchemePage,
});

type SchemeRow = {
  id: string;
  class_id: string;
  week_number: number;
  topic: string;
  chapter: string | null;
  target_date: string | null;
  status: "planned" | "completed" | "skipped";
};

const STATUS_CONFIG = {
  planned: { label: "Planned", icon: Clock, color: "text-muted-foreground", bg: "" },
  completed: { label: "Done", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  skipped: { label: "Skipped", icon: null, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
};

function isBehindSchedule(row: SchemeRow): boolean {
  if (row.status !== "planned") return false;
  if (!row.target_date) return false;
  return new Date(row.target_date) < new Date();
}

function SchoolSchemePage() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState("");
  const [editRow, setEditRow] = useState<SchemeRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ["school-classes"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id,name,subject").order("name");
      return (data ?? []) as { id: string; name: string; subject: string }[];
    },
  });

  const { data: rows } = useQuery({
    queryKey: ["scheme", classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheme_of_work")
        .select("*")
        .eq("class_id", classId)
        .order("week_number");
      if (error) throw error;
      return (data ?? []) as SchemeRow[];
    },
  });

  const markComplete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheme_of_work")
        .update({ status: "completed" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheme", classId] });
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  const completed = rows?.filter((r) => r.status === "completed").length ?? 0;
  const total = rows?.length ?? 0;
  const behind = rows?.filter(isBehindSchedule) ?? [];
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const selectedClass = classes?.find((c) => c.id === classId);

  return (
    <AppShell>
      <PageHeader
        title="Scheme of Work"
        description="Your year plan — topic by topic, week by week."
        actions={
          classId ? (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add week
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 max-w-xs">
        <Label>Class</Label>
        <Select value={classId} onValueChange={(v) => { setClassId(v); }}>
          <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
          <SelectContent>
            {classes?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name} · {c.subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {classId && (
        <>
          {/* Progress + behind-schedule alert */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Syllabus progress</span>
                  <span className="text-sm font-bold text-primary">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{completed}/{total} weeks completed</p>
              </CardContent>
            </Card>

            {behind.length > 0 && (
              <Card className="border-amber-300 bg-amber-50">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">
                      {behind.length} week{behind.length > 1 ? "s" : ""} behind schedule
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    {behind.slice(0, 2).map((r) => `Week ${r.week_number}: ${r.topic}`).join(" · ")}
                    {behind.length > 2 && ` +${behind.length - 2} more`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Weeks list */}
          {(!rows || rows.length === 0) && (
            <div className="text-center py-20 text-muted-foreground">
              <ListChecks className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No weeks planned yet. Add your first week.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setAddOpen(true)}>
                Add week 1
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {rows?.map((row) => {
              const behind = isBehindSchedule(row);
              const cfg = STATUS_CONFIG[row.status];
              return (
                <div
                  key={row.id}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
                    behind ? "border-amber-300 bg-amber-50" : row.status === "completed" ? "border-green-200 bg-green-50" : "border-border bg-card"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {row.week_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{row.topic}</span>
                      {row.chapter && (
                        <span className="text-xs text-muted-foreground">{row.chapter}</span>
                      )}
                      {behind && (
                        <Badge variant="outline" className="text-amber-700 border-amber-400 text-[10px]">
                          Behind schedule
                        </Badge>
                      )}
                    </div>
                    {row.target_date && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Target: {new Date(row.target_date + "T00:00:00").toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    {row.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => markComplete.mutate(row.id)}
                      >
                        Mark done
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setEditRow(row)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {classId && (
        <>
          <WeekDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            classId={classId}
            existingWeeks={rows?.map((r) => r.week_number) ?? []}
            onSaved={() => qc.invalidateQueries({ queryKey: ["scheme", classId] })}
          />
          {editRow && (
            <WeekDialog
              open={!!editRow}
              onOpenChange={(v) => { if (!v) setEditRow(null); }}
              classId={classId}
              existingWeeks={[]}
              row={editRow}
              onSaved={() => {
                setEditRow(null);
                qc.invalidateQueries({ queryKey: ["scheme", classId] });
              }}
            />
          )}
        </>
      )}
    </AppShell>
  );
}

function WeekDialog({
  open,
  onOpenChange,
  classId,
  existingWeeks,
  row,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classId: string;
  existingWeeks: number[];
  row?: SchemeRow;
  onSaved: () => void;
}) {
  const nextWeek = row ? row.week_number : Math.max(0, ...existingWeeks) + 1;
  const [week, setWeek] = useState(String(nextWeek));
  const [topic, setTopic] = useState(row?.topic ?? "");
  const [chapter, setChapter] = useState(row?.chapter ?? "");
  const [targetDate, setTargetDate] = useState(row?.target_date ?? "");
  const [status, setStatus] = useState<SchemeRow["status"]>(row?.status ?? "planned");

  const save = useMutation({
    mutationFn: async () => {
      if (!topic.trim()) throw new Error("Topic is required");
      const payload = {
        class_id: classId,
        week_number: Number(week),
        topic: topic.trim(),
        chapter: chapter.trim() || null,
        target_date: targetDate || null,
        status,
      };
      if (row) {
        const { error } = await supabase.from("scheme_of_work").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("scheme_of_work").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(row ? "Week updated" : "Week added");
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{row ? "Edit week" : "Add week"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Week number *</Label>
              <Input type="number" min={1} max={52} value={week} onChange={(e) => setWeek(e.target.value)} />
            </div>
            <div>
              <Label>Target date</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Topic *</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Linear Equations" autoFocus={!row} />
          </div>
          <div>
            <Label>Chapter / unit</Label>
            <Input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g. Chapter 4" />
          </div>
          {row && (
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as SchemeRow["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
