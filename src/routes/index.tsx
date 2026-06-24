import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, CalendarDays, FolderOpen, TrendingUp, CheckSquare, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const features = [
  { icon: Users, title: "Student Management", desc: "Add students, track details, and see everything at a glance." },
  { icon: CalendarDays, title: "Lesson Scheduling", desc: "Schedule lessons, set topics, and never miss an upcoming session." },
  { icon: CheckSquare, title: "Attendance Tracking", desc: "Mark attendance for each lesson and see monthly attendance rates." },
  { icon: ClipboardList, title: "Assignments", desc: "Create assignments, assign them to students, and track status." },
  { icon: TrendingUp, title: "Progress Reports", desc: "Auto-generate reports with grades, attendance, and completion rates." },
  { icon: FolderOpen, title: "Materials Upload", desc: "Upload PDFs and docs per module. Share with students instantly." },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm">TutorDash</span>
          </div>
          <Button asChild size="sm">
            <Link to="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3" /> Built for independent tutors
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 max-w-2xl mx-auto leading-tight">
            Manage your students, lessons &amp; progress — all in one place.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Stop juggling spreadsheets and WhatsApp messages. TutorDash keeps everything organised so you can focus on teaching.
          </p>
          <Button asChild size="lg">
            <Link to="/dashboard">Get Started Free</Link>
          </Button>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-bold text-center mb-10">Everything a tutor needs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="max-w-5xl mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to get organised?</h2>
            <p className="text-muted-foreground mb-6">Set up your workspace in under 2 minutes.</p>
            <Button asChild size="lg">
              <Link to="/dashboard">Open Dashboard →</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TutorDash. Made for tutors who mean business.
      </footer>
    </div>
  );
}
