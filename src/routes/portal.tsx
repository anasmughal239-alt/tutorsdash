import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtDate, fmtDateTime, letterGrade } from "@/lib/format";
import { toast } from "sonner";
import {
  Download, GraduationCap, CalendarDays, FolderOpen,
  Zap, LogOut, KeyRound, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/portal")({
  component: StudentPortal,
});

function StudentPortal() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Set-password flow
  const [showPwForm, setShowPwForm] = useState(false);
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [pwBusy, setPwBusy]         = useState(false);
  const [pwDone, setPwDone]         = useState(false);

  // Redirect non-students away
  if (!loading && !user) { navigate({ to: "/login", replace: true }); return null; }
  if (!loading && role === "tutor") { navigate({ to: "/dashboard", replace: true }); return null; }

  const { data, isLoading } = useQuery({
    queryKey: ["portal", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data: student } = await supabase
        .from("students")
        .select("id,name,email,student_modules(modules(id,name))")
        .eq("email", user!.email!)
        .maybeSingle();
      if (!student) return null;

      const sid = (student as { id: string }).id;
      const moduleIds = (
        (student as { student_modules: { modules: { id: string } | null }[] })
          .student_modules
      ).map((sm) => sm.modules?.id).filter(Boolean) as string[];

      const [lessons, grades, attendance, materials, assignments] = await Promise.all([
        supabase.from("lessons")
          .select("id,lesson_date,topic,modules(name)")
          .eq("student_id", sid)
          .gte("lesson_date", new Date().toISOString())
          .order("lesson_date").limit(10),
        supabase.from("grades")
          .select("id,assessment_name,marks_obtained,total_marks,percentage,date,modules(name)")
          .eq("student_id", sid).order("date", { ascending: false }),
        supabase.from("attendance").select("status").eq("student_id", sid),
        moduleIds.length
          ? supabase.from("materials")
              .select("id,file_name,file_path,topic,modules(name)")
              .in("module_id", moduleIds).order("uploaded_at", { ascending: false })
          : Promise.resolve({ data: [] as { id: string; file_name: string; file_path: string; topic: string | null; modules: { name: string } | null }[] }),
        supabase.from("student_assignments")
          .select("status,assignments(title,due_date,modules(name))")
          .eq("student_id", sid),
      ]);

      const attRows = (attendance.data ?? []) as { status: string }[];
      const present = attRows.filter((a) => a.status === "present").length;
      const attPct = attRows.length ? Math.round((present / attRows.length) * 100) : 0;
      const grades_ = (grades.data ?? []) as {
        id: string; assessment_name: string; marks_obtained: number;
        total_marks: number; percentage: number; date: string; modules: { name: string } | null;
      }[];
      const avg = grades_.length
        ? Math.round(grades_.reduce((s, g) => s + Number(g.percentage), 0) / grades_.length) : 0;

      return {
        student: student as { id: string; name: string; email: string | null; student_modules: { modules: { id: string; name: string } | null }[] },
        lessons: (lessons.data ?? []) as { id: string; lesson_date: string; topic: string | null; modules: { name: string } | null }[],
        grades: grades_,
        attendance: { pct: attPct, present, total: attRows.length },
        avg,
        materials: (materials.data ?? []) as { id: string; file_name: string; file_path: string; topic: string | null; modules: { name: string } | null }[],
        assignments: (assignments.data ?? []) as { status: string; assignments: { title: string; due_date: string | null; modules: { name: string } | null } | null }[],
      };
    },
  });

  async function downloadMaterial(path: string) {
    const { data, error } = await supabase.storage.from("materials").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }

  async function setPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    if (newPw.length < 6)    { toast.error("Password must be at least 6 characters"); return; }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwBusy(false);
    if (error) { toast.error(error.message); return; }
    setPwDone(true);
    setShowPwForm(false);
    setNewPw(""); setConfirmPw("");
    toast.success("Password set! You can now log in with email + password.");
  }

  if (loading || isLoading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fffefb" }}>
        <div style={{ width:28, height:28, borderRadius:"50%", border:"2.5px solid #ff4f00", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fffefb", padding:24, textAlign:"center", fontFamily:"'Inter',system-ui,sans-serif" }}>
        <div>
          <p style={{ fontSize:18, fontWeight:600, color:"#201515", marginBottom:8 }}>Not registered as a student</p>
          <p style={{ fontSize:14, color:"#939084", marginBottom:24 }}>Your email isn't linked to any student account. Contact your tutor.</p>
          <button onClick={() => void signOut()} style={{ fontSize:14, color:"#ff4f00", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>Sign out</button>
        </div>
      </div>
    );
  }

  const { student, lessons, grades, attendance, avg, materials, assignments } = data;

  return (
    <div style={{ minHeight:"100vh", background:"#fffefb", fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <header style={{ background:"#201515", padding:"0 24px" }}>
        <div style={{ maxWidth:800, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, background:"#ff4f00", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Zap size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,254,251,0.4)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Student portal</div>
              <div style={{ fontSize:14, fontWeight:600, color:"#fffefb" }}>{student.name}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button
              onClick={() => { setShowPwForm(!showPwForm); setPwDone(false); }}
              style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,254,251,0.6)", background:"rgba(255,254,251,0.06)", border:"1px solid rgba(255,254,251,0.1)", borderRadius:7, padding:"6px 12px", cursor:"pointer" }}
            >
              <KeyRound size={13} /> {pwDone ? "Change password" : "Set password"}
            </button>
            <button
              onClick={() => void signOut()}
              style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,254,251,0.6)", background:"rgba(255,254,251,0.06)", border:"1px solid rgba(255,254,251,0.1)", borderRadius:7, padding:"6px 12px", cursor:"pointer" }}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:800, margin:"0 auto", padding:"32px 24px" }}>
        {/* Set-password banner */}
        {!pwDone && !showPwForm && (
          <div style={{ background:"#fff8f5", border:"1px solid #ffd4c2", borderRadius:12, padding:"14px 18px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <p style={{ fontSize:13, color:"#7a3a1e" }}>
              <strong>Set a password</strong> so you can log in next time without needing an invite link.
            </p>
            <button
              onClick={() => setShowPwForm(true)}
              style={{ flexShrink:0, fontSize:13, fontWeight:600, color:"#ff4f00", background:"none", border:"1.5px solid #ff4f00", borderRadius:8, padding:"6px 14px", cursor:"pointer" }}
            >
              Set password
            </button>
          </div>
        )}

        {pwDone && (
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:"14px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <p style={{ fontSize:13, color:"#166534" }}>Password set! Next time just go to the login page and use your email + password.</p>
          </div>
        )}

        {/* Set-password form */}
        {showPwForm && (
          <div style={{ background:"#fff", border:"1px solid #e2ddd6", borderRadius:12, padding:24, marginBottom:24 }}>
            <h3 style={{ fontSize:15, fontWeight:600, color:"#201515", marginBottom:16 }}>Set your password</h3>
            <form onSubmit={setPassword} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:13, fontWeight:500, color:"#201515" }}>New password</label>
                <input type="password" required minLength={6} placeholder="Min 6 characters" value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  style={{ padding:"10px 13px", fontSize:14, border:"1.5px solid #d1ccc3", borderRadius:8, color:"#201515", fontFamily:"inherit" }} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:13, fontWeight:500, color:"#201515" }}>Confirm password</label>
                <input type="password" required minLength={6} placeholder="Same as above" value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  style={{ padding:"10px 13px", fontSize:14, border:"1.5px solid #d1ccc3", borderRadius:8, color:"#201515", fontFamily:"inherit" }} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button type="button" onClick={() => setShowPwForm(false)}
                  style={{ flex:1, padding:"10px", fontSize:14, fontWeight:500, background:"#f3efe9", color:"#201515", border:"none", borderRadius:8, cursor:"pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={pwBusy}
                  style={{ flex:2, padding:"10px", fontSize:14, fontWeight:700, background:"#ff4f00", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", opacity: pwBusy ? 0.7 : 1 }}>
                  {pwBusy ? "Saving…" : "Save password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          <StatCard label="Attendance" value={`${attendance.pct}%`} sub={`${attendance.present}/${attendance.total} sessions`} />
          <StatCard label="Avg grade" value={`${avg}%`} sub={letterGrade(avg)} />
          <StatCard label="Modules" value={String(student.student_modules.length)} />
        </div>

        {/* Upcoming lessons */}
        <Section title="Upcoming lessons" icon={<CalendarDays size={16} color="#ff4f00" />}>
          {lessons.length === 0
            ? <Empty msg="No upcoming lessons scheduled." />
            : lessons.map((l) => (
              <Row key={l.id}
                left={<><span style={{ fontWeight:500 }}>{l.topic ?? "Lesson"}</span><span style={{ color:"#939084" }}> · {l.modules?.name}</span></>}
                right={fmtDateTime(l.lesson_date)}
              />
            ))}
        </Section>

        {/* Grades */}
        <Section title="Grades" icon={<GraduationCap size={16} color="#ff4f00" />}>
          {grades.length === 0
            ? <Empty msg="No grades recorded yet." />
            : grades.map((g) => (
              <Row key={g.id}
                left={<><span style={{ fontWeight:500 }}>{g.assessment_name}</span><span style={{ color:"#939084" }}> · {g.modules?.name}</span></>}
                right={<><strong>{g.marks_obtained}/{g.total_marks}</strong> <span style={{ color:"#939084" }}>({Math.round(Number(g.percentage))}%) · {fmtDate(g.date)}</span></>}
              />
            ))}
        </Section>

        {/* Materials */}
        <Section title="Materials" icon={<FolderOpen size={16} color="#ff4f00" />}>
          {materials.length === 0
            ? <Empty msg="No materials uploaded yet." />
            : materials.map((m) => (
              <Row key={m.id}
                left={<>
                  {m.topic && <span style={{ fontSize:11, fontWeight:600, background:"#f3efe9", color:"#605d52", borderRadius:4, padding:"2px 6px", marginRight:6 }}>{m.topic}</span>}
                  <span style={{ fontWeight:500 }}>{m.file_name}</span>
                  <span style={{ color:"#939084" }}> · {m.modules?.name}</span>
                </>}
                right={
                  <button onClick={() => downloadMaterial(m.file_path)}
                    style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color:"#201515", background:"#f3efe9", border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer" }}>
                    <Download size={12} /> Download
                  </button>
                }
              />
            ))}
        </Section>

        {/* Assignments */}
        <Section title="Assignments" icon={<span style={{ fontSize:15 }}>📋</span>}>
          {assignments.length === 0
            ? <Empty msg="No assignments yet." />
            : assignments.map((a, i) => (
              <Row key={i}
                left={<><span style={{ fontWeight:500 }}>{a.assignments?.title}</span><span style={{ color:"#939084" }}> · {a.assignments?.modules?.name}</span></>}
                right={
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{
                      fontSize:11, fontWeight:600, borderRadius:5, padding:"2px 8px",
                      background: a.status === "completed" ? "#dcfce7" : a.status === "submitted" ? "#e0f2fe" : "#f3efe9",
                      color: a.status === "completed" ? "#166534" : a.status === "submitted" ? "#0369a1" : "#605d52",
                    }}>{a.status}</span>
                    {a.assignments?.due_date && <span style={{ fontSize:11, color:"#939084" }}>Due {fmtDate(a.assignments.due_date)}</span>}
                  </div>
                }
              />
            ))}
        </Section>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e2ddd6", borderRadius:12, padding:"16px 18px" }}>
      <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#939084", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, color:"#201515" }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:"#939084", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e2ddd6", borderRadius:12, marginBottom:16, overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", borderBottom:"1px solid #f0ece6", display:"flex", alignItems:"center", gap:8 }}>
        {icon}
        <span style={{ fontSize:14, fontWeight:600, color:"#201515" }}>{title}</span>
      </div>
      <div style={{ padding:"0 18px" }}>{children}</div>
    </div>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 0", borderBottom:"1px solid #f0ece6", fontSize:13 }}>
      <div style={{ minWidth:0 }}>{left}</div>
      <div style={{ flexShrink:0, color:"#939084", fontSize:12 }}>{right}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p style={{ fontSize:13, color:"#aaa69b", padding:"14px 0" }}>{msg}</p>;
}
