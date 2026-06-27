import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle, Zap, ArrowLeft } from "lucide-react";
import { useSubscription } from "@/lib/subscription";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

// TODO: Replace with your WhatsApp number (country code + number, no +)
const WA_NUMBER = "923062502316";

function waLink(plan: string, email: string) {
  const msg = `Hi! I'd like to subscribe to TutorDash ${plan} plan.\nMy registered email: ${email || "(please include your email)"}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "500",
    description: "For tutors with a small group of students.",
    features: [
      "Up to 5 students",
      "All tutor features",
      "Lesson scheduling",
      "Attendance tracking",
      "Grades & progress reports",
      "Student portal (share link)",
      "Material uploads",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "999",
    description: "For active tutors and school teachers.",
    features: [
      "Unlimited students",
      "Everything in Starter",
      "School mode",
      "Class attendance register",
      "Scheme of work planner",
      "PTM report cards (PDF)",
      "Teacher diary",
      "Inspector-ready export",
    ],
    highlight: true,
  },
];

function PricingPage() {
  const { user } = useAuth();
  const sub = useSubscription();

  return (
    <div style={{ minHeight: "100vh", background: "#fffefb", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #c5c0b1", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fffefb", zIndex: 10 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, background: "#ff4f00", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={14} color="#fffefb" />
          </div>
          <span style={{ fontWeight: 600, color: "#201515", fontSize: 15 }}>TutorDash</span>
        </Link>
        {user ? (
          <Link to="/dashboard" style={{ background: "#ff4f00", color: "#fff", padding: "8px 18px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Dashboard
          </Link>
        ) : (
          <Link to="/login" style={{ background: "#201515", color: "#fff", padding: "8px 18px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Sign in
          </Link>
        )}
      </nav>

      {/* Back link */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#939084", textDecoration: "none" }}>
          <ArrowLeft size={13} /> Back to home
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "40px 24px 48px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#939084", marginBottom: 12 }}>Pricing</p>
        <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 500, color: "#201515", lineHeight: 1.1, marginBottom: 14 }}>
          Simple, honest pricing.
        </h1>
        <p style={{ fontSize: 17, color: "#605d52", maxWidth: 440, margin: "0 auto 20px", lineHeight: 1.6 }}>
          No free tier. Pay once a month — cancel any time.
        </p>

        {!sub.loading && sub.plan === "trial" && !sub.isExpired && sub.daysLeft !== null && (
          <div style={{ display: "inline-block", background: "#fff8e1", border: "1px solid #ffca28", borderRadius: 8, padding: "8px 18px", fontSize: 14, color: "#b45309", fontWeight: 500 }}>
            Your free trial ends in {sub.daysLeft} day{sub.daysLeft !== 1 ? "s" : ""}
          </div>
        )}
        {!sub.loading && sub.isExpired && (
          <div style={{ display: "inline-block", background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 8, padding: "8px 18px", fontSize: 14, color: "#c62828", fontWeight: 500 }}>
            Your trial has ended — choose a plan below to continue.
          </div>
        )}
        {!sub.loading && (sub.plan === "starter" || sub.plan === "pro") && (
          <div style={{ display: "inline-block", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 8, padding: "8px 18px", fontSize: 14, color: "#2e7d32", fontWeight: 500 }}>
            You're on the <strong>{sub.plan === "pro" ? "Pro" : "Starter"}</strong> plan
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {PLANS.map((plan) => (
          <div key={plan.id} style={{
            border: plan.highlight ? "2px solid #ff4f00" : "1.5px solid #c5c0b1",
            borderRadius: 16,
            padding: "28px 28px 32px",
            position: "relative",
            background: plan.highlight ? "#fff8f5" : "#fff",
          }}>
            {plan.highlight && (
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#ff4f00", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 999, letterSpacing: 0.8, whiteSpace: "nowrap" }}>
                MOST POPULAR
              </div>
            )}
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#201515", marginBottom: 4 }}>{plan.name}</h2>
            <p style={{ fontSize: 13, color: "#939084", marginBottom: 20 }}>{plan.description}</p>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 42, fontWeight: 700, color: "#201515", lineHeight: 1 }}>Rs {plan.price}</span>
              <span style={{ fontSize: 14, color: "#939084" }}>/month</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#2f2a26", lineHeight: 1.4 }}>
                  <Check size={15} color="#ff4f00" style={{ marginTop: 1, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={waLink(plan.name, user?.email ?? "")}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "13px 0", borderRadius: 10,
                background: plan.highlight ? "#ff4f00" : "#201515",
                color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none",
                transition: "opacity .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <MessageCircle size={16} />
              Subscribe via WhatsApp
            </a>
          </div>
        ))}
      </div>

      {/* How to subscribe */}
      <div style={{ maxWidth: 820, margin: "36px auto 0", padding: "0 24px 64px" }}>
        <div style={{ background: "#f8f4f0", border: "1px solid #c5c0b1", borderRadius: 14, padding: "24px 28px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#201515", marginBottom: 14 }}>How to subscribe</h3>
          <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#605d52", lineHeight: 1.6 }}>
            <li>Choose a plan above and tap <strong>"Subscribe via WhatsApp"</strong></li>
            <li>Transfer the amount via <strong>JazzCash / EasyPaisa / bank transfer</strong></li>
            <li>Send us your <strong>payment screenshot</strong> and the email you used to sign up</li>
            <li>We'll activate your plan within <strong>2 hours</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
