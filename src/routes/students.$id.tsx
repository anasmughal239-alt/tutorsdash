import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtDateTime, letterGrade } from "@/lib/format";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/students/$id")({
  component: StudentDetail,
});

function StudentDetail() {
  const { id } = Route.useParams();

  const { data: student } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(
          "id,name,email,phone,share_token,student_modules(modules(id,name))",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        share_token: string;
        student_modules: { modules: { id: string; name: string } | null }[];
      } | null;
    },
  });

  const { data: lessons } = useQuery({
    queryKey: ["student-lessons", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("lessons")
        .select("id,lesson_date,topic,modules(name)")
        .eq("student_id", id)
        .order("lesson_date", { ascending: false })
        .limit(20);
      return (data ?? []) as Array<{
        id: string;
        lesson_date: string;
        topic: string | null;
        modules: { name: string } | null;
      }>;
    },
  });

  const { data: attendance } = useQuery({
    queryKey: ["student-attendance", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance")
        .select("status,lesson_id,lessons(lesson_date,topic)")
        .eq("student_id", id);
      return (data ?? []) as Array<{
        status: string;
        lessons: { lesson_date: string; topic: string | null } | null;
      }>;
    },
  });

  const { data: grades } = useQuery({
    queryKey: ["student-grades", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("grades")
        .select("id,assessment_name,marks_obtained,total_marks,percentage,date,modules(name)")
        .eq("student_id", id)
        .order("date", { ascending: false });
      return (data ?? []) as Array<{
        id: string;
        assessment_name: string;
        marks_obtained: number;
        total_marks: number;
        percentage: number;
        date: string;
        modules: { name: string } | null;
      }>;
    },
  });

  if (!student)
    return (
      <AppShell>
        <PageHeader title="Student" />
        <p className="text-muted-foreground">Loading…</p>
      </AppShell>
    );

  const attTotal = attendance?.length ?? 0;
  const attPresent = attendance?.filter((a) => a.status === "present").length ?? 0;
  const attPct = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;
  const avgGrade = grades?.length
    ? Math.round(grades.reduce((s, g) => s + Number(g.percentage), 0) / grades.length)
    : 0;

  const portalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/student-portal/${student.share_token}`
      : "";

  return (
    <AppShell>
      <PageHeader
        title={student.name}
        description={[student.email, student.phone].filter(Boolean).join(" · ")}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(portalUrl);
                toast.success("Portal link copied");
              }}
            >
              <Copy className="h-4 w-4 mr-1" /> Copy portal link
            </Button>
            <Button asChild>
              <a href={portalUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" /> Open portal
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Attendance</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{attPct}%</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Average grade</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{avgGrade}% <span className="text-base text-muted-foreground">({letterGrade(avgGrade)})</span></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Modules</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {student.student_modules.map((sm) =>
              sm.modules ? <Badge key={sm.modules.id}>{sm.modules.name}</Badge> : null,
            )}
            {student.student_modules.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent lessons</CardTitle></CardHeader>
          <CardContent>
            {lessons?.length === 0 && <p className="text-sm text-muted-foreground">No lessons.</p>}
            <ul className="space-y-2">
              {lessons?.map((l) => (
                <li key={l.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span>{l.topic || "Lesson"} · <span className="text-muted-foreground">{l.modules?.name}</span></span>
                  <span className="text-muted-foreground">{fmtDateTime(l.lesson_date)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Grades</CardTitle></CardHeader>
          <CardContent>
            {grades?.length === 0 && <p className="text-sm text-muted-foreground">No grades.</p>}
            <ul className="space-y-2">
              {grades?.map((g) => (
                <li key={g.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span>{g.assessment_name} <span className="text-muted-foreground">· {g.modules?.name}</span></span>
                  <span className="font-medium">
                    {g.marks_obtained}/{g.total_marks} ({Math.round(Number(g.percentage))}%)
                    <span className="text-xs text-muted-foreground ml-2">{fmtDate(g.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Link to="/students" className="text-sm text-primary hover:underline">← All students</Link>
      </div>
    </AppShell>
  );
}
