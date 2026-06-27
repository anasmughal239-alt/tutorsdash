import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, School, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";

export const Route = createFileRoute("/school-classes")({
  component: SchoolClassesPage,
});

type SchoolClass = {
  id: string;
  name: string;
  subject: string;
  academic_year: string;
};

function SchoolClassesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: classes } = useQuery({
    queryKey: ["school-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id,name,subject,academic_year")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SchoolClass[];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["class-student-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("class_students").select("class_id");
      const map: Record<string, number> = {};
      (data ?? []).forEach((r: { class_id: string }) => {
        map[r.class_id] = (map[r.class_id] ?? 0) + 1;
      });
      return map;
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="My Classes"
        description="Manage your school classes and enrolled students."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New class
          </Button>
        }
      />

      {classes?.length === 0 && (
        <div className="text-center py-24 text-muted-foreground">
          <School className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No classes yet. Add your first class to get started.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes?.map((c) => (
          <Link key={c.id} to="/school-classes/$id" params={{ id: c.id }}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.subject}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{c.academic_year}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{counts?.[c.id] ?? 0} students</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <ClassDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ["school-classes"] });
          qc.invalidateQueries({ queryKey: ["class-student-counts"] });
        }}
      />
    </AppShell>
  );
}

function ClassDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("2025-26");

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !subject.trim()) throw new Error("Class name and subject are required");
      const { error } = await supabase.from("classes").insert({
        name: name.trim(),
        subject: subject.trim(),
        academic_year: year.trim() || "2025-26",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Class created");
      onCreated();
      onOpenChange(false);
      setName(""); setSubject(""); setYear("2025-26");
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New class</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Class name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grade 8-A" autoFocus />
          </div>
          <div>
            <Label>Subject *</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
          </div>
          <div>
            <Label>Academic year</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025-26" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Creating…" : "Create class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
