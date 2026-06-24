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
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { fmtBytes, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/materials")({
  component: MaterialsPage,
});

type Material = {
  id: string;
  module_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  topic: string | null;
  uploaded_at: string;
  modules: { name: string } | null;
};

function MaterialsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: materials } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("id,module_id,file_name,file_path,file_type,file_size,topic,uploaded_at,modules(name)")
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Material[];
    },
  });

  const del = useMutation({
    mutationFn: async (m: Material) => {
      await supabase.storage.from("materials").remove([m.file_path]);
      const { error } = await supabase.from("materials").delete().eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Material deleted");
      qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });

  const download = async (m: Material) => {
    const { data, error } = await supabase.storage.from("materials").createSignedUrl(m.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  const filtered = (materials ?? []).filter((m) =>
    !search ||
    m.file_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.topic ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  // group by module then topic
  const grouped = filtered.reduce<Record<string, Record<string, Material[]>>>((acc, m) => {
    const mod = m.modules?.name ?? "Unassigned";
    const topic = m.topic ?? "Untitled";
    (acc[mod] ??= {})[topic] ??= [];
    acc[mod][topic].push(m);
    return acc;
  }, {});

  return (
    <AppShell>
      <PageHeader
        title="Materials"
        description="Upload and organize files by module and topic."
        actions={<Button onClick={() => setOpen(true)}><Upload className="h-4 w-4 mr-1" /> Upload</Button>}
      />

      <Input
        placeholder="Search files or topics…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm mb-6"
      />

      {Object.keys(grouped).length === 0 && (
        <p className="text-muted-foreground text-center py-10">No materials uploaded yet.</p>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([mod, topics]) => (
          <div key={mod}>
            <h2 className="font-semibold text-lg mb-3">{mod}</h2>
            <div className="space-y-3">
              {Object.entries(topics).map(([topic, items]) => (
                <Card key={topic}>
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">{topic}</Badge>
                      <span className="text-xs text-muted-foreground">{items.length} files</span>
                    </div>
                    <ul className="space-y-2">
                      {items.map((m) => (
                        <li key={m.id} className="flex items-center justify-between gap-3 border-b pb-2 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{m.file_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {fmtBytes(m.file_size)} · {fmtDate(m.uploaded_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => download(m)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => del.mutate(m)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <UploadDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function UploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [moduleId, setModuleId] = useState("");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: modules } = useQuery({
    queryKey: ["modules-min"],
    queryFn: async () => {
      const { data } = await supabase.from("modules").select("id,name").order("name");
      return (data ?? []) as { id: string; name: string }[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!moduleId) throw new Error("Pick a module");
      if (!file) throw new Error("Pick a file");
      const path = `modules/${moduleId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("materials").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("materials").insert({
        module_id: moduleId,
        file_name: file.name,
        file_path: path,
        file_type: file.type,
        file_size: file.size,
        topic: topic || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("File uploaded");
      qc.invalidateQueries({ queryKey: ["materials"] });
      onOpenChange(false);
      setFile(null); setTopic("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Upload material</DialogTitle></DialogHeader>
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
            <Label>Topic / chapter</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Lesson 1: Phonetics" />
          </div>
          <div>
            <Label>File *</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Uploading…" : "Upload"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
