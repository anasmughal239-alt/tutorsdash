import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, ClipboardList, CheckSquare } from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [students, lessons, assignments, attendance] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase
          .from("lessons")
          .select("id,lesson_date,topic,student_id,module_id,students(name),modules(name)")
          .gte("lesson_date", new Date().toISOString())
          .order("lesson_date", { ascending: true })
          .limit(5),
        supabase
          .from("student_assignments")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("attendance")
          .select("status")
          .gte(
            "recorded_at",
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          ),
      ]);

      const attRows = (attendance.data as { status: string }[] | null) ?? [];
      const present = attRows.filter((r) => r.status === "present").length;
      const attPct = attRows.length ? Math.round((present / attRows.length) * 100) : 0;

      return {
        students: students.count ?? 0,
        nextLessons: lessons.data ?? [],
        pendingAssignments: assignments.count ?? 0,
        attendancePct: attPct,
      };
    },
  });

  const { data: recentStudents } = useQuery({
    queryKey: ["recent-students"],
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("id,name,created_at,student_modules(modules(name))")
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening with your tutoring."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Students" value={stats?.students ?? 0} icon={<Users className="h-5 w-5" />} />
        <StatCard
          label="Next Lesson"
          value={
            stats?.nextLessons?.[0]
              ? fmtDateTime((stats.nextLessons[0] as { lesson_date: string }).lesson_date)
              : "None scheduled"
          }
          icon={<CalendarDays className="h-5 w-5" />}
          small
        />
        <StatCard
          label="Pending Assignments"
          value={stats?.pendingAssignments ?? 0}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Attendance (this month)"
          value={`${stats?.attendancePct ?? 0}%`}
          icon={<CheckSquare className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.nextLessons?.length && (
              <p className="text-sm text-muted-foreground">No upcoming lessons scheduled.</p>
            )}
            <ul className="space-y-3">
              {(stats?.nextLessons as Array<{
                id: string;
                lesson_date: string;
                topic: string | null;
                students: { name: string } | null;
                modules: { name: string } | null;
              }> | undefined)?.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{l.topic || "Lesson"}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.students?.name || "—"} · {l.modules?.name || "—"}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {fmtDateTime(l.lesson_date)}
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild variant="link" className="mt-4 px-0">
              <Link to="/lessons">View all lessons →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent students</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentStudents?.length && (
              <p className="text-sm text-muted-foreground">No students added yet.</p>
            )}
            <ul className="space-y-3">
              {(recentStudents as Array<{
                id: string;
                name: string;
                student_modules: { modules: { name: string } | null }[];
              }> | undefined)?.map((s) => (
                <li key={s.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.student_modules?.map((sm) => sm.modules?.name).filter(Boolean).join(", ") || "No modules"}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/students/$id" params={{ id: s.id }}>
                      View
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
            <Button asChild variant="link" className="mt-4 px-0">
              <Link to="/students">All students →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  small,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  small?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-primary">{icon}</span>
        </div>
        <div className={small ? "mt-2 text-base font-semibold" : "mt-2 text-2xl font-bold"}>{value}</div>
      </CardContent>
    </Card>
  );
}
