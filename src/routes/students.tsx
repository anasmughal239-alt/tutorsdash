import { createFileRoute, Link, Outlet, useChildMatches } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Pencil, Trash2, Plus, Search, Mail, Users, X, Sheet, GraduationCap, MessageSquare } from "lucide-react";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/students")({
  component: StudentsRoute,
});

function StudentsRoute() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <StudentsPage />;
}

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
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkWaOpen, setBulkWaOpen] = useState(false);
  const [quickGradeStudent, setQuickGradeStudent] = useState<Student | null>(null);
  const [quickGradeOpen, setQuickGradeOpen] = useState(false);

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

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const selectedStudents = (students ?? []).filter((s) => selected.has(s.id));

  return (
    <AppShell>
      <PageHeader
        title="Students"
        description="Manage your students and their module assignments."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Sheet className="h-4 w-4 mr-1" /> Bulk import
            </Button>
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add student
            </Button>
          </div>
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
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
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
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${[20, 60, 80, 50, 70, 40][j]}%` }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* Empty state */}
            {students !== undefined && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
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
              <TableRow key={s.id} className={selected.has(s.id) ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={() => toggleOne(s.id)}
                    aria-label={`Select ${s.name}`}
                  />
                </TableCell>
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
                    title="Quick grade entry"
                    onClick={() => {
                      setQuickGradeStudent(s);
                      setQuickGradeOpen(true);
                    }}
                  >
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </Button>
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

      {/* Floating action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-border bg-card shadow-lg px-5 py-3">
          <span className="text-sm font-medium text-foreground">
            {selected.size} student{selected.size !== 1 ? "s" : ""} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBulkWaOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-1.5" /> WhatsApp message
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        </div>
      )}

      <StudentDialog open={open} onOpenChange={setOpen} student={editing} />
      <BulkImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <BulkWhatsAppDialog
        open={bulkWaOpen}
        onOpenChange={setBulkWaOpen}
        students={selectedStudents}
      />
      <QuickGradeDialog
        open={quickGradeOpen}
        onOpenChange={setQuickGradeOpen}
        student={quickGradeStudent}
      />
    </AppShell>
  );
}

/* ── BulkWhatsAppDialog ── */
function BulkWhatsAppDialog({
  open,
  onOpenChange,
  students,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  students: Student[];
}) {
  const [message, setMessage] = useState("Hello! Just checking in regarding your lessons. Please let me know if you have any questions.");
  const withPhone = students.filter((s) => s.phone);
  const withoutPhone = students.filter((s) => !s.phone);

  function sendAll() {
    for (const s of withPhone) {
      const phone = s.phone!.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    }
    if (withPhone.length > 0) toast.success(`Opened WhatsApp for ${withPhone.length} student${withPhone.length !== 1 ? "s" : ""}`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>WhatsApp bulk message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Selected students</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {students.map((s) => (
                <Badge key={s.id} variant={s.phone ? "secondary" : "outline"} className={!s.phone ? "opacity-50" : ""}>
                  {s.name}{!s.phone && " (no phone)"}
                </Badge>
              ))}
            </div>
          </div>
          {withoutPhone.length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {withoutPhone.length} student{withoutPhone.length !== 1 ? "s" : ""} without a phone number will be skipped.
            </p>
          )}
          <div>
            <Label htmlFor="wa-message">Message</Label>
            <Textarea
              id="wa-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={sendAll} disabled={withPhone.length === 0}>
            Send to {withPhone.length} student{withPhone.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── QuickGradeDialog ── */
function QuickGradeDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: Student | null;
}) {
  const qc = useQueryClient();
  const [assessment, setAssessment] = useState("");
  const [obtained, setObtained] = useState("");
  const [total, setTotal] = useState("100");
  const [moduleId, setModuleId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: modules } = useQuery({
    queryKey: ["modules-min"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!student) throw new Error("No student");
      if (!assessment.trim()) throw new Error("Assessment name is required");
      if (!obtained || !total) throw new Error("Marks are required");
      const { data: { user } } = await supabase.auth.getUser();
      const pct = (parseFloat(obtained) / parseFloat(total)) * 100;
      const { error } = await supabase.from("grades").insert({
        student_id: student.id,
        assessment_name: assessment.trim(),
        marks_obtained: parseFloat(obtained),
        total_marks: parseFloat(total),
        percentage: pct,
        date,
        module_id: moduleId || null,
        tutor_id: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Grade saved");
      qc.invalidateQueries({ queryKey: ["grades"] });
      if (student) qc.invalidateQueries({ queryKey: ["student-grades", student.id] });
      onOpenChange(false);
      setAssessment(""); setObtained(""); setTotal("100"); setModuleId("");
      setDate(new Date().toISOString().slice(0, 10));
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) { setAssessment(""); setObtained(""); setTotal("100"); setModuleId(""); setDate(new Date().toISOString().slice(0, 10)); }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick grade entry</DialogTitle>
        </DialogHeader>
        {student && (
          <p className="text-sm font-medium text-foreground -mt-1">
            Student: <span className="text-primary">{student.name}</span>
          </p>
        )}
        <div className="space-y-4">
          <div>
            <Label htmlFor="qg-assessment">Assessment name *</Label>
            <Input
              id="qg-assessment"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="e.g. Mock Test 1"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qg-obtained">Marks obtained *</Label>
              <Input
                id="qg-obtained"
                type="number"
                min="0"
                value={obtained}
                onChange={(e) => setObtained(e.target.value)}
                placeholder="e.g. 78"
              />
            </div>
            <div>
              <Label htmlFor="qg-total">Total marks</Label>
              <Input
                id="qg-total"
                type="number"
                min="1"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Module (optional)</Label>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger><SelectValue placeholder="Select a module" /></SelectTrigger>
              <SelectContent>
                {modules?.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="qg-date">Date</Label>
            <Input
              id="qg-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {obtained && total && (
            <p className="text-xs text-muted-foreground">
              Percentage: {Math.round((parseFloat(obtained) / parseFloat(total)) * 100)}%
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

type GridRow = { name: string; email: string; phone: string };
const emptyRow = (): GridRow => ({ name: "", email: "", phone: "" });

function BulkImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [rows, setRows] = useState<GridRow[]>(() => Array.from({ length: 8 }, emptyRow));
  const [saving, setSaving] = useState(false);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());

  const update = (i: number, field: keyof GridRow, value: string) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    setErrorRows((prev) => { const s = new Set(prev); s.delete(i); return s; });
  };

  const addRows = () => setRows((prev) => [...prev, ...Array.from({ length: 5 }, emptyRow)]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const filledRows = rows.filter((r) => r.name.trim());

  const save = async () => {
    // highlight rows that have email/phone but no name
    const bad = new Set<number>();
    rows.forEach((r, i) => { if ((r.email || r.phone) && !r.name.trim()) bad.add(i); });
    if (bad.size) { setErrorRows(bad); toast.error("Fill in the name for highlighted rows"); return; }
    if (!filledRows.length) { toast.error("Enter at least one student name"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const toInsert = filledRows.map((r) => ({
        name: r.name.trim(),
        email: r.email.trim() || null,
        phone: r.phone.trim() || null,
        tutor_id: user!.id,
      }));
      const { error } = await supabase.from("students").insert(toInsert);
      if (error) throw error;
      toast.success(`${filledRows.length} student${filledRows.length > 1 ? "s" : ""} added`);
      qc.invalidateQueries({ queryKey: ["students"] });
      onOpenChange(false);
      setRows(Array.from({ length: 8 }, emptyRow));
      setErrorRows(new Set());
    } catch (e) {
      toast.error(humanizeError(e as Error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving) { onOpenChange(v); if (!v) { setRows(Array.from({ length: 8 }, emptyRow)); setErrorRows(new Set()); } } }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add students in bulk</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-1">
          Fill in the rows below — only Name is required. Leave empty rows blank.
        </p>

        {/* Spreadsheet grid */}
        <div className="border rounded-lg overflow-hidden text-sm">
          {/* Column headers */}
          <div className="grid bg-muted/60 border-b" style={{ gridTemplateColumns: "36px 1fr 1fr 1fr 32px" }}>
            <div />
            {["Name *", "Email", "Phone"].map((h) => (
              <div key={h} className="px-3 py-2 font-semibold text-xs text-muted-foreground border-l">{h}</div>
            ))}
            <div />
          </div>

          {/* Rows */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`grid items-stretch ${errorRows.has(i) ? "bg-destructive/5" : "hover:bg-muted/20"}`}
                style={{ gridTemplateColumns: "36px 1fr 1fr 1fr 32px" }}
              >
                <div className="flex items-center justify-center text-xs text-muted-foreground select-none border-r">{i + 1}</div>
                <input
                  value={row.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                  placeholder="Full name"
                  className={`px-3 py-2 bg-transparent focus:outline-none focus:bg-primary/5 w-full border-l ${errorRows.has(i) ? "text-destructive placeholder:text-destructive/50" : ""}`}
                />
                <input
                  value={row.email}
                  onChange={(e) => update(i, "email", e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                  className="px-3 py-2 bg-transparent focus:outline-none focus:bg-primary/5 w-full border-l"
                />
                <input
                  value={row.phone}
                  onChange={(e) => update(i, "phone", e.target.value)}
                  placeholder="+92 300 0000000"
                  className="px-3 py-2 bg-transparent focus:outline-none focus:bg-primary/5 w-full border-l"
                />
                <button
                  onClick={() => removeRow(i)}
                  className="flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors border-l"
                  tabIndex={-1}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add more rows */}
          <button
            onClick={addRows}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 flex items-center justify-center gap-1.5 border-t transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add 5 more rows
          </button>
        </div>

        <DialogFooter className="items-center">
          <span className="text-xs text-muted-foreground mr-auto">
            {filledRows.length} student{filledRows.length !== 1 ? "s" : ""} ready to save
          </span>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || filledRows.length === 0}>
            {saving ? "Saving…" : `Save ${filledRows.length || ""} student${filledRows.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
