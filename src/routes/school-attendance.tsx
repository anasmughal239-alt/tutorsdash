import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";

export const Route = createFileRoute("/school-attendance")({
  component: SchoolAttendancePage,
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

function avatarColor(name: string) {
  const colors = ["#ff4f00", "#16a34a", "#2563eb", "#9333ea", "#db2777", "#0891b2", "#d97706"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function SchoolAttendancePage() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today);
  const [marks, setMarks] = useState<Record<string, CycleStatus>>({});

  const { data: classes } = useQuery({
    queryKey: ["school-classes"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id,name,subject").order("name");
      return (data ?? []) as { id: string; name: string; subject: string }[];
    },
  });

  const { data: students } = useQuery({
    queryKey: ["class-students", classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data } = await supabase
        .from("class_students")
        .select("students(id,name)")
        .eq("class_id", classId);
      return (data ?? [])
        .map((r: { students: { id: string; name: string } | null }) => r.students)
        .filter(Boolean) as { id: string; name: string }[];
    },
  });

  const { data: existing } = useQuery({
    queryKey: ["class-attendance", classId, date],
    enabled: !!classId && !!date,
    queryFn: async () => {
      const { data } = await supabase
        .from("class_attendance")
        .select("student_id,status")
        .eq("class_id", classId)
        .eq("date", date);
      return (data ?? []) as { student_id: string; status: Status }[];
    },
  });

  useEffect(() => {
    if (existing) {
      const m: Record<string, CycleStatus> = {};
      existing.forEach((r) => { m[r.student_id] = r.status; });
      setMarks(m);
    } else {
      setMarks({});
    }
  }, [existing, classId, date]);

  function cycleStatus(studentId: string) {
    const current: CycleStatus = marks[studentId] ?? "none";
    const idx = CYCLE.indexOf(current);
    setMarks((m) => ({ ...m, [studentId]: CYCLE[(idx + 1) % CYCLE.length] }));
  }

  function markAllPresent() {
    if (!students) return;
    const m: Record<string, CycleStatus> = {};
    students.forEach((s) => { m[s.id] = "present"; });
    setMarks(m);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!classId) throw new Error("Select a class");
      const rows = Object.entries(marks)
        .filter(([, status]) => status !== "none")
        .map(([student_id, status]) => ({ class_id: classId, student_id, date, status: status as Status }));
      if (rows.length === 0) return;
      const { error } = await supabase
        .from("class_attendance")
        .upsert(rows, { onConflict: "class_id,student_id,date" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Attendance saved");
      qc.invalidateQueries({ queryKey: ["class-attendance", classId, date] });
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  const markedCount = Object.values(marks).filter((s) => s !== "none").length;
  const presentCount = Object.values(marks).filter((s) => s === "present").length;

  return (
    <AppShell>
      <PageHeader title="Class Attendance" description="Tap a card to cycle through attendance status." />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Class</Label>
              <Select value={classId} onValueChange={(v) => { setClassId(v); setMarks({}); }}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} · {c.subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {classId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold">
                  {classes?.find((c) => c.id === classId)?.name} — {new Date(date + "T00:00:00").toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                {markedCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {presentCount}/{students?.length ?? 0} present · {markedCount} marked
                  </p>
                )}
              </div>
              {students && students.length > 0 && (
                <Button size="sm" variant="outline" onClick={markAllPresent}>
                  Mark all present
                </Button>
              )}
            </div>

            {(!students || students.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No students enrolled in this class yet. Add students from the{" "}
                <a href="/school-classes" className="text-primary underline">Classes</a> page.
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {students?.map((s) => {
                const status: CycleStatus = marks[s.id] ?? "none";
                return (
                  <button
                    key={s.id}
                    onClick={() => cycleStatus(s.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer select-none ${STATUS_STYLES[status]}`}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold flex-shrink-0"
                      style={{ background: avatarColor(s.name) }}
                    >
                      {initials(s.name)}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm leading-tight">{s.name}</div>
                      <div className={`text-xs mt-0.5 font-medium ${STATUS_TEXT[status]}`}>
                        {STATUS_LABEL[status]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => save.mutate()}
                disabled={save.isPending || !students?.length}
              >
                {save.isPending ? "Saving…" : "Save attendance"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
