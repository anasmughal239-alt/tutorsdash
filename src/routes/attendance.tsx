import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/attendance")({
  component: AttendancePage,
});

type Status = "present" | "absent" | "late";
type CycleStatus = Status | "none";

const CYCLE: CycleStatus[] = ["none", "present", "absent", "late"];

const STATUS_STYLES: Record<CycleStatus, string> = {
  none: "border-border bg-card hover:border-foreground/30 hover:bg-muted/30",
  present: "border-green-500 bg-green-50",
  absent: "border-red-500 bg-red-50",
  late: "border-amber-500 bg-amber-50",
};

const STATUS_LABEL: Record<CycleStatus, string> = {
  none: "Not marked",
  present: "Present",
  absent: "Absent",
  late: "Late",
};

const STATUS_TEXT: Record<CycleStatus, string> = {
  none: "text-muted-foreground",
  present: "text-green-700",
  absent: "text-red-700",
  late: "text-amber-700",
};

// Generate initials avatar color based on name
function avatarColor(name: string) {
  const colors = [
    "#ff4f00", "#16a34a", "#2563eb", "#9333ea", "#db2777", "#0891b2", "#d97706",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function AttendancePage() {
  const qc = useQueryClient();
  const [lessonId, setLessonId] = useState("");
  const [marks, setMarks] = useState<Record<string, CycleStatus>>({});

  const { data: lessons } = useQuery({
    queryKey: ["lessons-for-attendance"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id,lesson_date,topic,module_id,student_id,students(name),modules(name)")
        .order("lesson_date", { ascending: false });
      return (data ?? []) as Array<{
        id: string; lesson_date: string; topic: string | null;
        module_id: string | null; student_id: string | null;
        students: { name: string } | null;
        modules: { name: string } | null;
      }>;
    },
  });

  const selectedLesson = lessons?.find((l) => l.id === lessonId);

  const { data: lessonStudents } = useQuery({
    queryKey: ["lesson-students", lessonId, selectedLesson?.module_id, selectedLesson?.student_id],
    enabled: !!selectedLesson,
    queryFn: async () => {
      if (!selectedLesson) return [];
      const ids = new Set<string>();
      if (selectedLesson.student_id) ids.add(selectedLesson.student_id);
      if (selectedLesson.module_id) {
        const { data } = await supabase
          .from("student_modules")
          .select("student_id")
          .eq("module_id", selectedLesson.module_id);
        (data ?? []).forEach((r) => ids.add((r as { student_id: string }).student_id));
      }
      if (ids.size === 0) return [];
      const { data: students } = await supabase
        .from("students")
        .select("id,name")
        .in("id", Array.from(ids));
      return (students ?? []) as { id: string; name: string }[];
    },
  });

  const { data: existing } = useQuery({
    queryKey: ["attendance-for-lesson", lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("student_id,status")
        .eq("lesson_id", lessonId);
      return (data ?? []) as { student_id: string; status: Status }[];
    },
  });

  useEffect(() => {
    if (existing) {
      const m: Record<string, CycleStatus> = {};
      existing.forEach((r) => { m[r.student_id] = r.status; });
      setMarks(m);
    }
  }, [existing, lessonId]);

  function cycleStatus(studentId: string) {
    const current: CycleStatus = marks[studentId] ?? "none";
    const idx = CYCLE.indexOf(current);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setMarks((m) => ({ ...m, [studentId]: next }));
  }

  function markAllPresent() {
    if (!lessonStudents) return;
    const m: Record<string, CycleStatus> = {};
    lessonStudents.forEach((s) => { m[s.id] = "present"; });
    setMarks(m);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!lessonId) throw new Error("Pick a lesson");
      const rows = Object.entries(marks)
        .filter(([, status]) => status !== "none")
        .map(([student_id, status]) => ({
          lesson_id: lessonId, student_id, status: status as Status,
        }));
      if (rows.length === 0) return;
      const { error } = await supabase
        .from("attendance")
        .upsert(rows, { onConflict: "student_id,lesson_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Attendance saved");
      qc.invalidateQueries({ queryKey: ["attendance-for-lesson", lessonId] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <AppShell>
      <PageHeader title="Attendance" description="Tap a card to cycle through attendance status." />
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>Select lesson</Label>
            <Select value={lessonId} onValueChange={setLessonId}>
              <SelectTrigger><SelectValue placeholder="Choose a lesson" /></SelectTrigger>
              <SelectContent>
                {lessons?.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {fmtDateTime(l.lesson_date)} · {l.students?.name ?? "—"} · {l.topic ?? "Lesson"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedLesson && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">
                Mark attendance — {selectedLesson.modules?.name ?? selectedLesson.topic}
              </h3>
              {lessonStudents && lessonStudents.length > 0 && (
                <Button size="sm" variant="outline" onClick={markAllPresent}>
                  Mark all present
                </Button>
              )}
            </div>

            {(!lessonStudents || lessonStudents.length === 0) && (
              <p className="text-sm text-muted-foreground">No students linked to this lesson.</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {lessonStudents?.map((s) => {
                const status: CycleStatus = marks[s.id] ?? "none";
                return (
                  <button
                    key={s.id}
                    onClick={() => cycleStatus(s.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer select-none ${STATUS_STYLES[status]}`}
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-white text-sm font-bold flex-shrink-0"
                      style={{ background: avatarColor(s.name) }}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm text-foreground leading-tight">{s.name}</div>
                      <div className={`text-xs mt-0.5 font-medium ${STATUS_TEXT[status]}`}>
                        {STATUS_LABEL[status]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => save.mutate()} disabled={save.isPending || !lessonStudents?.length}>
                {save.isPending ? "Saving…" : "Save attendance"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
