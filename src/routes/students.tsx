import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus, Search, Mail, Users } from "lucide-react";
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

export const Route = createFileRoute("/students")({
  component: StudentsPage,
});

type Student = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  student_modules: { module_id: string; modules: { id: string; name: string } | null }[];
};

function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id,name,email,phone,student_modules(module_id,modules(id,name))")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Student[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student deleted");
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  const filtered = (students ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell>
      <PageHeader
        title="Students"
        description="Manage your students and their module assignments."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add student
          </Button>
        }
      />

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Skeleton rows while loading */}
            {students === undefined && Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${[60, 80, 50, 70, 40][j]}%` }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* Empty state */}
            {students !== undefined && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {search ? "No students match your search" : "No students yet"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {search ? "Try a different name or email." : "Add your first student to get started."}
                      </p>
                    </div>
                    {!search && (
                      <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add student
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Link to="/students/$id" params={{ id: s.id }} className="font-medium hover:underline">
                    {s.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{s.email || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{s.phone || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {s.student_modules.map((sm) =>
                      sm.modules ? (
                        <Badge key={sm.module_id} variant="secondary">
                          {sm.modules.name}
                        </Badge>
                      ) : null,
                    )}
                    {s.student_modules.length === 0 && (
                      <span className="text-xs text-muted-foreground">No modules</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {s.email && (
                    <Button
                      size="icon"
                      variant="ghost"
                      title={`Send portal invite to ${s.email}`}
                      onClick={async () => {
                        const { error } = await supabase.auth.signInWithOtp({
                          email: s.email!,
                          options: { emailRedirectTo: `${window.location.origin}/portal` },
                        });
                        if (error) toast.error(error.message);
                        else toast.success(`Invite sent to ${s.email}`);
                      }}
                    >
                      <Mail className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(s);
                      setOpen(true);
                    }}
                  >
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
                        <AlertDialogTitle>Delete student?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {s.name} and all related data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => del.mutate(s.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <StudentDialog open={open} onOpenChange={setOpen} student={editing} />
    </AppShell>
  );
}

function StudentDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: Student | null;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(student?.name ?? "");
  const [email, setEmail] = useState(student?.email ?? "");
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [selectedModules, setSelectedModules] = useState<string[]>(
    student?.student_modules.map((sm) => sm.module_id) ?? [],
  );

  // Reset when dialog opens
  useState(() => {
    setName(student?.name ?? "");
    setEmail(student?.email ?? "");
    setPhone(student?.phone ?? "");
    setSelectedModules(student?.student_modules.map((sm) => sm.module_id) ?? []);
  });

  const { data: modules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Name is required");
      let studentId = student?.id;
      if (studentId) {
        const { error } = await supabase
          .from("students")
          .update({ name: name.trim(), email: email || null, phone: phone || null })
          .eq("id", studentId);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("students")
          .insert({ name: name.trim(), email: email || null, phone: phone || null, tutor_id: user?.id })
          .select("id")
          .single();
        if (error) throw error;
        studentId = data!.id as string;
      }
      // sync modules
      await supabase.from("student_modules").delete().eq("student_id", studentId);
      if (selectedModules.length) {
        const rows = selectedModules.map((module_id) => ({ student_id: studentId!, module_id }));
        const { error: e2 } = await supabase.from("student_modules").insert(rows);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast.success(student ? "Student updated" : "Student added");
      qc.invalidateQueries({ queryKey: ["students"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  const nameError = name.length > 0 && !name.trim() ? "Name can't be blank." : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setName(student?.name ?? "");
          setEmail(student?.email ?? "");
          setPhone(student?.phone ?? "");
          setSelectedModules(student?.student_modules.map((sm) => sm.module_id) ?? []);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student ? "Edit student" : "Add student"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Modules</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {(!modules || modules.length === 0) && (
                <p className="text-xs text-muted-foreground">No modules. Create one first.</p>
              )}
              {modules?.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={selectedModules.includes(m.id)}
                    onCheckedChange={(c) =>
                      setSelectedModules((prev) =>
                        c ? [...prev, m.id] : prev.filter((id) => id !== m.id),
                      )
                    }
                  />
                  {m.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
