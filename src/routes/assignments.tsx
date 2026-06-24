import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/assignments")({
  component: AssignmentsPage,
});

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  module_id: string;
  modules: { name: string } | null;
  student_assignments: { id: string; student_id: string; status: string; students: { name: string } | null }[];
};

function AssignmentsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: assignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("id,title,description,due_date,module_id,modules(name),student_assignments(id,student_id,status,students(name))")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Assignment[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("student_assignments")
        .update({ status, submitted_at: status !== "pending" ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assignment deleted");
      qc.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Assignments"
        description="Create assignments per module and track each student's status."
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create assignment</Button>}
      />

      <div className="space-y-4">
        {assignments?.length === 0 && (
          <p className="text-muted-foreground text-center py-10">No assignments yet.</p>
        )}
        {assignments?.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <div className="text-xs text-muted-foreground mt-1">
                    {a.modules?.name} {a.due_date && <>· Due {fmtDate(a.due_date)}</>}
                  </div>
                  {a.description && <p className="text-sm mt-2">{a.description}</p>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => del.mutate(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {a.student_assignments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No students assigned (no students in this module yet).</p>
              ) : (
                <ul className="space-y-2">
                  {a.student_assignments.map((sa) => (
                    <li key={sa.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <span className="text-sm font-medium">{sa.students?.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={sa.status === "completed" ? "default" : sa.status === "submitted" ? "secondary" : "outline"}>
                          {sa.status}
                        </Badge>
                        <Select value={sa.status} onValueChange={(v) => updateStatus.mutate({ id: sa.id, status: v })}>
                          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AssignmentDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function AssignmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: modules } = useQuery({
    queryKey: ["modules-min"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!moduleId || !title.trim()) throw new Error("Pick a module and enter a title");
      const { data: ass, error } = await supabase
        .from("assignments")
        .insert({ module_id: moduleId, title: title.trim(), description: description || null, due_date: dueDate || null })
        .select("id")
        .single();
      if (error) throw error;
      // auto-assign to all students in module
      const { data: studentRows } = await supabase
        .from("student_modules")
        .select("student_id")
        .eq("module_id", moduleId);
      if (studentRows && studentRows.length > 0) {
        const rows = studentRows.map((r) => ({
          assignment_id: ass!.id as string,
          student_id: (r as { student_id: string }).student_id,
          status: "pending" as const,
        }));
        await supabase.from("student_assignments").insert(rows);
      }
    },
    onSuccess: () => {
      toast.success("Assignment created");
      qc.invalidateQueries({ queryKey: ["assignments"] });
      onOpenChange(false);
      setTitle(""); setDescription(""); setDueDate("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create assignment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Module *</Label>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger><SelectValue placeholder="Pick a module" /></SelectTrigger>
              <SelectContent>
                {modules?.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
