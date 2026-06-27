import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";

export const Route = createFileRoute("/school-classes/$id")({
  component: ClassDetailPage,
});

function avatarColor(name: string) {
  const colors = ["#ff4f00", "#16a34a", "#2563eb", "#9333ea", "#db2777", "#0891b2", "#d97706"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function ClassDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const { data: cls } = useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*").eq("id", id).single();
      return data as { id: string; name: string; subject: string; academic_year: string };
    },
  });

  const { data: enrolled } = useQuery({
    queryKey: ["class-students", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("class_students")
        .select("id,students(id,name,email)")
        .eq("class_id", id);
      return (data ?? []).map((r: { id: string; students: { id: string; name: string; email: string | null } | null }) => ({
        rowId: r.id,
        ...r.students!,
      }));
    },
  });

  const remove = useMutation({
    mutationFn: async (rowId: string) => {
      const { error } = await supabase.from("class_students").delete().eq("id", rowId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student removed");
      qc.invalidateQueries({ queryKey: ["class-students", id] });
      qc.invalidateQueries({ queryKey: ["class-student-counts"] });
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <AppShell>
      <div className="mb-6">
        <Link to="/school-classes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to classes
        </Link>
        <PageHeader
          title={cls?.name ?? "…"}
          description={cls ? `${cls.subject} · ${cls.academic_year}` : ""}
          actions={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add students
            </Button>
          }
        />
      </div>

      {enrolled?.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No students enrolled yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setAddOpen(true)}>
            Add first student
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {enrolled?.map((s) => (
          <Card key={s.rowId} className="group">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold"
                style={{ background: avatarColor(s.name) }}
              >
                {initials(s.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{s.name}</p>
                {s.email && <p className="text-xs text-muted-foreground truncate">{s.email}</p>}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => remove.mutate(s.rowId)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {cls && (
        <AddStudentsDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          classId={id}
          className={cls.name}
          enrolledIds={(enrolled ?? []).map((s) => s.id)}
          onAdded={() => {
            qc.invalidateQueries({ queryKey: ["class-students", id] });
            qc.invalidateQueries({ queryKey: ["class-student-counts"] });
          }}
        />
      )}
    </AppShell>
  );
}

function AddStudentsDialog({
  open,
  onOpenChange,
  classId,
  className,
  enrolledIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classId: string;
  className: string;
  enrolledIds: string[];
  onAdded: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: allStudents } = useQuery({
    queryKey: ["students-min"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("id,name,email").order("name");
      return (data ?? []) as { id: string; name: string; email: string | null }[];
    },
  });

  const available = allStudents?.filter((s) => !enrolledIds.includes(s.id)) ?? [];

  const add = useMutation({
    mutationFn: async () => {
      if (selected.size === 0) throw new Error("Select at least one student");
      const rows = Array.from(selected).map((student_id) => ({ class_id: classId, student_id }));
      const { error } = await supabase.from("class_students").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${selected.size} student${selected.size > 1 ? "s" : ""} added to ${className}`);
      onAdded();
      onOpenChange(false);
      setSelected(new Set());
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSelected(new Set()); }}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add students to {className}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-1 py-2">
          {available.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              All your students are already enrolled, or you have no students yet.
            </p>
          )}
          {available.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                selected.has(s.id) ? "bg-primary/10 border border-primary/30" : "hover:bg-muted border border-transparent"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                style={{ background: avatarColor(s.name) }}>
                {initials(s.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.name}</p>
                {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
              </div>
              {selected.has(s.id) && (
                <Badge variant="secondary" className="text-primary shrink-0">Selected</Badge>
              )}
            </button>
          ))}
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => add.mutate()} disabled={add.isPending || selected.size === 0}>
            {add.isPending ? "Adding…" : `Add ${selected.size > 0 ? selected.size : ""} student${selected.size !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
