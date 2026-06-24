import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Zap, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]         = useState<"signin" | "signup">("signup");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);
  const [signupSent, setSignupSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate({ to: "/dashboard", replace: true });
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (data.session) navigate({ to: "/dashboard", replace: true });
      else setSignupSent(true);
    }
    setBusy(false);
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
        .tl-toggle:hover { text-decoration: underline; }
        @media (max-width: 840px) {
          .tl-left { display: none !important; }
          .tl-right { flex: unset !important; width: 100% !important; min-height: 100vh !important; border-radius: 0 !important; padding: 48px 24px !important; }
        }
      `}</style>

      {/* ── Left panel ── */}
      <div className="tl-left" style={s.left}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:56 }}>
          <div style={s.logoMark}><Zap size={17} color="#fff" /></div>
          <span style={{ fontSize:17, fontWeight:600, color:"#201515" }}>TutorDash</span>
        </div>

        {/* Trust badges */}
        <div style={{ display:"flex", gap:20, marginBottom:44, flexWrap:"wrap" }}>
          {["Free to start", "Secure & private", "No spreadsheets"].map((b) => (
            <span key={b} style={s.badge}>
              <span style={{ color:"#ff4f00", marginRight:5, fontWeight:700 }}>✓</span>{b}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h1 style={s.headline}>
          Manage your students,<br />
          not your spreadsheets.
        </h1>
        <p style={s.subtext}>
          Schedule lessons, track attendance, record grades, and share progress reports — all in one workspace built for tutors.
        </p>

        {/* Feature list */}
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

      {/* ── Right panel (slate blue) ── */}
      <div className="tl-right" style={s.right}>
        {/* White card */}
        <div style={s.card}>
          {signupSent ? (
            /* Email confirmation */
            <div style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📬</div>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#201515", marginBottom:10 }}>
                Check your inbox
              </h2>
              <p style={{ fontSize:14, color:"#605d52", lineHeight:1.65, marginBottom:28 }}>
                We sent a confirmation link to{" "}
                <strong style={{ color:"#201515" }}>{email}</strong>.
                Click it to activate your account, then sign in.
              </p>
              <button
                className="tl-primary"
                style={s.primaryBtn}
                onClick={() => { setMode("signin"); setSignupSent(false); }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h2 style={s.cardHeading}>
                {mode === "signup" ? "Get started for free" : "Log in to TutorDash"}
              </h2>
              <p style={{ fontSize:13, color:"#939084", marginBottom:22, lineHeight:1.5 }}>
                {mode === "signup"
                  ? "No credit card required."
                  : "Welcome back."}
              </p>

              {/* Email / password form */}
              <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:13 }}>
                <div style={s.field}>
                  <label style={s.label}>
                    {mode === "signup" ? "Work email" : "Email"} *
                  </label>
                  <input
                    className="tl-input"
                    style={s.input}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Password *</label>
                  <input
                    className="tl-input"
                    style={s.input}
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div style={s.errorBox}>
                    <AlertCircle size={14} color="#dc2626" style={{ flexShrink:0, marginTop:1 }} />
                    <p style={{ fontSize:13, color:"#dc2626", lineHeight:1.4 }}>{error}</p>
                  </div>
                )}

                {mode === "signup" && (
                  <p style={{ fontSize:12, color:"#aaa69b", lineHeight:1.55 }}>
                    By signing up, you agree to our{" "}
                    <span style={{ color:"#201515", textDecoration:"underline", cursor:"pointer" }}>Terms of Service</span>
                    {" "}and{" "}
                    <span style={{ color:"#201515", textDecoration:"underline", cursor:"pointer" }}>Privacy Policy</span>.
                  </p>
                )}

                <button
                  type="submit"
                  className="tl-primary"
                  disabled={busy}
                  style={{ ...s.primaryBtn, opacity: busy ? 0.7 : 1, cursor: busy ? "not-allowed" : "pointer", marginTop:2 }}
                >
                  {busy ? "Please wait…" : mode === "signup" ? "Get started for free" : "Log in"}
                </button>
              </form>

              <p style={{ marginTop:20, textAlign:"center", fontSize:13, color:"#939084" }}>
                {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
                <button
                  className="tl-toggle"
                  style={{ fontSize:13, fontWeight:600, color:"#201515", background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}
                  onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}
                >
                  {mode === "signup" ? "Log in" : "Sign up free"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const font = "'Inter', system-ui, -apple-system, sans-serif";

const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: font,
    background: "#fff",
  },
  left: {
    flex: 1,
    padding: "60px 72px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "#fff",
  },
  right: {
    flex: 1,
    background: "linear-gradient(155deg, #7b8fa8 0%, #9aafc8 45%, #8ba1bd 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    borderRadius: "28px 0 0 28px",
  },
  card: {
    width: "100%",
    maxWidth: 368,
    background: "#fff",
    borderRadius: 16,
    padding: "32px 28px 28px",
    boxShadow: "0 8px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
  },
  logoMark: {
    width: 36,
    height: 36,
    background: "#ff4f00",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 12,
    fontWeight: 500,
    color: "#605d52",
  },
  headline: {
    fontSize: "clamp(30px, 3.2vw, 50px)",
    fontWeight: 800,
    color: "#201515",
    lineHeight: 1.12,
    letterSpacing: "-0.025em",
    marginBottom: 20,
  },
  subtext: {
    fontSize: 17,
    lineHeight: 1.65,
    color: "#605d52",
    maxWidth: 420,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: 700,
    color: "#201515",
    marginBottom: 6,
    fontFamily: font,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#201515",
    fontFamily: font,
  },
  input: {
    width: "100%",
    padding: "10px 13px",
    fontSize: 14,
    background: "#fff",
    border: "1.5px solid #d1ccc3",
    borderRadius: 8,
    color: "#201515",
    fontFamily: font,
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: "#fff1f1",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "9px 12px",
  },
  primaryBtn: {
    width: "100%",
    padding: "13px 20px",
    fontSize: 15,
    fontWeight: 700,
    background: "#ff4f00",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontFamily: font,
    transition: "background 0.15s, transform 0.1s, box-shadow 0.15s",
    letterSpacing: "0.01em",
  },
};
