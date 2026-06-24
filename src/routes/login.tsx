import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Zap, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]         = useState<"signin" | "signup">("signin");
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
        .td-input { transition: box-shadow 0.15s; }
        .td-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(255,79,0,0.2); }
        .td-btn-primary:hover:not(:disabled) { background: #e34600 !important; transform: translateY(-1px); }
        .td-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .td-link-btn:hover { color: #e34600 !important; }
      `}</style>

      {/* Brand mark */}
      <div style={s.brand}>
        <div style={s.logoMark}>
          <Zap size={20} color="#fffefb" />
        </div>
        <span style={s.brandName}>TutorDash</span>
      </div>

      {/* Card */}
      <div style={s.card}>
        {signupSent ? (
          /* ── Email confirmation state ── */
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <div style={{ ...s.logoMark, width: 52, height: 52, borderRadius: "50%" }}>
                <CheckCircle2 size={24} color="#fffefb" />
              </div>
            </div>
            <p style={s.eyebrow}>Almost there</p>
            <h1 style={{ ...s.heading, marginBottom: 8 }}>Check your inbox</h1>
            <p style={{ ...s.body, marginBottom: 28 }}>
              We sent a confirmation link to{" "}
              <strong style={{ color: "#201515" }}>{email}</strong>.
              Click it to activate your account, then sign in.
            </p>
            <button
              className="td-btn-primary"
              style={s.btnPrimary}
              onClick={() => { setMode("signin"); setSignupSent(false); }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <p style={s.eyebrow}>{mode === "signin" ? "Sign in" : "Sign up"}</p>
            <h1 style={s.heading}>
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p style={{ ...s.body, marginBottom: 28 }}>
              {mode === "signin"
                ? "Sign in to your TutorDash workspace."
                : "Set up your tutor workspace in minutes."}
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input
                  className="td-input"
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
                <label style={s.label}>Password</label>
                <input
                  className="td-input"
                  style={s.input}
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {mode === "signup" && (
                  <span style={{ fontSize: 12, color: "#939084", marginTop: 4 }}>
                    Minimum 6 characters
                  </span>
                )}
              </div>

              {error && (
                <div style={s.errorBox}>
                  <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: "#dc2626", lineHeight: 1.4 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="td-btn-primary"
                disabled={busy}
                style={{ ...s.btnPrimary, marginTop: 4, opacity: busy ? 0.7 : 1, cursor: busy ? "not-allowed" : "pointer" }}
              >
                {busy
                  ? "Please wait…"
                  : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            <p style={{ marginTop: 22, textAlign: "center", fontSize: 14, color: "#939084" }}>
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button
                className="td-link-btn"
                style={s.linkBtn}
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>

      <p style={{ marginTop: 28, fontSize: 13, color: "#939084" }}>
        © {new Date().getFullYear()} TutorDash
      </p>
    </div>
  );
}

const font = "'Inter', system-ui, -apple-system, sans-serif";

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fffefb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: font,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoMark: {
    width: 40,
    height: 40,
    background: "#ff4f00",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 600,
    color: "#201515",
    fontFamily: font,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "#f8f4f0",
    border: "1px solid #c5c0b1",
    borderRadius: 12,
    padding: 32,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#939084",
    marginBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: 600,
    color: "#201515",
    marginBottom: 6,
    fontFamily: font,
  },
  body: {
    fontSize: 15,
    lineHeight: 1.55,
    color: "#605d52",
    fontFamily: font,
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: "#201515",
    fontFamily: font,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: 15,
    background: "#fffefb",
    border: "1.5px solid #201515",
    borderRadius: 8,
    color: "#201515",
    fontFamily: font,
    boxSizing: "border-box" as const,
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: "#fff1f1",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "10px 12px",
  },
  btnPrimary: {
    width: "100%",
    padding: "13px 24px",
    fontSize: 15,
    fontWeight: 600,
    background: "#ff4f00",
    color: "#fffefb",
    border: "none",
    borderRadius: 12,
    fontFamily: font,
    transition: "background 0.15s, transform 0.1s",
  },
  linkBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: "#ff4f00",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontFamily: font,
    transition: "color 0.15s",
  },
};
