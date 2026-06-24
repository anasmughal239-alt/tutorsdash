import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Zap, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState<"tutor" | "student">("tutor");
  const [mode, setMode]         = useState<"signin" | "signup">("signin");

  // Tutor fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");
  const [signupSent, setSignupSent] = useState(false);

  // Student fields
  const [stEmail, setStEmail]   = useState("");
  const [stPassword, setStPassword] = useState("");
  const [stBusy, setStBusy]     = useState(false);
  const [stError, setStError]   = useState("");

  // Redirect once role is known
  useEffect(() => {
    if (loading || !user || role === null) return;
    if (role === "student") navigate({ to: "/portal", replace: true });
    else navigate({ to: "/dashboard", replace: true });
  }, [user, loading, role, navigate]);

  // ── Tutor submit ──
  async function tutorSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (!data.session) setSignupSent(true);
    }
    setBusy(false);
  }

  // ── Student submit ──
  async function studentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStError("");
    setStBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: stEmail,
      password: stPassword,
    });
    if (error) setStError(
      error.message.includes("Invalid login")
        ? "Incorrect email or password. Check your invite email or contact your tutor."
        : error.message
    );
    setStBusy(false);
  }

  if (loading) return null;

  return (
    <div style={s.page}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        .tl-input { transition: border-color 0.15s, box-shadow 0.15s; }
        .tl-input:focus { outline: none; border-color: #ff4f00 !important; box-shadow: 0 0 0 3px rgba(255,79,0,0.15); }
        .tl-primary:hover:not(:disabled) { background: #e04300 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,79,0,0.3); }
        .tl-primary:active { transform: translateY(0) !important; }
        .tl-link:hover { text-decoration: underline; }
        @media (max-width: 840px) {
          .tl-left { display: none !important; }
          .tl-right { flex: unset !important; width: 100% !important; min-height: 100vh !important; border-radius: 0 !important; padding: 48px 24px !important; }
        }
      `}</style>

      {/* ── Left panel ── */}
      <div className="tl-left" style={s.left}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:56 }}>
          <div style={s.logoMark}><Zap size={17} color="#fff" /></div>
          <span style={{ fontSize:17, fontWeight:600, color:"#201515" }}>TutorDash</span>
        </div>
        <div style={{ display:"flex", gap:20, marginBottom:44, flexWrap:"wrap" }}>
          {["Free to start", "Secure & private", "No spreadsheets"].map((b) => (
            <span key={b} style={s.badge}>
              <span style={{ color:"#ff4f00", marginRight:5, fontWeight:700 }}>✓</span>{b}
            </span>
          ))}
        </div>
        <h1 style={s.headline}>Manage your students,<br />not your spreadsheets.</h1>
        <p style={s.subtext}>
          Schedule lessons, track attendance, record grades, and share progress reports — all in one workspace built for tutors.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:20, marginTop:52 }}>
          {[
            { e:"📚", t:"Organise students across modules and batches" },
            { e:"📅", t:"Schedule lessons and track attendance" },
            { e:"📊", t:"Auto-generate progress reports for parents" },
          ].map((f) => (
            <div key={f.t} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <span style={{ fontSize:20, lineHeight:1.4 }}>{f.e}</span>
              <span style={{ fontSize:15, color:"#605d52", lineHeight:1.55 }}>{f.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="tl-right" style={s.right}>
        <div style={s.card}>
          {/* Tab switcher */}
          <div style={s.tabBar}>
            {(["tutor", "student"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setStError(""); }}
                style={{
                  ...s.tabBtn,
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "#201515" : "#939084",
                  fontWeight: tab === t ? 600 : 400,
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                }}
              >
                {t === "tutor" ? "I'm a tutor" : "I'm a student"}
              </button>
            ))}
          </div>

          {/* ── Tutor tab ── */}
          {tab === "tutor" && (
            signupSent ? (
              <div style={{ textAlign:"center", paddingTop:8 }}>
                <div style={{ fontSize:44, marginBottom:14 }}>📬</div>
                <h2 style={s.cardHeading}>Check your inbox</h2>
                <p style={{ fontSize:14, color:"#605d52", lineHeight:1.65, marginBottom:24 }}>
                  Confirm your email at <strong style={{ color:"#201515" }}>{email}</strong> then sign in.
                </p>
                <button className="tl-primary" style={s.primaryBtn}
                  onClick={() => { setMode("signin"); setSignupSent(false); }}>
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <h2 style={s.cardHeading}>
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h2>
                <p style={{ fontSize:13, color:"#939084", marginBottom:22 }}>
                  {mode === "signin" ? "Sign in to your TutorDash workspace." : "Free to start, no card needed."}
                </p>
                <form onSubmit={tutorSubmit} style={{ display:"flex", flexDirection:"column", gap:13 }}>
                  <Field label="Email" type="email" value={email} onChange={setEmail}
                    autoComplete="email" placeholder="you@email.com" />
                  <Field label="Password" type="password" value={password} onChange={setPassword}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder="••••••••" hint={mode === "signup" ? "Min 6 characters" : undefined} />
                  {error && <ErrorBox msg={error} />}
                  <button type="submit" className="tl-primary" disabled={busy}
                    style={{ ...s.primaryBtn, opacity: busy ? 0.7 : 1, cursor: busy ? "not-allowed" : "pointer", marginTop:2 }}>
                    {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                  </button>
                </form>
                <p style={{ marginTop:18, textAlign:"center", fontSize:13, color:"#939084" }}>
                  {mode === "signin" ? "Don't have an account? " : "Already have one? "}
                  <button className="tl-link" style={s.linkBtn}
                    onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
                    {mode === "signin" ? "Sign up free" : "Sign in"}
                  </button>
                </p>
              </>
            )
          )}

          {/* ── Student tab ── */}
          {tab === "student" && (
            <>
              <h2 style={s.cardHeading}>Student sign in</h2>
              <p style={{ fontSize:13, color:"#939084", marginBottom:22, lineHeight:1.55 }}>
                Use the email and password from your tutor's invite.
                First time? Check your email for the invite link.
              </p>
              <form onSubmit={studentSubmit} style={{ display:"flex", flexDirection:"column", gap:13 }}>
                <Field label="Email" type="email" value={stEmail} onChange={setStEmail}
                  autoComplete="email" placeholder="your@email.com" />
                <Field label="Password" type="password" value={stPassword} onChange={setStPassword}
                  autoComplete="current-password" placeholder="••••••••" />
                {stError && <ErrorBox msg={stError} />}
                <button type="submit" className="tl-primary" disabled={stBusy}
                  style={{ ...s.primaryBtn, opacity: stBusy ? 0.7 : 1, cursor: stBusy ? "not-allowed" : "pointer", marginTop:2 }}>
                  {stBusy ? "Signing in…" : "Access my portal"}
                </button>
              </form>
              <p style={{ marginTop:18, fontSize:12, color:"#aaa69b", textAlign:"center", lineHeight:1.5 }}>
                No account yet? Ask your tutor to send you an invite.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function Field({ label, type, value, onChange, autoComplete, placeholder, hint }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
  placeholder?: string; hint?: string;
}) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={s.label}>{label}</label>
      <input className="tl-input" style={s.input} type={type} required
        autoComplete={autoComplete} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span style={{ fontSize:12, color:"#aaa69b" }}>{hint}</span>}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:"#fff1f1",
      border:"1px solid #fecaca", borderRadius:8, padding:"9px 12px" }}>
      <AlertCircle size={14} color="#dc2626" style={{ flexShrink:0, marginTop:1 }} />
      <p style={{ fontSize:13, color:"#dc2626", lineHeight:1.4 }}>{msg}</p>
    </div>
  );
}

/* ── Styles ── */
const font = "'Inter', system-ui, -apple-system, sans-serif";

const s: Record<string, React.CSSProperties> = {
  page: { display:"flex", minHeight:"100vh", fontFamily:font, background:"#fff" },
  left: {
    flex:1, padding:"60px 72px", display:"flex", flexDirection:"column",
    justifyContent:"center", background:"#fff",
  },
  right: {
    flex:1,
    background:"linear-gradient(155deg, #7b8fa8 0%, #9aafc8 45%, #8ba1bd 100%)",
    display:"flex", alignItems:"center", justifyContent:"center",
    padding:"48px 40px", borderRadius:"28px 0 0 28px",
  },
  card: {
    width:"100%", maxWidth:380, background:"#fff", borderRadius:16,
    padding:"28px 28px 26px",
    boxShadow:"0 8px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
  },
  tabBar: {
    display:"flex", gap:4, background:"#f3efe9", borderRadius:10,
    padding:4, marginBottom:24,
  },
  tabBtn: {
    flex:1, padding:"8px 10px", fontSize:13, border:"none",
    borderRadius:8, cursor:"pointer", fontFamily:font, transition:"all 0.15s",
  },
  logoMark: {
    width:36, height:36, background:"#ff4f00", borderRadius:9,
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  },
  badge: { display:"inline-flex", alignItems:"center", fontSize:12, fontWeight:500, color:"#605d52" },
  headline: {
    fontSize:"clamp(30px, 3.2vw, 50px)", fontWeight:800, color:"#201515",
    lineHeight:1.12, letterSpacing:"-0.025em", marginBottom:20,
  },
  subtext: { fontSize:17, lineHeight:1.65, color:"#605d52", maxWidth:420 },
  cardHeading: { fontSize:19, fontWeight:700, color:"#201515", marginBottom:6, fontFamily:font },
  label: { fontSize:13, fontWeight:500, color:"#201515", fontFamily:font },
  input: {
    width:"100%", padding:"10px 13px", fontSize:14, background:"#fff",
    border:"1.5px solid #d1ccc3", borderRadius:8, color:"#201515", fontFamily:font,
  },
  primaryBtn: {
    width:"100%", padding:"13px 20px", fontSize:15, fontWeight:700,
    background:"#ff4f00", color:"#fff", border:"none", borderRadius:10,
    fontFamily:font, transition:"background 0.15s, transform 0.1s, box-shadow 0.15s",
    letterSpacing:"0.01em",
  },
  linkBtn: {
    fontSize:13, fontWeight:600, color:"#ff4f00", background:"none",
    border:"none", cursor:"pointer", padding:0, fontFamily:font,
  },
};
