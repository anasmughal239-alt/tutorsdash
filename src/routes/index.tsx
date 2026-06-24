import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarDays, FolderOpen, TrendingUp, CheckSquare, ClipboardList, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const features = [
  {
    icon: Users,
    title: "Student Management",
    desc: "Every student's contact, progress, and module history in one place. No more lost sticky notes.",
    featured: true,
  },
  {
    icon: CalendarDays,
    title: "Lesson Scheduling",
    desc: "Schedule lessons, set topics, and see your full week at a glance.",
    featured: false,
  },
  {
    icon: CheckSquare,
    title: "Attendance Tracking",
    desc: "Mark attendance in seconds. Monthly rates calculated automatically.",
    featured: false,
  },
  {
    icon: ClipboardList,
    title: "Assignments",
    desc: "Create tasks, assign to students, and track who's submitted what.",
    featured: false,
  },
  {
    icon: TrendingUp,
    title: "Progress Reports",
    desc: "Auto-generated reports with grades, attendance %, and completion — ready to share.",
    featured: false,
  },
  {
    icon: FolderOpen,
    title: "Materials Upload",
    desc: "Upload PDFs and notes per module. Students download from their own portal link.",
    featured: true,
  },
];

function LandingPage() {
  return (
    <>
      <style>{`
        .td-landing {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #0B0B0D;
          color: #F2EDE6;
          min-height: 100vh;
        }

        .td-landing * { box-sizing: border-box; }

        .td-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        @keyframes td-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .td-u1 { animation: td-up 0.75s cubic-bezier(.22,.68,0,1.2) both; }
        .td-u2 { animation: td-up 0.75s 0.12s cubic-bezier(.22,.68,0,1.2) both; }
        .td-u3 { animation: td-up 0.75s 0.24s cubic-bezier(.22,.68,0,1.2) both; }
        .td-u4 { animation: td-up 0.75s 0.36s cubic-bezier(.22,.68,0,1.2) both; }
        .td-u5 { animation: td-up 0.75s 0.48s cubic-bezier(.22,.68,0,1.2) both; }

        .td-gold {
          background: linear-gradient(120deg, #E6AA60, #C8883A, #F0C070);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .td-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(11,11,13,0.82);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .td-nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 28px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .td-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .td-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          background: #C8883A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .td-logo-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          color: #F2EDE6;
          letter-spacing: 0.02em;
        }

        .td-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #C8883A;
          color: #0B0B0D;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.01em;
          padding: 10px 22px;
          border-radius: 7px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          border: none;
          cursor: pointer;
        }

        .td-btn-primary:hover {
          background: #E0A040;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(200,136,58,0.3);
        }

        .td-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          color: #C9C0B4;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          font-size: 15px;
          padding: 11px 26px;
          border-radius: 7px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.1);
          transition: border-color 0.2s, color 0.2s;
          cursor: pointer;
        }

        .td-btn-ghost:hover {
          border-color: rgba(200,136,58,0.4);
          color: #F2EDE6;
        }

        .td-hero {
          padding: 96px 28px 72px;
          text-align: center;
          background:
            radial-gradient(ellipse 70% 55% at 50% -10%, rgba(200,136,58,0.1), transparent),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(200,136,58,0.06), transparent),
            #0B0B0D;
        }

        .td-hero-inner { max-width: 820px; margin: 0 auto; }

        .td-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(200,136,58,0.1);
          border: 1px solid rgba(200,136,58,0.25);
          border-radius: 100px;
          padding: 6px 15px;
          margin-bottom: 36px;
          font-size: 12.5px;
          color: #D4944A;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .td-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #C8883A;
          animation: td-pulse 2s infinite;
        }

        @keyframes td-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .td-h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(52px, 8vw, 96px);
          font-weight: 500;
          line-height: 1.02;
          letter-spacing: -0.015em;
          margin: 0 0 26px;
          color: #F2EDE6;
        }

        .td-sub {
          font-size: 18px;
          line-height: 1.7;
          color: #9E9488;
          max-width: 460px;
          margin: 0 auto 44px;
          font-weight: 400;
        }

        .td-cta-group {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .td-cta-large {
          padding: 15px 32px;
          font-size: 15px;
          border-radius: 8px;
        }

        /* Stats */
        .td-stats {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 28px;
        }

        .td-stats-card {
          background: #111113;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          overflow: hidden;
        }

        .td-stat {
          padding: 36px 28px;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .td-stat:last-child { border-right: none; }

        .td-stat-num {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 52px;
          font-weight: 500;
          color: #C8883A;
          line-height: 1;
          margin-bottom: 8px;
        }

        .td-stat-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #F2EDE6;
          margin-bottom: 4px;
        }

        .td-stat-sub {
          font-size: 12px;
          color: #6B6560;
        }

        /* Features */
        .td-features {
          max-width: 1120px;
          margin: 88px auto;
          padding: 0 28px;
        }

        .td-section-head {
          text-align: center;
          margin-bottom: 56px;
        }

        .td-h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(36px, 4.5vw, 56px);
          font-weight: 500;
          color: #F2EDE6;
          line-height: 1.08;
          margin: 0 0 14px;
        }

        .td-section-sub {
          font-size: 15.5px;
          color: #7A7268;
          max-width: 380px;
          margin: 0 auto;
          line-height: 1.65;
        }

        .td-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .td-card {
          background: #111113;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 30px;
          transition: border-color 0.25s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }

        .td-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,136,58,0.05), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .td-card:hover {
          border-color: rgba(200,136,58,0.3);
          transform: translateY(-3px);
        }

        .td-card:hover::before { opacity: 1; }

        .td-card-featured {
          grid-column: span 2;
          background: linear-gradient(135deg, #141208, #111010);
          border-color: rgba(200,136,58,0.15);
        }

        .td-card-icon {
          width: 46px;
          height: 46px;
          border-radius: 11px;
          background: rgba(200,136,58,0.1);
          border: 1px solid rgba(200,136,58,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
        }

        .td-card-title {
          font-weight: 600;
          font-size: 15.5px;
          color: #F2EDE6;
          margin: 0 0 10px;
        }

        .td-card-desc {
          font-size: 14px;
          color: #7A7268;
          line-height: 1.65;
          margin: 0;
        }

        /* CTA section */
        .td-cta-section {
          max-width: 1064px;
          margin: 0 auto 88px;
          padding: 0 28px;
        }

        .td-cta-inner {
          background: linear-gradient(135deg, #18120A, #16100B, #0F0D0A);
          border: 1px solid rgba(200,136,58,0.2);
          border-radius: 18px;
          padding: 72px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .td-cta-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(200,136,58,0.07), transparent);
          pointer-events: none;
        }

        .td-cta-corner {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(200,136,58,0.04);
          filter: blur(40px);
        }

        .td-cta-h {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 500;
          color: #F2EDE6;
          margin: 0 0 14px;
          position: relative;
        }

        .td-cta-p {
          font-size: 15.5px;
          color: #7A7268;
          margin: 0 0 36px;
          position: relative;
        }

        /* Footer */
        .td-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 32px 28px;
          text-align: center;
        }

        .td-footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .td-footer-mark {
          width: 24px;
          height: 24px;
          border-radius: 5px;
          background: #C8883A;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .td-footer-copy {
          font-size: 12px;
          color: #4A4540;
        }

        /* Divider */
        .td-sep {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.08);
          margin: 0 auto 0;
        }

        /* Decorative number in hero */
        .td-hero-deco {
          position: absolute;
          right: -30px;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'Cormorant Garamond', serif;
          font-size: 320px;
          font-weight: 600;
          color: rgba(200,136,58,0.03);
          line-height: 1;
          user-select: none;
          pointer-events: none;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .td-stats-card { grid-template-columns: 1fr; }
          .td-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
          .td-stat:last-child { border-bottom: none; }
          .td-grid { grid-template-columns: 1fr; }
          .td-card-featured { grid-column: span 1; }
          .td-h1 { font-size: clamp(44px, 11vw, 72px); }
        }
      `}</style>

      <div className="td-landing">

        {/* Nav */}
        <nav className="td-nav">
          <div className="td-nav-inner">
            <div className="td-logo">
              <div className="td-logo-mark">
                <Sparkles size={14} color="#0B0B0D" />
              </div>
              <span className="td-logo-name">TutorDash</span>
            </div>
            <Link to="/dashboard" className="td-btn-primary">
              Open Dashboard
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="td-hero" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="td-hero-inner">
            <div className="td-u1">
              <div className="td-pill">
                <span className="td-pill-dot" />
                Built for independent tutors
              </div>
            </div>

            <h1 className="td-h1 td-u2">
              Your students.<br />
              Your schedule.<br />
              <span className="td-gold">Your classroom.</span>
            </h1>

            <p className="td-sub td-u3">
              Stop juggling WhatsApp messages and Excel sheets. TutorDash gives you a real workspace to run your tutoring like a professional.
            </p>

            <div className="td-cta-group td-u4">
              <Link to="/dashboard" className="td-btn-primary td-cta-large">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link to="/dashboard" className="td-btn-ghost td-cta-large">
                Open Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="td-stats td-u5">
          <div className="td-stats-card">
            {[
              { num: "9", label: "Core Features", sub: "Students to progress reports" },
              { num: "2m", label: "Setup Time", sub: "From first click to first student" },
              { num: "0", label: "Spreadsheets Needed", sub: "Everything lives in one place" },
            ].map((s, i) => (
              <div key={i} className="td-stat">
                <div className="td-stat-num">{s.num}</div>
                <div className="td-stat-label">{s.label}</div>
                <div className="td-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <section className="td-features">
          <div className="td-section-head">
            <h2 className="td-h2">Everything a tutor needs</h2>
            <p className="td-section-sub">
              One workspace for all your tutoring operations — built for clarity, not complexity.
            </p>
          </div>

          <div className="td-grid">
            {/* Row 1: featured (span 2) + normal */}
            <div className="td-card td-card-featured">
              <div className="td-card-icon">
                <Users size={21} color="#C8883A" />
              </div>
              <h3 className="td-card-title">Student Management</h3>
              <p className="td-card-desc">Every student's contact details, assigned modules, progress, and history in one place. No more lost sticky notes or WhatsApp scrolling.</p>
            </div>
            <div className="td-card">
              <div className="td-card-icon">
                <CalendarDays size={21} color="#C8883A" />
              </div>
              <h3 className="td-card-title">Lesson Scheduling</h3>
              <p className="td-card-desc">Schedule lessons with dates, times, and topics. See your full week at a glance on the dashboard.</p>
            </div>

            {/* Row 2: normal + featured (span 2) */}
            <div className="td-card">
              <div className="td-card-icon">
                <CheckSquare size={21} color="#C8883A" />
              </div>
              <h3 className="td-card-title">Attendance Tracking</h3>
              <p className="td-card-desc">Mark present, absent, or late in seconds. Monthly attendance rates calculated automatically.</p>
            </div>
            <div className="td-card td-card-featured">
              <div className="td-card-icon">
                <FolderOpen size={21} color="#C8883A" />
              </div>
              <h3 className="td-card-title">Materials Upload</h3>
              <p className="td-card-desc">Upload PDFs, notes, and docs organized by module and topic. Students get their own portal link to download everything — no WhatsApp file sharing needed.</p>
            </div>

            {/* Row 3: two normal cards */}
            <div className="td-card">
              <div className="td-card-icon">
                <ClipboardList size={21} color="#C8883A" />
              </div>
              <h3 className="td-card-title">Assignments</h3>
              <p className="td-card-desc">Create assignments, assign to students, and track who's submitted and who's pending.</p>
            </div>
            <div className="td-card">
              <div className="td-card-icon">
                <TrendingUp size={21} color="#C8883A" />
              </div>
              <h3 className="td-card-title">Progress Reports</h3>
              <p className="td-card-desc">Auto-generated reports with grades, attendance percentage, and assignment completion. Ready to share with students or parents.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="td-cta-section">
          <div className="td-cta-inner">
            <div className="td-cta-glow" />
            <div className="td-cta-corner" style={{ top: -60, left: -60 }} />
            <div className="td-cta-corner" style={{ bottom: -60, right: -60 }} />
            <h2 className="td-cta-h">Ready to get professional?</h2>
            <p className="td-cta-p">Set up your workspace in under 2 minutes. No credit card, no setup fee.</p>
            <Link to="/dashboard" className="td-btn-primary td-cta-large" style={{ position: 'relative' }}>
              Start for free <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="td-footer">
          <div className="td-footer-logo">
            <div className="td-footer-mark">
              <Sparkles size={11} color="#0B0B0D" />
            </div>
            <span className="td-serif" style={{ fontSize: 14, color: '#4A4540' }}>TutorDash</span>
          </div>
          <p className="td-footer-copy">© {new Date().getFullYear()} TutorDash. Made for tutors who mean business.</p>
        </footer>

      </div>
    </>
  );
}
