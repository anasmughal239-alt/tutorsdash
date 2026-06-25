import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";
import { fmtDateTime } from "@/lib/format";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/lessons")({
  component: LessonsPage,
});

type Lesson = {
  id: string;
  lesson_date: string;
  topic: string | null;
  notes: string | null;
  student_id: string | null;
  module_id: string | null;
  students: { id: string; name: string } | null;
  modules: { id: string; name: string } | null;
};

function LessonsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

  const { data: lessons } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id,lesson_date,topic,notes,student_id,module_id,students(id,name),modules(id,name)")
        .order("lesson_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lesson[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Lesson deleted");
      qc.invalidateQueries({ queryKey: ["lessons"] });
    },
  });

  const now = new Date();
  const upcoming = lessons?.filter((l) => new Date(l.lesson_date) >= now) ?? [];
  const past = lessons?.filter((l) => new Date(l.lesson_date) < now) ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Lessons"
        description="Schedule and review your lessons."
        actions={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Schedule lesson
          </Button>
        }
      />

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Upcoming</h2>
      <Card className="mb-6">
        <CardContent className="p-0">
          <LessonTable lessons={upcoming} onEdit={(l) => { setEditing(l); setOpen(true); }} onDelete={(id) => del.mutate(id)} />
        </CardContent>
      </Card>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Past</h2>
      <Card>
        <CardContent className="p-0">
          <LessonTable lessons={past} onEdit={(l) => { setEditing(l); setOpen(true); }} onDelete={(id) => del.mutate(id)} />
        </CardContent>
      </Card>

      <LessonDialog open={open} onOpenChange={setOpen} lesson={editing} />
    </AppShell>
  );
}

function LessonTable({
  lessons, onEdit, onDelete,
}: {
  lessons: Lesson[];
  onEdit: (l: Lesson) => void;
  onDelete: (id: string) => void;
}) {
  if (lessons.length === 0) return <p className="text-sm text-muted-foreground p-6 text-center">No lessons.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date & time</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessons.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="font-medium">{fmtDateTime(l.lesson_date)}</TableCell>
            <TableCell>{l.students?.name ?? "—"}</TableCell>
            <TableCell>{l.modules?.name ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{l.topic ?? "—"}</TableCell>
            <TableCell className="text-right">
              <Button size="icon" variant="ghost" onClick={() => onEdit(l)}><Pencil className="h-4 w-4" /></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                    <AlertDialogDescription>This also removes its attendance records.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(l.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function LessonDialog({
  open, onOpenChange, lesson,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lesson: Lesson | null;
}) {
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

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
      if (!studentId) throw new Error("Pick a student");
      if (!date || !time) throw new Error("Pick a date and time");
      const lesson_date = new Date(`${date}T${time}`).toISOString();
      const payload = {
        student_id: studentId,
        module_id: moduleId || null,
        lesson_date,
        topic: topic || null,
        notes: notes || null,
      };
      if (lesson) {
        const { error } = await supabase.from("lessons").update(payload).eq("id", lesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lessons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(lesson ? "Lesson updated" : "Lesson scheduled");
      qc.invalidateQueries({ queryKey: ["lessons"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setStudentId(lesson?.student_id ?? "");
          setModuleId(lesson?.module_id ?? "");
          if (lesson) {
            const d = new Date(lesson.lesson_date);
            setDate(d.toISOString().slice(0, 10));
            setTime(d.toTimeString().slice(0, 5));
          } else {
            setDate(new Date().toISOString().slice(0, 10));
            setTime("10:00");
          }
          setTopic(lesson?.topic ?? "");
          setNotes(lesson?.notes ?? "");
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader><DialogTitle>{lesson ? "Edit lesson" : "Schedule lesson"}</DialogTitle></DialogHeader>
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
              <SelectTrigger><SelectValue placeholder="Pick a module" /></SelectTrigger>
              <SelectContent>
                {modules?.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Speaking practice" />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
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
