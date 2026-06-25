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
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";
import { fmtDate, letterGrade } from "@/lib/format";

export const Route = createFileRoute("/grades")({
  component: GradesPage,
});

type Grade = {
  id: string;
  assessment_name: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  date: string;
  students: { id: string; name: string } | null;
  modules: { id: string; name: string } | null;
};

function GradesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: grades } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select("id,assessment_name,marks_obtained,total_marks,percentage,date,students(id,name),modules(id,name)")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Grade[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("grades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Grade deleted");
      qc.invalidateQueries({ queryKey: ["grades"] });
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Grades"
        description="Record assessment marks for each student."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Record grade</Button>}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades?.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No grades recorded.</TableCell></TableRow>
              )}
              {grades?.map((g) => {
                const pct = Math.round(Number(g.percentage));
                return (
                  <TableRow key={g.id}>
                    <TableCell>{fmtDate(g.date)}</TableCell>
                    <TableCell className="font-medium">{g.students?.name}</TableCell>
                    <TableCell className="text-muted-foreground">{g.modules?.name ?? "—"}</TableCell>
                    <TableCell>{g.assessment_name}</TableCell>
                    <TableCell>{g.marks_obtained}/{g.total_marks}</TableCell>
                    <TableCell>{pct}%</TableCell>
                    <TableCell><span className="font-semibold">{letterGrade(pct)}</span></TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => del.mutate(g.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GradeDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function GradeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [name, setName] = useState("");
  const [obtained, setObtained] = useState("");
  const [total, setTotal] = useState("100");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: students } = useQuery({
    queryKey: ["students-min"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });
  const { data: modules } = useQuery({
    queryKey: ["modules-min"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!studentId || !name.trim() || !obtained || !total) throw new Error("Fill in student, name, marks");
      const { error } = await supabase.from("grades").insert({
        student_id: studentId,
        module_id: moduleId || null,
        assessment_name: name.trim(),
        marks_obtained: Number(obtained),
        total_marks: Number(total),
        date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Grade recorded");
      qc.invalidateQueries({ queryKey: ["grades"] });
      onOpenChange(false);
      setName(""); setObtained(""); setTotal("100");
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Record grade</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Student *</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Pick a student" /></SelectTrigger>
              <SelectContent>
                {students?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Module</Label>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                {modules?.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assessment name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mock test 1" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Obtained *</Label>
              <Input type="number" value={obtained} onChange={(e) => setObtained(e.target.value)} />
            </div>
            <div>
              <Label>Total *</Label>
              <Input type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
