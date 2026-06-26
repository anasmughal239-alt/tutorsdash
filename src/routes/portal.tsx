import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtDate, fmtDateTime, letterGrade } from "@/lib/format";
import { toast } from "sonner";
import {
  Download, GraduationCap, CalendarDays, FolderOpen,
  Zap, LogOut, KeyRound, CheckCircle2, MessageSquare,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";

export const Route = createFileRoute("/portal")({
  component: StudentPortal,
});

function StudentPortal() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [showPwForm, setShowPwForm] = useState(false);
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [pwBusy, setPwBusy]         = useState(false);
  // Persist across reloads via user metadata
  const pwDone = !!user?.user_metadata?.has_password;
  const [pwDoneLocal, setPwDoneLocal] = useState(false);

  if (!loading && !user)            { navigate({ to: "/login",     replace: true }); return null; }
  if (!loading && role === "tutor") { navigate({ to: "/dashboard", replace: true }); return null; }

  const { data, isLoading, isError, refetch } = useQuery({
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
        (student as { student_modules: { modules: { id: string } | null }[] }).student_modules
      ).map((sm) => sm.modules?.id).filter(Boolean) as string[];

      const [lessons, grades, attendance, materials, assignments, remarks] = await Promise.all([
        supabase.from("lessons")
          .select("id,lesson_date,topic,notes,modules(name)")
          .eq("student_id", sid).gte("lesson_date", new Date().toISOString())
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
        supabase.from("remarks")
          .select("id,text,created_at")
          .eq("student_id", sid).order("created_at", { ascending: false }).limit(10),
      ]);

      const attRows    = (attendance.data ?? []) as { status: string }[];
      const present    = attRows.filter((a) => a.status === "present").length;
      const attPct     = attRows.length ? Math.round((present / attRows.length) * 100) : 0;
      const grades_    = (grades.data ?? []) as {
        id: string; assessment_name: string; marks_obtained: number;
        total_marks: number; percentage: number; date: string; modules: { name: string } | null;
      }[];
      const avg = grades_.length
        ? Math.round(grades_.reduce((s, g) => s + Number(g.percentage), 0) / grades_.length) : 0;

      // Group grades by module for results section
      const gradesByModule = grades_.reduce<Record<string, typeof grades_>>((acc, g) => {
        const key = g.modules?.name ?? "General";
        (acc[key] ??= []).push(g);
        return acc;
      }, {});

      return {
        student: student as { id: string; name: string; email: string | null; student_modules: { modules: { id: string; name: string } | null }[] },
        lessons: (lessons.data ?? []) as { id: string; lesson_date: string; topic: string | null; notes: string | null; modules: { name: string } | null }[],
        grades: grades_,
        gradesByModule,
        attendance: { pct: attPct, present, total: attRows.length },
        avg,
        materials: (materials.data ?? []) as { id: string; file_name: string; file_path: string; topic: string | null; modules: { name: string } | null }[],
        assignments: (assignments.data ?? []) as { status: string; assignments: { title: string; due_date: string | null; modules: { name: string } | null } | null }[],
        remarks: (remarks.data ?? []) as { id: string; text: string; created_at: string }[],
      };
    },
  });

  async function downloadMaterial(path: string) {
    const { data, error } = await supabase.storage.from("materials").createSignedUrl(path, 60);
    if (error) return toast.error(`Could not fetch material: ${error.message}`);
    window.open(data.signedUrl, "_blank");
  }

  async function setPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    if (newPw.length < 6)    { toast.error("Minimum 6 characters"); return; }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({
      password: newPw,
      data: { has_password: true },
    });
    setPwBusy(false);
    if (error) { toast.error(error.message); return; }
    setPwDoneLocal(true);
    setShowPwForm(false);
    setNewPw(""); setConfirmPw("");
    toast.success("Password set! Use email + password next time.");
  }

  if (loading || isLoading) return <Spinner />;

  if (isError) return (
    <div style={s.errPage}>
      <p style={{ fontSize:18, fontWeight:600, color:"#201515", marginBottom:8 }}>Could not load your data</p>
      <p style={{ fontSize:14, color:"#939084", marginBottom:24, textAlign:"center" }}>
        Check your connection and try again.
      </p>
      <button onClick={() => void refetch()} style={{ ...s.signOutLink, background:"#201515", color:"#fff", padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600 }}>
        Retry
      </button>
    </div>
  );

  if (!data) return (
    <div style={s.errPage}>
      <p style={{ fontSize:18, fontWeight:600, color:"#201515", marginBottom:8 }}>Not registered as a student</p>
      <p style={{ fontSize:14, color:"#939084", marginBottom:24, textAlign:"center" }}>
        Your email isn't linked to any student account. Contact your tutor.
      </p>
      <button onClick={() => void signOut()} style={s.signOutLink}>Sign out</button>
    </div>
  );

  const { student, lessons, grades, gradesByModule, attendance, avg, materials, assignments, remarks } = data;

  // Trend: compare last 3 vs previous 3 assessments
  const trend = (() => {
    if (grades.length < 4) return "neutral";
    const recent = grades.slice(0, 3).reduce((s, g) => s + Number(g.percentage), 0) / 3;
    const older  = grades.slice(3, 6).reduce((s, g) => s + Number(g.percentage), 0) / Math.min(3, grades.slice(3,6).length);
    if (recent > older + 3) return "up";
    if (recent < older - 3) return "down";
    return "neutral";
  })();

  return (
    <div style={s.page}>
      <style>{`@media (max-width:480px){.td-stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={s.logoMark}><Zap size={14} color="#fff" /></div>
            <div>
              <div style={s.portalLabel}>Student portal</div>
              <div style={s.studentName}>{student.name}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <HdrBtn icon={<KeyRound size={13}/>} label={(pwDone || pwDoneLocal) ? "Change password" : "Set password"}
              onClick={() => setShowPwForm(!showPwForm)} />
            <HdrBtn icon={<LogOut size={13}/>} label="Sign out" onClick={() => void signOut()} />
          </div>
        </div>
      </header>

      <main style={s.main}>
        {/* Set-password banner */}
        {!(pwDone || pwDoneLocal) && !showPwForm && (
          <div style={s.banner}>
            <p style={{ fontSize:13, color:"#7a3a1e" }}>
              <strong>Set a password</strong> so you can log in next time without needing an invite email.
            </p>
            <button onClick={() => setShowPwForm(true)} style={s.bannerBtn}>Set password</button>
          </div>
        )}

        {(pwDone || pwDoneLocal) && (
          <div style={{ ...s.banner, background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
            <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink:0 }} />
            <p style={{ fontSize:13, color:"#166534" }}>
              Password set! Next time use your email + password on the login page.
            </p>
          </div>
        )}

        {/* Set-password form */}
        {showPwForm && (
          <div style={s.pwCard}>
            <h3 style={{ fontSize:15, fontWeight:600, color:"#201515", marginBottom:16 }}>Set your password</h3>
            <form onSubmit={setPassword} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <PwField label="New password" value={newPw} onChange={setNewPw} placeholder="Min 6 characters" />
              <PwField label="Confirm password" value={confirmPw} onChange={setConfirmPw} placeholder="Same as above" />
              <div style={{ display:"flex", gap:8 }}>
                <button type="button" onClick={() => setShowPwForm(false)} style={s.pwCancel}>Cancel</button>
                <button type="submit" disabled={pwBusy} style={{ ...s.pwSave, opacity: pwBusy ? 0.7 : 1 }}>
                  {pwBusy ? "Saving…" : "Save password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Stats strip ── */}
        <div style={s.statsGrid} className="td-stats-grid">
          <StatCard label="Attendance" value={`${attendance.pct}%`} sub={`${attendance.present}/${attendance.total} sessions`} bar={attendance.pct} barColor="#ff4f00" />
          <StatCard label="Overall grade" value={`${avg}%`} sub={letterGrade(avg)}
            bar={avg}
            barColor={avg >= 70 ? "#16a34a" : avg >= 50 ? "#ff4f00" : "#dc2626"}
            badge={trend === "up" ? <TrendUp/> : trend === "down" ? <TrendDown/> : undefined}
          />
          <StatCard label="Modules" value={String(student.student_modules.length)} />
        </div>

        {/* ── Results (grades by module) ── */}
        <Section title="Results" icon={<GraduationCap size={16} color="#ff4f00"/>}>
          {grades.length === 0
            ? <Empty msg="No results yet — your tutor will add these after your first assessment." />
            : Object.entries(gradesByModule).map(([mod, items]) => {
                const modAvg = Math.round(items.reduce((s, g) => s + Number(g.percentage), 0) / items.length);
                return (
                  <div key={mod} style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:"#201515" }}>{mod}</span>
                      <span style={{
                        fontSize:11, fontWeight:700, borderRadius:5, padding:"2px 8px",
                        background: modAvg >= 70 ? "#dcfce7" : modAvg >= 50 ? "#fff8f5" : "#fef2f2",
                        color:      modAvg >= 70 ? "#166534" : modAvg >= 50 ? "#7a3a1e" : "#dc2626",
                      }}>
                        Avg {modAvg}% · {letterGrade(modAvg)}
                      </span>
                    </div>
                    {items.map((g) => {
                      const pct = Math.round(Number(g.percentage));
                      return (
                        <div key={g.id} style={{ marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                            <span style={{ color:"#201515" }}>{g.assessment_name}</span>
                            <span style={{ fontWeight:600, color:"#201515" }}>
                              {g.marks_obtained}/{g.total_marks}
                              <span style={{ color:"#939084", fontWeight:400 }}> ({pct}%) · {fmtDate(g.date)}</span>
                            </span>
                          </div>
                          <div style={{ height:6, background:"#f3efe9", borderRadius:4, overflow:"hidden" }}>
                            <div style={{
                              height:"100%", borderRadius:4,
                              width:`${pct}%`,
                              background: pct >= 70 ? "#16a34a" : pct >= 50 ? "#ff4f00" : "#dc2626",
                              transition:"width 0.4s ease",
                            }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
          }
        </Section>

        {/* ── Upcoming lessons ── */}
        <Section title="Upcoming lessons" icon={<CalendarDays size={16} color="#ff4f00"/>}>
          {lessons.length === 0
            ? <Empty msg="No lessons scheduled yet — your tutor will add these once sessions are booked." />
            : lessons.map((l) => (
              <Row key={l.id}
                left={<>
                  <strong>{l.topic ?? "Lesson"}</strong>
                  <span style={{ color:"#939084" }}> · {l.modules?.name}</span>
                  {l.notes && <div style={{ fontSize:12, color:"#939084", marginTop:2, fontStyle:"italic" }}>{l.notes}</div>}
                </>}
                right={fmtDateTime(l.lesson_date)}
              />
            ))
          }
        </Section>

        {/* ── Materials ── */}
        <Section title="Materials" icon={<FolderOpen size={16} color="#ff4f00"/>}>
          {materials.length === 0
            ? <Empty msg="No materials yet — your tutor will upload notes and files here." />
            : materials.map((m) => (
              <Row key={m.id}
                left={<>
                  {m.topic && <Chip>{m.topic}</Chip>}
                  <strong>{m.file_name}</strong>
                  <span style={{ color:"#939084" }}> · {m.modules?.name}</span>
                </>}
                right={
                  <button onClick={() => downloadMaterial(m.file_path)} style={s.dlBtn}>
                    <Download size={12}/> Download
                  </button>
                }
              />
            ))
          }
        </Section>

        {/* ── Assignments ── */}
        <Section title="Assignments" icon={<span style={{ fontSize:15 }}>📋</span>}>
          {assignments.length === 0
            ? <Empty msg="No assignments yet — they'll appear here once your tutor creates them." />
            : assignments.map((a, i) => (
              <Row key={i}
                left={<><strong>{a.assignments?.title}</strong><span style={{ color:"#939084" }}> · {a.assignments?.modules?.name}</span></>}
                right={
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <StatusBadge status={a.status}/>
                    {a.assignments?.due_date && <span style={{ fontSize:11, color:"#939084" }}>Due {fmtDate(a.assignments.due_date)}</span>}
                  </div>
                }
              />
            ))
          }
        </Section>

        {/* ── Teacher Remarks ── */}
        {remarks.length > 0 && (
          <Section title="Teacher Remarks" icon={<MessageSquare size={16} color="#ff4f00"/>}>
            {remarks.map((r) => (
              <div key={r.id} style={{ padding:"12px 0", borderBottom:"1px solid #f0ece6" }}>
                <p style={{ fontSize:13, color:"#201515", lineHeight:1.6, marginBottom:4 }}>{r.text}</p>
                <span style={{ fontSize:11, color:"#aaa69b" }}>{fmtDate(r.created_at)}</span>
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, sub, bar, barColor, badge }: {
  label: string; value: string; sub?: string;
  bar?: number; barColor?: string; badge?: React.ReactNode;
}) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e2ddd6", borderRadius:12, padding:"16px 18px" }}>
      <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#939084", marginBottom:6 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ fontSize:26, fontWeight:700, color:"#201515" }}>{value}</div>
        {badge}
      </div>
      {sub && <div style={{ fontSize:12, color:"#939084", marginTop:2 }}>{sub}</div>}
      {bar !== undefined && (
        <div style={{ marginTop:10, height:5, background:"#f3efe9", borderRadius:4, overflow:"hidden" }}>
          <div style={{ height:"100%", borderRadius:4, width:`${bar}%`, background: barColor ?? "#ff4f00", transition:"width 0.4s" }}/>
        </div>
      )}
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
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"11px 0", borderBottom:"1px solid #f0ece6", fontSize:13 }}>
      <div style={{ minWidth:0 }}>{left}</div>
      <div style={{ flexShrink:0, color:"#939084", fontSize:12 }}>{right}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p style={{ fontSize:13, color:"#aaa69b", padding:"14px 0" }}>{msg}</p>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize:11, fontWeight:600, background:"#f3efe9", color:"#605d52", borderRadius:4, padding:"2px 6px", marginRight:6 }}>{children}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    completed: { bg:"#dcfce7", color:"#166534" },
    submitted: { bg:"#e0f2fe", color:"#0369a1" },
    pending:   { bg:"#f3efe9", color:"#605d52" },
  };
  const c = cfg[status] ?? cfg.pending;
  return <span style={{ fontSize:11, fontWeight:600, borderRadius:5, padding:"2px 8px", background:c.bg, color:c.color }}>{status}</span>;
}

function HdrBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,254,251,0.6)", background:"rgba(255,254,251,0.06)", border:"1px solid rgba(255,254,251,0.1)", borderRadius:7, padding:"6px 12px", cursor:"pointer" }}>
      {icon} {label}
    </button>
  );
}

function PwField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:13, fontWeight:500, color:"#201515" }}>{label}</label>
      <input type="password" required minLength={6} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding:"10px 13px", fontSize:14, border:"1.5px solid #d1ccc3", borderRadius:8, color:"#201515", fontFamily:"inherit" }} />
    </div>
  );
}

function TrendUp()   { return <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:600, color:"#16a34a", background:"#dcfce7", borderRadius:5, padding:"2px 7px" }}><TrendingUp size={11}/> Improving</span>; }
function TrendDown() { return <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:600, color:"#dc2626", background:"#fef2f2", borderRadius:5, padding:"2px 7px" }}><TrendingDown size={11}/> Declining</span>; }

function Spinner() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fffefb" }}>
      <div style={{ width:28, height:28, borderRadius:"50%", border:"2.5px solid #ff4f00", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Styles ── */
const s: Record<string, React.CSSProperties> = {
  page:       { minHeight:"100vh", background:"#fffefb", fontFamily:"'Inter',system-ui,sans-serif" },
  header:     { background:"#201515", padding:"0 24px" },
  headerInner:{ maxWidth:800, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" },
  logoMark:   { width:30, height:30, background:"#ff4f00", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  portalLabel:{ fontSize:11, color:"rgba(255,254,251,0.4)", letterSpacing:"0.08em", textTransform:"uppercase" as const },
  studentName:{ fontSize:14, fontWeight:600, color:"#fffefb" },
  main:       { maxWidth:800, margin:"0 auto", padding:"28px 24px" },
  statsGrid:  { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 },
  banner:     { background:"#fff8f5", border:"1px solid #ffd4c2", borderRadius:12, padding:"14px 18px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 },
  bannerBtn:  { flexShrink:0, fontSize:13, fontWeight:600, color:"#ff4f00", background:"none", border:"1.5px solid #ff4f00", borderRadius:8, padding:"6px 14px", cursor:"pointer" },
  pwCard:     { background:"#fff", border:"1px solid #e2ddd6", borderRadius:12, padding:24, marginBottom:16 },
  pwCancel:   { flex:1, padding:"10px", fontSize:14, fontWeight:500, background:"#f3efe9", color:"#201515", border:"none", borderRadius:8, cursor:"pointer" },
  pwSave:     { flex:2, padding:"10px", fontSize:14, fontWeight:700, background:"#ff4f00", color:"#fff", border:"none", borderRadius:8, cursor:"pointer" },
  dlBtn:      { display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color:"#201515", background:"#f3efe9", border:"none", borderRadius:6, padding:"5px 10px", cursor:"pointer" },
  errPage:    { minHeight:"100vh", display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", background:"#fffefb", padding:24 },
  signOutLink:{ fontSize:14, color:"#ff4f00", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" },
};
