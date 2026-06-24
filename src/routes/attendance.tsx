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
import { fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/attendance")({
  component: AttendancePage,
});

type Status = "present" | "absent" | "late";

function AttendancePage() {
  const qc = useQueryClient();
  const [lessonId, setLessonId] = useState("");
  const [marks, setMarks] = useState<Record<string, Status>>({});

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

  // students in lesson's module (or just the lesson's single student)
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

  // existing attendance for the lesson
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
      const m: Record<string, Status> = {};
      existing.forEach((r) => { m[r.student_id] = r.status; });
      setMarks(m);
    }
  }, [existing, lessonId]);

  const save = useMutation({
    mutationFn: async () => {
      if (!lessonId) throw new Error("Pick a lesson");
      const rows = Object.entries(marks).map(([student_id, status]) => ({
        lesson_id: lessonId, student_id, status,
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
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <PageHeader title="Attendance" description="Mark attendance per lesson." />
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
            <h3 className="font-semibold mb-4">Mark attendance — {selectedLesson.modules?.name ?? selectedLesson.topic}</h3>
            {(!lessonStudents || lessonStudents.length === 0) && (
              <p className="text-sm text-muted-foreground">No students linked to this lesson.</p>
            )}
            <ul className="space-y-2">
              {lessonStudents?.map((s) => (
                <li key={s.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <span className="font-medium">{s.name}</span>
                  <div className="flex gap-2">
                    {(["present", "absent", "late"] as Status[]).map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={marks[s.id] === st ? "default" : "outline"}
                        onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                        className="capitalize"
                      >
                        {st}
                      </Button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
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
