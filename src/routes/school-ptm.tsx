import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";
import { letterGrade } from "@/lib/format";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/school-ptm")({
  component: SchoolPtmPage,
});

type Student = { id: string; name: string };
type MarksEntry = { obtained: string; total: string };

function SchoolPtmPage() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState("");
  const [assessment, setAssessment] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [marks, setMarks] = useState<Record<string, MarksEntry>>({});

  const { data: classes } = useQuery({
    queryKey: ["school-classes"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id,name,subject,academic_year").order("name");
      return (data ?? []) as { id: string; name: string; subject: string; academic_year: string }[];
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
        .map((r: { students: Student | null }) => r.students)
        .filter(Boolean) as Student[];
    },
  });

  function setMark(studentId: string, field: "obtained" | "total", val: string) {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: val },
    }));
  }

  function pct(studentId: string): number | null {
    const m = marks[studentId];
    const t = Number(totalMarks);
    const o = Number(m?.obtained);
    if (!m?.obtained || !t) return null;
    return Math.round((o / t) * 100);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!classId) throw new Error("Select a class");
      if (!assessment.trim()) throw new Error("Enter assessment name");
      const rows = (students ?? [])
        .filter((s) => marks[s.id]?.obtained)
        .map((s) => ({
          student_id: s.id,
          assessment_name: assessment.trim(),
          marks_obtained: Number(marks[s.id].obtained),
          total_marks: Number(totalMarks),
          date: new Date().toISOString().slice(0, 10),
        }));
      if (rows.length === 0) throw new Error("Enter marks for at least one student");
      const { error } = await supabase.from("grades").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marks saved");
      qc.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  function generatePDF() {
    const cls = classes?.find((c) => c.id === classId);
    if (!cls || !students?.length) return;

    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [255, 79, 0];
    const darkColor: [number, number, number] = [32, 21, 21];

    students.forEach((student, idx) => {
      if (idx > 0) doc.addPage();

      const p = pct(student.id);
      const grade = p !== null ? letterGrade(p) : "N/A";
      const obtained = marks[student.id]?.obtained ?? "—";

      // Header bar
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Progress Report Card", 14, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${cls.name} · ${cls.subject} · ${cls.academic_year}`, 14, 20);

      // Student info block
      doc.setTextColor(...darkColor);
      doc.setFillColor(248, 247, 244);
      doc.rect(0, 28, 210, 30, "F");
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(student.name, 14, 42);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Roll #${idx + 1}`, 14, 52);

      // Grade badge (right side)
      if (p !== null) {
        doc.setFillColor(...primaryColor);
        doc.roundedRect(155, 32, 42, 22, 4, 4, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(grade, 176, 47, { align: "center" });
      }

      // Assessment table
      doc.setTextColor(...darkColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Assessment Results", 14, 72);

      autoTable(doc, {
        startY: 76,
        head: [["Assessment", "Marks Obtained", "Total Marks", "Percentage", "Grade"]],
        body: assessment
          ? [[
              assessment,
              obtained,
              totalMarks,
              p !== null ? `${p}%` : "—",
              grade,
            ]]
          : [["No assessment entered", "—", "—", "—", "—"]],
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 4 },
        alternateRowStyles: { fillColor: [250, 249, 246] },
      });

      // Pakistan grading scale reference
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkColor);
      doc.text("Grading Scale", 14, finalY);
      autoTable(doc, {
        startY: finalY + 4,
        head: [["Grade", "A++", "A+", "A", "B", "C", "D", "E"]],
        body: [["Range", "85-100%", "80-84%", "75-79%", "60-74%", "45-59%", "40-44%", "<40%"]],
        headStyles: { fillColor: darkColor, textColor: 255, fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 3 },
      });

      // Signature line
      const sigY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
      doc.setDrawColor(180, 180, 180);
      doc.line(14, sigY, 80, sigY);
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.setFont("helvetica", "normal");
      doc.text("Teacher Signature", 14, sigY + 5);

      doc.line(130, sigY, 196, sigY);
      doc.text("Principal Signature", 130, sigY + 5);

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`Generated by TutorDash · ${new Date().toLocaleDateString("en-PK")}`, 105, 287, { align: "center" });
    });

    doc.save(`PTM-Reports-${cls.name}-${assessment || "all"}.pdf`);
    toast.success(`Generated ${students.length} report card${students.length > 1 ? "s" : ""}`);
  }

  const cls = classes?.find((c) => c.id === classId);
  const filledCount = (students ?? []).filter((s) => marks[s.id]?.obtained).length;

  return (
    <AppShell>
      <PageHeader
        title="PTM Report Cards"
        description="Enter marks once, generate all report cards instantly."
        actions={
          classId && students && students.length > 0 ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => save.mutate()}
                disabled={save.isPending || !assessment.trim() || filledCount === 0}
              >
                {save.isPending ? "Saving…" : "Save marks"}
              </Button>
              <Button onClick={generatePDF} disabled={!students?.length}>
                <Download className="h-4 w-4 mr-1" />
                Generate {students?.length ?? 0} cards
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Config row */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Class *</Label>
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
              <Label>Assessment name *</Label>
              <Input
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                placeholder="e.g. Mid-Term Exam 2025"
              />
            </div>
            <div>
              <Label>Total marks</Label>
              <Input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marks entry grid */}
      {classId && (!students || students.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No students enrolled in this class.</p>
        </div>
      )}

      {students && students.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-8">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-32">
                      Obtained / {totalMarks}
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-20">%</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-20">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const p = pct(s.id);
                    const grade = p !== null ? letterGrade(p) : "—";
                    const gradeColor = p === null ? "text-muted-foreground"
                      : p >= 75 ? "text-green-600 font-bold"
                      : p >= 45 ? "text-amber-600 font-bold"
                      : "text-red-600 font-bold";
                    return (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium">{s.name}</td>
                        <td className="px-4 py-2.5">
                          <Input
                            type="number"
                            min={0}
                            max={Number(totalMarks)}
                            className="h-8 w-24 text-sm"
                            placeholder="—"
                            value={marks[s.id]?.obtained ?? ""}
                            onChange={(e) => setMark(s.id, "obtained", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-sm">
                          {p !== null ? `${p}%` : "—"}
                        </td>
                        <td className={`px-4 py-2.5 text-sm ${gradeColor}`}>{grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filledCount > 0 && (
              <div className="px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
                {filledCount}/{students.length} students marked ·{" "}
                Class average:{" "}
                {Math.round(
                  (students
                    .filter((s) => marks[s.id]?.obtained)
                    .reduce((sum, s) => sum + (pct(s.id) ?? 0), 0)) /
                    filledCount
                )}%
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
