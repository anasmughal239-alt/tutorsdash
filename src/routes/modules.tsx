import { createFileRoute, Link, Outlet, useChildMatches } from "@tanstack/react-router";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/modules")({
  component: ModulesRoute,
});

type Module = {
  id: string;
  name: string;
  description: string | null;
  subject_area: string | null;
  student_modules: { id: string }[];
};

function ModulesRoute() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <ModulesPage />;
}

function ModulesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);

  const { data: modules } = useQuery({
    queryKey: ["modules-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("id,name,description,subject_area,student_modules(id)")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Module[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Module deleted");
      qc.invalidateQueries({ queryKey: ["modules-list"] });
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <AppShell>
      <PageHeader
        title="Modules"
        description="Group your students into batches or courses."
        actions={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Create module
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules?.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-10">
            No modules yet. Create one to start organizing students.
          </p>
        )}
        {modules?.map((m) => (
          <Card key={m.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{m.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete module?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Removes the module and unassigns all its students. Lessons and grades remain but lose their module link.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => del.mutate(m.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {m.subject_area && (
                <p className="text-xs text-primary font-medium mb-2">{m.subject_area}</p>
              )}
              {m.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{m.description}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> {m.student_modules.length} students
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link to="/modules/$id" params={{ id: m.id }}>Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ModuleDialog open={open} onOpenChange={setOpen} module={editing} />
    </AppShell>
  );
}

function ModuleDialog({
  open,
  onOpenChange,
  module: mod,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  module: Module | null;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subjectArea, setSubjectArea] = useState("");

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Name is required");
      if (mod) {
        const { error } = await supabase
          .from("modules")
          .update({ name: name.trim(), description: description || null, subject_area: subjectArea || null })
          .eq("id", mod.id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("modules")
          .insert({ name: name.trim(), description: description || null, subject_area: subjectArea || null, tutor_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(mod ? "Module updated" : "Module created");
      qc.invalidateQueries({ queryKey: ["modules-list"] });
      qc.invalidateQueries({ queryKey: ["modules"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setName(mod?.name ?? "");
          setDescription(mod?.description ?? "");
          setSubjectArea(mod?.subject_area ?? "");
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader><DialogTitle>{mod ? "Edit module" : "Create module"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="m-name">Name *</Label>
            <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. IELTS Speaking Advanced" />
          </div>
          <div>
            <Label htmlFor="m-subj">Subject area</Label>
            <Input id="m-subj" value={subjectArea} onChange={(e) => setSubjectArea(e.target.value)} placeholder="e.g. IELTS" />
          </div>
          <div>
            <Label htmlFor="m-desc">Description</Label>
            <Textarea id="m-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
