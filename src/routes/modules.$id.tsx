import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/modules/$id")({
  component: ModuleDetail,
});

function ModuleDetail() {
  const { id } = Route.useParams();

  const { data: mod } = useQuery({
    queryKey: ["module", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("modules")
        .select("id,name,description,subject_area")
        .eq("id", id)
        .maybeSingle();
      return data as { id: string; name: string; description: string | null; subject_area: string | null } | null;
    },
  });

  const { data: students } = useQuery({
    queryKey: ["module-students", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_modules")
        .select("students(id,name,email)")
        .eq("module_id", id);
      return (data ?? []).map((r) => (r as { students: { id: string; name: string; email: string | null } | null }).students).filter(Boolean) as Array<{ id: string; name: string; email: string | null }>;
    },
  });

  const { data: materials } = useQuery({
    queryKey: ["module-materials", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("materials")
        .select("id,file_name,topic,uploaded_at")
        .eq("module_id", id)
        .order("uploaded_at", { ascending: false });
      return (data ?? []) as Array<{ id: string; file_name: string; topic: string | null; uploaded_at: string }>;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["module-assignments", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("assignments")
        .select("id,title,due_date")
        .eq("module_id", id)
        .order("due_date", { ascending: true });
      return (data ?? []) as Array<{ id: string; title: string; due_date: string | null }>;
    },
  });

  if (!mod)
    return (
      <AppShell><PageHeader title="Module" /><p className="text-muted-foreground">Loading…</p></AppShell>
    );

  return (
    <AppShell>
      <PageHeader title={mod.name} description={mod.description ?? mod.subject_area ?? undefined} />
      <Link to="/modules" className="text-sm text-primary hover:underline mb-4 inline-block">← All modules</Link>
      <Tabs defaultValue="students" className="mt-4">
        <TabsList>
          <TabsTrigger value="students">Students ({students?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="materials">Materials ({materials?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignments?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <Card><CardContent className="pt-6">
            {students?.length === 0 && <p className="text-muted-foreground text-sm">No students assigned.</p>}
            <ul className="space-y-2">
              {students?.map((s) => (
                <li key={s.id} className="flex justify-between border-b pb-2 last:border-0">
                  <Link to="/students/$id" params={{ id: s.id }} className="font-medium hover:underline">{s.name}</Link>
                  <span className="text-sm text-muted-foreground">{s.email}</span>
                </li>
              ))}
            </ul>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="materials">
          <Card><CardContent className="pt-6">
            {materials?.length === 0 && <p className="text-muted-foreground text-sm">No materials uploaded.</p>}
            <ul className="space-y-2">
              {materials?.map((m) => (
                <li key={m.id} className="flex justify-between border-b pb-2 last:border-0 text-sm">
                  <span>{m.topic && <Badge variant="secondary" className="mr-2">{m.topic}</Badge>}{m.file_name}</span>
                  <span className="text-muted-foreground">{fmtDate(m.uploaded_at)}</span>
                </li>
              ))}
            </ul>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="assignments">
          <Card><CardContent className="pt-6">
            {assignments?.length === 0 && <p className="text-muted-foreground text-sm">No assignments.</p>}
            <ul className="space-y-2">
              {assignments?.map((a) => (
                <li key={a.id} className="flex justify-between border-b pb-2 last:border-0 text-sm">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-muted-foreground">Due {fmtDate(a.due_date)}</span>
                </li>
              ))}
            </ul>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
