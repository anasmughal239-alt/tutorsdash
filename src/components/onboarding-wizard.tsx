import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Users, CalendarDays, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
}

export function OnboardingWizard({ open }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function addStudent() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("students").insert({ name: name.trim(), email: email.trim() || null, phone: phone.trim() || null });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    await queryClient.invalidateQueries({ queryKey: ["recent-students"] });
    setSaving(false);
    setStep(3);
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        {step === 1 && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sparkles className="h-7 w-7" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">Welcome to TutorDash!</DialogTitle>
              <DialogDescription className="text-center">
                Let's get you set up in 2 minutes. We'll start by adding your first student.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Add students</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center">
                <CalendarDays className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Schedule lessons</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Track progress</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Let's go →
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Add your first student</DialogTitle>
              <DialogDescription>
                Just a name is enough to get started. You can fill in more details later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="ob-name">Name *</Label>
                <Input
                  id="ob-name"
                  placeholder="e.g. Ali Hassan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addStudent()}
                  autoFocus
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ob-email">Email (optional)</Label>
                <Input
                  id="ob-email"
                  type="email"
                  placeholder="student@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ob-phone">Phone (optional)</Label>
                <Input
                  id="ob-phone"
                  placeholder="+92 300 0000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={addStudent} disabled={!name.trim() || saving}>
                {saving ? "Adding…" : "Add student"}
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">You're all set!</DialogTitle>
              <DialogDescription className="text-center">
                <span className="font-medium text-foreground">{name}</span> has been added. Here's what you can do next:
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 my-2">
              <Button variant="outline" className="justify-start gap-2" onClick={() => navigate({ to: "/students" })}>
                <Users className="h-4 w-4" /> View & manage students
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => navigate({ to: "/lessons" })}>
                <CalendarDays className="h-4 w-4" /> Schedule a lesson
              </Button>
            </div>
            <Button className="w-full" onClick={() => navigate({ to: "/dashboard" })}>
              Go to dashboard
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
