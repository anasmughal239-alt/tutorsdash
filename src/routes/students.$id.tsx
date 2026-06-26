import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate, fmtDateTime, letterGrade } from "@/lib/format";
import { Mail, MessageSquarePlus, Trash2, ChevronLeft, Share2, FileDown } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/students/$id")({
  component: StudentDetail,
});

type Remark = { id: string; text: string; created_at: string };

function StudentDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [remarkText, setRemarkText] = useState("");

  const { data: student } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,name,email,phone,share_token,student_modules(modules(id,name))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as {
        id: string; name: string; email: string | null; phone: string | null; share_token: string | null;
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
      return (data ?? []) as { id: string; lesson_date: string; topic: string | null; modules: { name: string } | null }[];
    },
  });

  const { data: attendance } = useQuery({
    queryKey: ["student-attendance", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("attendance").select("status").eq("student_id", id);
      return (data ?? []) as { status: string }[];
    },
  });

  const { data: grades } = useQuery({
    queryKey: ["student-grades", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("grades")
        .select("id,assessment_name,marks_obtained,total_marks,percentage,date,modules(name)")
        .eq("student_id", id).order("date", { ascending: false });
      return (data ?? []) as {
        id: string; assessment_name: string; marks_obtained: number;
        total_marks: number; percentage: number; date: string; modules: { name: string } | null;
      }[];
    },
  });

  const { data: remarks } = useQuery({
    queryKey: ["student-remarks", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("remarks").select("id,text,created_at")
        .eq("student_id", id).order("created_at", { ascending: false });
      return (data ?? []) as Remark[];
    },
  });

  const addRemark = useMutation({
    mutationFn: async () => {
      if (!remarkText.trim()) return;
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("remarks").insert({ student_id: id, text: remarkText.trim(), tutor_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Remark added");
      setRemarkText("");
      qc.invalidateQueries({ queryKey: ["student-remarks", id] });
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  const deleteRemark = useMutation({
    mutationFn: async (rid: string) => {
      const { error } = await supabase.from("remarks").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Remark deleted");
      qc.invalidateQueries({ queryKey: ["student-remarks", id] });
    },
  });

  const sendInvite = async () => {
    if (!student?.email) return toast.error("Student has no email");
    const { error } = await supabase.auth.signInWithOtp({
      email: student.email,
      options: { emailRedirectTo: `${window.location.origin}/portal` },
    });
    if (error) toast.error(error.message);
    else toast.success(`Portal invite sent to ${student.email}`);
  };

  const shareWhatsApp = () => {
    if (!student?.share_token) return toast.error("No portal link available");
    const url = `${window.location.origin}/student-portal/${student.share_token}`;
    const msg = `Hi ${student.name}! Your tutor shared your TutorDash progress portal with you. View your results, lessons, and materials here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const downloadReport = () => {
    if (!student) return;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(32, 21, 21);
    doc.rect(0, 0, pageW, 30, "F");
    doc.setTextColor(255, 254, 251);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TutorDash", 14, 13);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Student Progress Report", 14, 21);
    doc.text(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), pageW - 14, 21, { align: "right" });

    doc.setTextColor(32, 21, 21);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(student.name, 14, 44);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    if (student.email) doc.text(student.email, 14, 51);

    let y = 62;

    // Stats summary
    doc.setTextColor(32, 21, 21);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, y); y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Attendance: ${attPct}%  (${attPresent}/${attTotal} sessions)`, 14, y); y += 6;
    doc.text(`Average Grade: ${avgGrade}%  (${letterGrade(avgGrade)})`, 14, y); y += 6;
    const moduleNames = student.student_modules.map((sm) => sm.modules?.name).filter(Boolean).join(", ");
    if (moduleNames) { doc.text(`Modules: ${moduleNames}`, 14, y); y += 6; }
    y += 6;

    // Grades table
    if (grades?.length) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Grades", 14, y); y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Assessment", "Module", "Score", "%", "Grade", "Date"]],
        body: grades.map((g) => [
          g.assessment_name,
          g.modules?.name ?? "",
          `${g.marks_obtained}/${g.total_marks}`,
          `${Math.round(Number(g.percentage))}%`,
          letterGrade(Math.round(Number(g.percentage))),
          fmtDate(g.date),
        ]),
        headStyles: { fillColor: [255, 79, 0], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [252, 248, 242] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    }

    // Recent lessons
    if (lessons?.length) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(32, 21, 21);
      doc.text("Recent Lessons", 14, y); y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Topic", "Module", "Date"]],
        body: lessons.map((l) => [l.topic ?? "Lesson", l.modules?.name ?? "", fmtDateTime(l.lesson_date)]),
        headStyles: { fillColor: [32, 21, 21], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [252, 248, 242] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
    }

    doc.save(`${student.name.replace(/\s+/g, "_")}_progress_report.pdf`);
    toast.success("Report downloaded");
  };

  if (!student) return (
    <AppShell><PageHeader title="Student" /><p className="text-muted-foreground">Loading…</p></AppShell>
  );

  const attTotal   = attendance?.length ?? 0;
  const attPresent = attendance?.filter((a) => a.status === "present").length ?? 0;
  const attPct     = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;
  const avgGrade   = grades?.length
    ? Math.round(grades.reduce((s, g) => s + Number(g.percentage), 0) / grades.length) : 0;

  return (
    <AppShell>
      <Link
        to="/students"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> All students
      </Link>
      <PageHeader
        title={student.name}
        eyebrow="Student"
        description={[student.email, student.phone].filter(Boolean).join(" · ")}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={downloadReport}>
              <FileDown className="h-4 w-4 mr-1.5" /> Download report
            </Button>
            {student.share_token && (
              <Button variant="outline" onClick={shareWhatsApp}>
                <Share2 className="h-4 w-4 mr-1.5" /> WhatsApp
              </Button>
            )}
            {student.email && (
              <Button variant="outline" onClick={sendInvite}>
                <Mail className="h-4 w-4 mr-1.5" /> Send portal invite
              </Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Attendance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attPct}%</div>
            <div className="text-xs text-muted-foreground mt-1">{attPresent} of {attTotal} sessions</div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${attPct}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Average grade</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgGrade}% <span className="text-base text-muted-foreground">({letterGrade(avgGrade)})</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${avgGrade}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Modules</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1.5 pt-1">
            {student.student_modules.map((sm) =>
              sm.modules ? <Badge key={sm.modules.id} variant="secondary">{sm.modules.name}</Badge> : null,
            )}
            {student.student_modules.length === 0 && <span className="text-xs text-muted-foreground">None assigned</span>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Lessons */}
        <Card>
          <CardHeader><CardTitle>Recent lessons</CardTitle></CardHeader>
          <CardContent>
            {!lessons?.length && <p className="text-sm text-muted-foreground">No lessons scheduled.</p>}
            <ul className="space-y-2">
              {lessons?.map((l) => (
                <li key={l.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span className="font-medium">{l.topic || "Lesson"}
                    <span className="font-normal text-muted-foreground"> · {l.modules?.name}</span>
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">{fmtDateTime(l.lesson_date)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Grades */}
        <Card>
          <CardHeader><CardTitle>Grades</CardTitle></CardHeader>
          <CardContent>
            {!grades?.length && <p className="text-sm text-muted-foreground">No grades recorded.</p>}
            <ul className="space-y-3">
              {grades?.map((g) => {
                const pct = Math.round(Number(g.percentage));
                return (
                  <li key={g.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{g.assessment_name}
                        <span className="font-normal text-muted-foreground"> · {g.modules?.name}</span>
                      </span>
                      <span className="font-semibold">{g.marks_obtained}/{g.total_marks}
                        <span className="text-muted-foreground font-normal ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 70 ? "#16a34a" : pct >= 50 ? "#ff4f00" : "#dc2626",
                        }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{fmtDate(g.date)}</div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Remarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-primary" />
            Teacher Remarks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add remark */}
          <div className="flex flex-col gap-2">
            <textarea
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Write a remark about this student's progress, behaviour, or specific feedback…"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => addRemark.mutate()}
                disabled={!remarkText.trim() || addRemark.isPending}
              >
                {addRemark.isPending ? "Saving…" : "Add remark"}
              </Button>
            </div>
          </div>

          {/* Remarks list */}
          {!remarks?.length && (
            <p className="text-sm text-muted-foreground py-2">No remarks yet. Add one above.</p>
          )}
          <ul className="space-y-3">
            {remarks?.map((r) => (
              <li key={r.id} className="flex gap-3 items-start border-b pb-3 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{r.text}</p>
                  <span className="text-xs text-muted-foreground mt-0.5 block">{fmtDate(r.created_at)}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-7 w-7"
                  onClick={() => deleteRemark.mutate(r.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

    </AppShell>
  );
}
