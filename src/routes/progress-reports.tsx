import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { fmtDate, letterGrade } from "@/lib/format";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/progress-reports")({
  component: ProgressReports,
});

function ProgressReports() {
  const [studentId, setStudentId] = useState("");

  const { data: students } = useQuery({
    queryKey: ["students-min"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const { data: report } = useQuery({
    queryKey: ["report", studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const [s, attendance, grades, assignments] = await Promise.all([
        supabase.from("students").select("id,name,email").eq("id", studentId).maybeSingle(),
        supabase.from("attendance").select("status,lessons(lesson_date)").eq("student_id", studentId),
        supabase
          .from("grades")
          .select("assessment_name,percentage,date,modules(name)")
          .eq("student_id", studentId)
          .order("date"),
        supabase
          .from("student_assignments")
          .select("status,assignments(title,due_date)")
          .eq("student_id", studentId),
      ]);
      return {
        student: s.data as { id: string; name: string; email: string | null } | null,
        attendance: (attendance.data ?? []) as Array<{ status: string; lessons: { lesson_date: string } | null }>,
        grades: (grades.data ?? []) as Array<{ assessment_name: string; percentage: number; date: string; modules: { name: string } | null }>,
        assignments: (assignments.data ?? []) as Array<{ status: string; assignments: { title: string; due_date: string | null } | null }>,
      };
    },
  });

  const attTotal = report?.attendance.length ?? 0;
  const attPresent = report?.attendance.filter((a) => a.status === "present").length ?? 0;
  const attPct = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;

  const avgGrade = report?.grades.length
    ? Math.round(report.grades.reduce((s, g) => s + Number(g.percentage), 0) / report.grades.length)
    : 0;

  const completedAssignments = report?.assignments.filter((a) => a.status === "completed").length ?? 0;
  const totalAssignments = report?.assignments.length ?? 0;
  const assignmentPct = totalAssignments ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  // trend
  const first = report?.grades[0]?.percentage;
  const last = report?.grades[report.grades.length - 1]?.percentage;
  const trend =
    !first || !last ? "stable" :
    Number(last) > Number(first) + 5 ? "improving" :
    Number(last) < Number(first) - 5 ? "declining" : "stable";

  const gradeChart = (report?.grades ?? []).map((g) => ({
    name: fmtDate(g.date),
    percent: Math.round(Number(g.percentage)),
  }));

  return (
    <AppShell>
      <PageHeader
        title="Progress Reports"
        description="Auto-generated overview of attendance, grades, and assignments."
        actions={
          studentId && (
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          )
        }
      />

      <Card className="mb-6 print:hidden">
        <CardContent className="pt-6">
          <Label>Student</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger className="max-w-md"><SelectValue placeholder="Pick a student" /></SelectTrigger>
            <SelectContent>
              {students?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {studentId && report?.student && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Stat label="Attendance" value={`${attPct}%`} sub={`${attPresent}/${attTotal} lessons`} />
            <Stat label="Avg grade" value={`${avgGrade}%`} sub={letterGrade(avgGrade)} />
            <Stat label="Assignments done" value={`${assignmentPct}%`} sub={`${completedAssignments}/${totalAssignments}`} />
            <Stat label="Trend" value={trend} sub="based on grade history" />
          </div>

          {gradeChart.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Grade progression</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="percent" stroke="oklch(0.55 0.22 265)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Attendance breakdown</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={["present", "absent", "late"].map((status) => ({
                    status,
                    count: report.attendance.filter((a) => a.status === status).length,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="oklch(0.55 0.22 265)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>All grades</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {report.grades.map((g, i) => (
                  <li key={i} className="flex justify-between border-b pb-2 last:border-0">
                    <span>{g.assessment_name} · <span className="text-muted-foreground">{g.modules?.name}</span></span>
                    <span className="font-medium">{Math.round(Number(g.percentage))}% <span className="text-xs text-muted-foreground ml-2">{fmtDate(g.date)}</span></span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1 capitalize">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
