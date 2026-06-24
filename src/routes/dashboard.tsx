import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import {
  Users,
  CalendarDays,
  ClipboardList,
  CheckSquare,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

// 0 = normal dashboard, 1 = welcome, 2 = add-student form, 3 = success
type ObStep = 0 | 1 | 2 | 3;

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Onboarding state
  const [obStep, setObStep] = useState<ObStep | null>(null); // null = waiting for stats
  const [obName,  setObName]  = useState("");
  const [obEmail, setObEmail] = useState("");
  const [obPhone, setObPhone] = useState("");
  const [obSaving, setObSaving] = useState(false);

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

  // Initialize onboarding only once after stats loads
  useEffect(() => {
    if (stats === undefined || obStep !== null) return;
    setObStep(stats.students === 0 ? 1 : 0);
  }, [stats, obStep]);

  async function addStudent() {
    if (!obName.trim()) return;
    setObSaving(true);
    await supabase
      .from("students")
      .insert({ name: obName.trim(), email: obEmail.trim() || null, phone: obPhone.trim() || null });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    await queryClient.invalidateQueries({ queryKey: ["recent-students"] });
    setObSaving(false);
    setObStep(3);
  }

  const showOnboarding = obStep !== null && obStep > 0;

  return (
    <AppShell>
      {showOnboarding ? (
        <div className="max-w-lg mx-auto mt-4">
          {/* Step progress indicator */}
          {obStep > 1 && (
            <div className="flex items-center gap-2 mb-6">
              {([1, 2, 3] as const).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors"
                    style={{
                      background: s < obStep ? "#ff4f00" : s === obStep ? "#ff4f00" : "var(--color-muted)",
                      color: s <= obStep ? "#fffefb" : "var(--color-muted-foreground)",
                    }}
                  >
                    {s < obStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {s === 1 ? "Welcome" : s === 2 ? "Add student" : "Done"}
                  </span>
                  {s < 3 && <div className="h-px w-6 bg-border" />}
                </div>
              ))}
            </div>
          )}

          {/* Step 1 — Welcome */}
          {obStep === 1 && (
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-5">
                  <Zap className="h-7 w-7 text-primary-foreground" />
                </div>
                <p className="zp-eyebrow mb-3">Setup</p>
                <h1 className="text-2xl font-semibold text-foreground mb-3">
                  Welcome to TutorDash
                </h1>
                <p className="zp-body max-w-sm">
                  Let's get your workspace set up in 2 minutes. We'll start by adding your first student.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: Users,        title: "Add students",    desc: "Build your student roster" },
                  { icon: CalendarDays, title: "Schedule lessons", desc: "Plan your teaching week" },
                  { icon: CheckSquare,  title: "Track progress",  desc: "Grades, attendance, reports" },
                ].map((f) => (
                  <div key={f.title} className="flex flex-col items-center text-center gap-2 rounded-lg bg-background border border-border p-4">
                    <f.icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-semibold text-foreground leading-tight">{f.title}</span>
                    <span className="text-[11px] text-muted-foreground leading-tight hidden sm:block">{f.desc}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" size="lg" onClick={() => setObStep(2)}>
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setObStep(0)}
              >
                Skip — I'll explore on my own
              </button>
            </div>
          )}

          {/* Step 2 — Add first student */}
          {obStep === 2 && (
            <div className="bg-card rounded-xl p-8 border border-border">
              <p className="zp-eyebrow mb-3">Step 2 of 3</p>
              <h2 className="text-xl font-semibold text-foreground mb-1">Add your first student</h2>
              <p className="zp-body mb-6">Just a name is enough. You can fill in the rest later.</p>

              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="ob-name">Name <span className="text-primary">*</span></Label>
                  <Input
                    id="ob-name"
                    placeholder="e.g. Ali Hassan"
                    value={obName}
                    onChange={(e) => setObName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addStudent()}
                    autoFocus
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="ob-email" className="flex items-center gap-1.5">
                    Email <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="ob-email"
                    type="email"
                    placeholder="student@email.com"
                    value={obEmail}
                    onChange={(e) => setObEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="ob-phone" className="flex items-center gap-1.5">
                    Phone <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="ob-phone"
                    placeholder="+92 300 0000000"
                    value={obPhone}
                    onChange={(e) => setObPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setObStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={addStudent}
                  disabled={!obName.trim() || obSaving}
                >
                  {obSaving ? "Adding…" : "Add student"}
                  {!obSaving && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Success */}
          {obStep === 3 && (
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary mb-5">
                  <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
                </div>
                <p className="zp-eyebrow mb-3">All done</p>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  <span className="text-primary">{obName}</span> has been added!
                </h2>
                <p className="zp-body">What would you like to do next?</p>
              </div>

              <div className="grid gap-2 mb-6">
                {[
                  { label: "View & manage students",  to: "/students" as const },
                  { label: "Schedule a lesson",       to: "/lessons"  as const },
                  { label: "Create a module",         to: "/modules"  as const },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate({ to: action.to })}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-background border border-border text-sm font-medium text-foreground hover:border-foreground hover:bg-card transition-colors text-left"
                  >
                    {action.label}
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>

              <Button className="w-full" onClick={() => setObStep(0)}>
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* ── Normal dashboard ── */
        <>
          <PageHeader
            eyebrow="Overview"
            title="Dashboard"
            description="Here's what's happening with your tutoring."
          />

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              label="Students"
              value={stats?.students ?? "—"}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              label="Next lesson"
              value={
                stats?.nextLessons?.[0]
                  ? fmtDateTime((stats.nextLessons[0] as { lesson_date: string }).lesson_date)
                  : "None scheduled"
              }
              icon={<CalendarDays className="h-4 w-4" />}
              compact
            />
            <StatCard
              label="Pending assignments"
              value={stats?.pendingAssignments ?? "—"}
              icon={<ClipboardList className="h-4 w-4" />}
            />
            <StatCard
              label="Attendance this month"
              value={stats ? `${stats.attendancePct}%` : "—"}
              icon={<CheckSquare className="h-4 w-4" />}
            />
          </div>

          {/* Content cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming lessons */}
            <ContentCard
              title="Upcoming lessons"
              footerLink={{ label: "View all lessons", to: "/lessons" }}
            >
              {!stats?.nextLessons?.length ? (
                <EmptySlate
                  message="No upcoming lessons scheduled."
                  action={{ label: "Schedule a lesson", to: "/lessons" }}
                />
              ) : (
                <ul className="divide-y divide-border">
                  {(stats.nextLessons as Array<{
                    id: string;
                    lesson_date: string;
                    topic: string | null;
                    students: { name: string } | null;
                    modules: { name: string } | null;
                  }>).map((l) => (
                    <li key={l.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {l.topic || "Lesson"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {l.students?.name || "—"} · {l.modules?.name || "—"}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 pt-0.5">
                        {fmtDateTime(l.lesson_date)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ContentCard>

            {/* Recent students */}
            <ContentCard
              title="Recent students"
              footerLink={{ label: "All students", to: "/students" }}
            >
              {!recentStudents?.length ? (
                <EmptySlate
                  message="No students added yet."
                  action={{ label: "Add your first student", to: "/students" }}
                />
              ) : (
                <ul className="divide-y divide-border">
                  {(recentStudents as Array<{
                    id: string;
                    name: string;
                    student_modules: { modules: { name: string } | null }[];
                  }>).map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {s.student_modules?.map((sm) => sm.modules?.name).filter(Boolean).join(", ") || "No modules"}
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/students/$id" params={{ id: s.id }}>View</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </ContentCard>
          </div>
        </>
      )}
    </AppShell>
  );
}

/* ── Sub-components ── */

function StatCard({
  label,
  value,
  icon,
  compact,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="zp-eyebrow">{label}</p>
        <span className="text-primary">{icon}</span>
      </div>
      <div className={compact ? "text-base font-semibold text-foreground leading-tight" : "text-3xl font-semibold text-foreground"}>
        {value}
      </div>
    </div>
  );
}

function ContentCard({
  title,
  children,
  footerLink,
}: {
  title: string;
  children: React.ReactNode;
  footerLink?: { label: string; to: string };
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-6 py-4">{children}</div>
      {footerLink && (
        <div className="px-6 pb-4">
          <Link
            to={footerLink.to as "/lessons" | "/students"}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {footerLink.label} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function EmptySlate({
  message,
  action,
}: {
  message: string;
  action: { label: string; to: string };
}) {
  return (
    <div className="flex flex-col items-start gap-3 py-2">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button asChild size="sm" variant="outline">
        <Link to={action.to as "/lessons" | "/students"}>{action.label}</Link>
      </Button>
    </div>
  );
}
