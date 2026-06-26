import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Download, GraduationCap, CalendarDays, FolderOpen } from "lucide-react";
import { fmtDate, fmtDateTime, letterGrade } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/student-portal/$token")({
  component: StudentPortal,
});

function StudentPortal() {
  const { token } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["portal", token],
    queryFn: async () => {
      const { data: student } = await supabase
        .from("students")
        .select("id,name,email,student_modules(modules(id,name))")
        .eq("share_token", token)
        .maybeSingle();
      if (!student) return null;
      const sid = (student as { id: string }).id;
      const moduleIds = ((student as { student_modules: { modules: { id: string } | null }[] }).student_modules)
        .map((sm) => sm.modules?.id).filter(Boolean) as string[];

      const [lessons, grades, attendance, materials, assignments] = await Promise.all([
        supabase
          .from("lessons").select("id,lesson_date,topic,notes,modules(name)")
          .eq("student_id", sid).gte("lesson_date", new Date().toISOString())
          .order("lesson_date").limit(10),
        supabase
          .from("grades").select("id,assessment_name,marks_obtained,total_marks,percentage,date,modules(name)")
          .eq("student_id", sid).order("date", { ascending: false }),
        supabase
          .from("attendance").select("status").eq("student_id", sid),
        moduleIds.length
          ? supabase.from("materials")
              .select("id,file_name,file_path,topic,modules(name)")
              .in("module_id", moduleIds)
              .order("uploaded_at", { ascending: false })
          : Promise.resolve({ data: [] as Array<{ id: string; file_name: string; file_path: string; topic: string | null; modules: { name: string } | null }> }),
        supabase
          .from("student_assignments")
          .select("status,assignments(title,due_date,modules(name))")
          .eq("student_id", sid),
      ]);

      const attRows = (attendance.data ?? []) as { status: string }[];
      const attPresent = attRows.filter((a) => a.status === "present").length;
      const attPct = attRows.length ? Math.round((attPresent / attRows.length) * 100) : 0;
      const grades_ = (grades.data ?? []) as Array<{ id: string; assessment_name: string; marks_obtained: number; total_marks: number; percentage: number; date: string; modules: { name: string } | null }>;
      const avg = grades_.length ? Math.round(grades_.reduce((s, g) => s + Number(g.percentage), 0) / grades_.length) : 0;

      return {
        student: student as { id: string; name: string; email: string | null; student_modules: { modules: { id: string; name: string } | null }[] },
        lessons: (lessons.data ?? []) as Array<{ id: string; lesson_date: string; topic: string | null; notes: string | null; modules: { name: string } | null }>,
        grades: grades_,
        attendance: { pct: attPct, present: attPresent, total: attRows.length },
        avg,
        materials: (materials.data ?? []) as Array<{ id: string; file_name: string; file_path: string; topic: string | null; modules: { name: string } | null }>,
        assignments: (assignments.data ?? []) as Array<{ status: string; assignments: { title: string; due_date: string | null; modules: { name: string } | null } | null }>,
      };
    },
  });

  const downloadMaterial = async (path: string) => {
    const { data, error } = await supabase.storage.from("materials").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  if (isLoading) return <Center>Loading…</Center>;
  if (!data) return <Center>This portal link is invalid or has been revoked.</Center>;

  const { student, lessons, grades, attendance, avg, materials, assignments } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Student portal</div>
            <h1 className="text-xl font-bold">{student.name}</h1>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Attendance" value={`${attendance.pct}%`} sub={`${attendance.present}/${attendance.total}`} />
          <Stat label="Average grade" value={`${avg}%`} sub={letterGrade(avg)} />
          <Stat label="Modules" value={String(student.student_modules.length)} />
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Upcoming lessons</CardTitle></CardHeader>
          <CardContent>
            {lessons.length === 0 && <p className="text-sm text-muted-foreground">No upcoming lessons.</p>}
            <ul className="space-y-2">
              {lessons.map((l) => (
                <li key={l.id} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between text-sm">
                    <span>{l.topic ?? "Lesson"} · <span className="text-muted-foreground">{l.modules?.name}</span></span>
                    <span className="text-muted-foreground whitespace-nowrap ml-2">{fmtDateTime(l.lesson_date)}</span>
                  </div>
                  {l.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{l.notes}</p>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Grades</CardTitle></CardHeader>
          <CardContent>
            {grades.length === 0 && <p className="text-sm text-muted-foreground">No grades yet.</p>}
            <ul className="space-y-2">
              {grades.map((g) => (
                <li key={g.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span>{g.assessment_name} · <span className="text-muted-foreground">{g.modules?.name}</span></span>
                  <span className="font-medium">
                    {g.marks_obtained}/{g.total_marks} ({Math.round(Number(g.percentage))}%)
                    <span className="text-xs text-muted-foreground ml-2">{fmtDate(g.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5" /> Materials</CardTitle></CardHeader>
          <CardContent>
            {materials.length === 0 && <p className="text-sm text-muted-foreground">No materials uploaded.</p>}
            <ul className="space-y-2">
              {materials.map((m) => (
                <li key={m.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span>
                    {m.topic && <Badge variant="secondary" className="mr-2">{m.topic}</Badge>}
                    {m.file_name}
                    <span className="text-xs text-muted-foreground ml-2">{m.modules?.name}</span>
                  </span>
                  <Button size="sm" variant="outline" onClick={() => downloadMaterial(m.file_path)}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
          <CardContent>
            {assignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments.</p>}
            <ul className="space-y-2">
              {assignments.map((a, i) => (
                <li key={i} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span>{a.assignments?.title} · <span className="text-muted-foreground">{a.assignments?.modules?.name}</span></span>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.status === "completed" ? "default" : a.status === "submitted" ? "secondary" : "outline"}>
                      {a.status}
                    </Badge>
                    {a.assignments?.due_date && (
                      <span className="text-xs text-muted-foreground">Due {fmtDate(a.assignments.due_date)}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground p-6 text-center">
      {children}
    </div>
  );
}
