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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BookMarked, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { humanizeError } from "@/lib/errors";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/school-diary")({
  component: SchoolDiaryPage,
});

type DiaryEntry = {
  id: string;
  date: string;
  topic_taught: string | null;
  homework: string | null;
  notes: string | null;
  periods_taken: number;
  class_id: string;
};

function SchoolDiaryPage() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today);
  const [topic, setTopic] = useState("");
  const [homework, setHomework] = useState("");
  const [notes, setNotes] = useState("");
  const [periods, setPeriods] = useState("1");

  const { data: classes } = useQuery({
    queryKey: ["school-classes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("classes")
        .select("id,name,subject")
        .order("name");
      return (data ?? []) as { id: string; name: string; subject: string }[];
    },
  });

  const { data: existing } = useQuery({
    queryKey: ["diary-entry", classId, date],
    enabled: !!classId && !!date,
    queryFn: async () => {
      const { data } = await supabase
        .from("class_diary")
        .select("*")
        .eq("class_id", classId)
        .eq("date", date)
        .maybeSingle();
      return data as DiaryEntry | null;
    },
  });

  const { data: recentEntries } = useQuery({
    queryKey: ["diary-recent", classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data } = await supabase
        .from("class_diary")
        .select("*")
        .eq("class_id", classId)
        .order("date", { ascending: false })
        .limit(10);
      return (data ?? []) as DiaryEntry[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!classId) throw new Error("Select a class");
      if (!topic.trim()) throw new Error("Topic taught is required");
      const payload = {
        class_id: classId,
        date,
        topic_taught: topic.trim(),
        homework: homework.trim() || null,
        notes: notes.trim() || null,
        periods_taken: Number(periods) || 1,
      };
      const { error } = await supabase
        .from("class_diary")
        .upsert(payload, { onConflict: "class_id,date" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Diary entry saved");
      qc.invalidateQueries({ queryKey: ["diary-entry", classId, date] });
      qc.invalidateQueries({ queryKey: ["diary-recent", classId] });
      setTopic(""); setHomework(""); setNotes(""); setPeriods("1");
    },
    onError: (e: Error) => toast.error(humanizeError(e)),
  });

  const selectedClass = classes?.find((c) => c.id === classId);

  return (
    <AppShell>
      <PageHeader
        title="Teacher Diary"
        description="Log what you taught today — builds your official diary automatically."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Entry form */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label>Class *</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {c.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              {existing && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-md px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Entry exists for this date — saving will update it.
                </div>
              )}

              <div>
                <Label>Topic taught *</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`e.g. ${selectedClass ? `${selectedClass.subject} — ` : ""}Chapter 3: Algebraic Expressions`}
                />
              </div>
              <div>
                <Label>Homework given</Label>
                <Input
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="e.g. Ex 3.2 Q1–Q5 (due tomorrow)"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label>Remarks / notes</Label>
                  <Textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any observations, student concerns, etc."
                  />
                </div>
                <div>
                  <Label>Periods</Label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={periods}
                    onChange={(e) => setPeriods(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => save.mutate()} disabled={save.isPending || !classId}>
                  {save.isPending ? "Saving…" : "Save entry"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent entries */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent entries
          </h3>
          {!classId && (
            <p className="text-sm text-muted-foreground">Select a class to see diary history.</p>
          )}
          {classId && recentEntries?.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <BookMarked className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No entries yet.</p>
            </div>
          )}
          <div className="space-y-3">
            {recentEntries?.map((entry) => (
              <Card
                key={entry.id}
                className={`cursor-pointer hover:border-primary/40 transition-colors ${date === entry.date ? "border-primary" : ""}`}
                onClick={() => {
                  setDate(entry.date);
                  setTopic(entry.topic_taught ?? "");
                  setHomework(entry.homework ?? "");
                  setNotes(entry.notes ?? "");
                  setPeriods(String(entry.periods_taken));
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-primary">{fmtDate(entry.date)}</span>
                    <span className="text-xs text-muted-foreground">{entry.periods_taken}p</span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{entry.topic_taught}</p>
                  {entry.homework && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">HW: {entry.homework}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
