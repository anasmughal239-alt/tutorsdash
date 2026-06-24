import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarDays, FolderOpen, TrendingUp, CheckSquare, ClipboardList, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const features = [
  { icon: Users,        title: "Student Management", desc: "Every student's details, modules, and history in one profile. Nothing lost." },
  { icon: CalendarDays, title: "Lesson Scheduling",  desc: "Plan lessons with dates, topics, and notes. See your full week at a glance." },
  { icon: CheckSquare,  title: "Attendance Tracking",desc: "Mark present or absent in a tap. Monthly rates calculated automatically." },
  { icon: ClipboardList,title: "Assignments",        desc: "Assign tasks, track submissions, and know exactly who's behind." },
  { icon: TrendingUp,   title: "Progress Reports",   desc: "Auto-generated reports with grades, attendance %, and completion rates." },
  { icon: FolderOpen,   title: "Materials Upload",   desc: "Organise PDFs by module. Students access files from their own portal link." },
];

const mockStudents = [
  { name: "Ali Hassan",   module: "IELTS Speaking", status: "Active",  dot: "#22C55E", bg: "#F0FDF4", tx: "#16A34A" },
  { name: "Fatima Malik", module: "Sociology",      status: "Active",  dot: "#22C55E", bg: "#F0FDF4", tx: "#16A34A" },
  { name: "Ahmed Raza",   module: "IELTS Writing",  status: "Pending", dot: "#F59E0B", bg: "#FFFBEB", tx: "#D97706" },
  { name: "Sara Khan",    module: "Math Grade 9",   status: "Active",  dot: "#22C55E", bg: "#F0FDF4", tx: "#16A34A" },
];

function LandingPage() {
  return (
    <>
      <style>{`
        .td { font-family: 'Instrument Sans', system-ui, sans-serif; background: #fff; color: #0F172A; min-height: 100vh; -webkit-font-smoothing: antialiased; }
        .td *, .td *::before, .td *::after { box-sizing: border-box; }

        /* ── Nav ── */
        .td-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid #E2E8F0; }
        .td-nav-in { max-width: 1140px; margin: 0 auto; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .td-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .td-logo-mark { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg,#6366F1,#8B5CF6); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(99,102,241,.28); }
        .td-logo-name { font-size: 17px; font-weight: 700; color: #0F172A; letter-spacing: -.025em; }

        /* ── Buttons ── */
        .td-btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'Instrument Sans', sans-serif; font-weight: 600; font-size: 14px; border-radius: 8px; text-decoration: none; transition: all .15s ease; cursor: pointer; border: none; letter-spacing: -.01em; line-height: 1; }
        .td-pri { background: #6366F1; color: #fff; padding: 11px 20px; box-shadow: 0 1px 2px rgba(99,102,241,.2),0 4px 12px rgba(99,102,241,.14); }
        .td-pri:hover { background: #5558EB; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(99,102,241,.2),0 8px 20px rgba(99,102,241,.22); }
        .td-pri-lg { padding: 14px 28px; font-size: 15px; }
        .td-ghost { background: transparent; color: #475569; padding: 11px 20px; border: 1px solid #E2E8F0; }
        .td-ghost:hover { background: #F8FAFC; color: #0F172A; border-color: #CBD5E1; }
        .td-ghost-lg { padding: 13px 24px; font-size: 15px; }
        .td-wht { display: inline-flex; align-items: center; gap: 7px; background: #fff; color: #0F172A; padding: 14px 28px; font-size: 15px; border-radius: 8px; font-weight: 700; text-decoration: none; transition: all .15s; letter-spacing: -.015em; position: relative; }
        .td-wht:hover { background: #F1F5F9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,.18); }

        /* ── Hero ── */
        .td-hero { padding: 104px 32px 88px; text-align: center; position: relative; overflow: hidden; }
        .td-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 90% 65% at 50% -10%,rgba(99,102,241,.1),transparent), radial-gradient(ellipse 55% 45% at 82% 85%,rgba(139,92,246,.06),transparent), radial-gradient(ellipse 55% 45% at 18% 75%,rgba(6,182,212,.05),transparent); pointer-events: none; }
        .td-dots { position: absolute; inset: 0; background-image: radial-gradient(circle,#CBD5E1 1px,transparent 1px); background-size: 30px 30px; mask-image: radial-gradient(ellipse 75% 55% at 50% 50%,black 25%,transparent 70%); -webkit-mask-image: radial-gradient(ellipse 75% 55% at 50% 50%,black 25%,transparent 70%); pointer-events: none; opacity: .55; }
        .td-hero-in { max-width: 800px; margin: 0 auto; position: relative; }

        .td-badge { display: inline-flex; align-items: center; gap: 7px; background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 100px; padding: 5px 14px; margin-bottom: 28px; font-size: 12.5px; color: #4F46E5; font-weight: 600; letter-spacing: -.005em; }
        .td-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366F1; animation: td-pulse 2s infinite; }
        @keyframes td-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }

        @keyframes td-up { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        .td-a1{animation:td-up .65s ease both}
        .td-a2{animation:td-up .65s .1s ease both}
        .td-a3{animation:td-up .65s .2s ease both}
        .td-a4{animation:td-up .65s .3s ease both}

        .td-h1 { font-size: clamp(42px,6.5vw,76px); font-weight: 700; line-height: 1.04; letter-spacing: -.035em; color: #0F172A; margin: 0 0 22px; }
        .td-grad { background: linear-gradient(135deg,#6366F1 0%,#8B5CF6 45%,#06B6D4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .td-sub { font-size: 19px; line-height: 1.65; color: #64748B; max-width: 490px; margin: 0 auto 40px; font-weight: 400; font-family: 'DM Sans', sans-serif; letter-spacing: -.01em; }
        .td-cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; align-items: center; }
        .td-proof { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 22px; font-size: 13px; color: #94A3B8; font-family: 'DM Sans', sans-serif; }

        /* ── Stats ── */
        .td-stats { background: #F8FAFC; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; }
        .td-stats-in { max-width: 1140px; margin: 0 auto; padding: 0 32px; display: grid; grid-template-columns: repeat(3,1fr); }
        .td-stat { padding: 44px 32px; text-align: center; border-right: 1px solid #E2E8F0; }
        .td-stat:last-child { border-right: none; }
        .td-stat-n { font-size: 50px; font-weight: 700; letter-spacing: -.04em; line-height: 1; margin-bottom: 6px; background: linear-gradient(135deg,#6366F1,#8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .td-stat-l { font-size: 15px; font-weight: 600; color: #0F172A; margin-bottom: 4px; letter-spacing: -.015em; }
        .td-stat-s { font-size: 13px; color: #94A3B8; font-family: 'DM Sans', sans-serif; }

        /* ── Features ── */
        .td-feats { max-width: 1140px; margin: 0 auto; padding: 96px 32px; }
        .td-sect-lbl { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6366F1; margin-bottom: 12px; }
        .td-h2 { font-size: clamp(30px,3.5vw,46px); font-weight: 700; letter-spacing: -.03em; line-height: 1.1; color: #0F172A; margin: 0 0 14px; }
        .td-sect-sub { font-size: 17px; color: #64748B; max-width: 440px; line-height: 1.65; font-family: 'DM Sans', sans-serif; letter-spacing: -.01em; }
        .td-sect-head { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: end; margin-bottom: 52px; }
        .td-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #E2E8F0; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
        .td-card { background: #fff; padding: 32px 28px; transition: background .15s; }
        .td-card:hover { background: #FAFBFF; }
        .td-card-ico { width: 44px; height: 44px; border-radius: 10px; background: #EEF2FF; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
        .td-card-t { font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -.02em; margin: 0 0 8px; }
        .td-card-d { font-size: 14px; color: #64748B; line-height: 1.6; font-family: 'DM Sans', sans-serif; margin: 0; }

        /* ── Highlight ── */
        .td-hl { background: #F8FAFC; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; }
        .td-hl-in { max-width: 1140px; margin: 0 auto; padding: 88px 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .td-hl-visual { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,.06),0 1px 4px rgba(0,0,0,.04); }
        .td-hl-head { font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 16px; }
        .td-row { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
        .td-row:last-child { margin-bottom: 0; }
        .td-row-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .td-row-name { font-size: 13.5px; font-weight: 600; color: #0F172A; letter-spacing: -.01em; flex: 1; }
        .td-row-mod { font-size: 12px; color: #94A3B8; font-family: 'DM Sans', sans-serif; }
        .td-pill { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; letter-spacing: .01em; }

        /* ── CTA ── */
        .td-cta { max-width: 1140px; margin: 0 auto; padding: 32px 32px 96px; }
        .td-cta-box { background: linear-gradient(140deg,#0F172A 0%,#1E1B4B 55%,#1E1B4B 100%); border-radius: 20px; padding: 80px 48px; text-align: center; position: relative; overflow: hidden; }
        .td-cta-mesh { position: absolute; inset: 0; background: radial-gradient(ellipse 55% 65% at 28% 50%,rgba(99,102,241,.3),transparent), radial-gradient(ellipse 45% 55% at 72% 50%,rgba(6,182,212,.18),transparent); pointer-events: none; }
        .td-cta-h { font-size: clamp(30px,3.5vw,46px); font-weight: 700; letter-spacing: -.03em; color: #fff; margin: 0 0 14px; position: relative; }
        .td-cta-p { font-size: 17px; color: rgba(255,255,255,.55); margin: 0 0 36px; position: relative; font-family: 'DM Sans', sans-serif; letter-spacing: -.01em; }

        /* ── Footer ── */
        .td-foot-wrap { border-top: 1px solid #E2E8F0; }
        .td-foot { max-width: 1140px; margin: 0 auto; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; }
        .td-foot-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .td-foot-mark { width: 26px; height: 26px; border-radius: 6px; background: linear-gradient(135deg,#6366F1,#8B5CF6); display: flex; align-items: center; justify-content: center; }
        .td-foot-name { font-size: 14px; font-weight: 700; color: #0F172A; letter-spacing: -.02em; }
        .td-foot-copy { font-size: 13px; color: #94A3B8; font-family: 'DM Sans', sans-serif; }

        @media (max-width: 768px) {
          .td-stats-in { grid-template-columns: 1fr; }
          .td-stat { border-right: none; border-bottom: 1px solid #E2E8F0; }
          .td-stat:last-child { border-bottom: none; }
          .td-grid { grid-template-columns: 1fr; }
          .td-sect-head { grid-template-columns: 1fr; gap: 16px; }
          .td-hl-in { grid-template-columns: 1fr; gap: 40px; }
          .td-foot { flex-direction: column; gap: 10px; text-align: center; }
          .td-cta-box { padding: 56px 24px; }
          .td-nav-in { padding: 0 20px; }
          .td-hero { padding: 72px 20px 64px; }
        }
      `}</style>

      <div className="td">

        {/* Nav */}
        <nav className="td-nav">
          <div className="td-nav-in">
            <div className="td-logo">
              <div className="td-logo-mark"><Sparkles size={15} color="#fff" /></div>
              <span className="td-logo-name">TutorDash</span>
            </div>
            <Link to="/dashboard" className="td-btn td-pri">Open Dashboard</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="td-hero">
          <div className="td-hero-glow" />
          <div className="td-dots" />
          <div className="td-hero-in">
            <div className="td-a1">
              <div className="td-badge"><span className="td-badge-dot" />Purpose-built for tutors</div>
            </div>
            <h1 className="td-h1 td-a2">
              The professional toolkit<br />for <span className="td-grad">independent tutors</span>
            </h1>
            <p className="td-sub td-a3">
              Replace your spreadsheets and WhatsApp chaos with one clean dashboard. Students, lessons, attendance, grades — all in one place.
            </p>
            <div className="td-cta-row td-a4">
              <Link to="/dashboard" className="td-btn td-pri td-pri-lg">Get started free <ArrowRight size={16} /></Link>
              <Link to="/dashboard" className="td-btn td-ghost td-ghost-lg">Open Dashboard</Link>
            </div>
            <div className="td-proof td-a4">
              <span>Free to use</span><span>·</span>
              <span>No credit card</span><span>·</span>
              <span>2 minute setup</span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="td-stats">
          <div className="td-stats-in">
            {[
              { n: "9+",   l: "Core Features",      s: "Students to progress reports" },
              { n: "2 min",l: "Setup Time",          s: "First student added in minutes" },
              { n: "100%", l: "Spreadsheet-Free",    s: "Everything in one dashboard" },
            ].map((s, i) => (
              <div key={i} className="td-stat">
                <div className="td-stat-n">{s.n}</div>
                <div className="td-stat-l">{s.l}</div>
                <div className="td-stat-s">{s.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <section className="td-feats">
          <div className="td-sect-head">
            <div>
              <div className="td-sect-lbl">Features</div>
              <h2 className="td-h2">Everything you need,<br />nothing you don't</h2>
            </div>
            <p className="td-sect-sub">
              TutorDash gives you the right tools to run your tutoring professionally — without the complexity of enterprise software.
            </p>
          </div>
          <div className="td-grid">
            {features.map((f) => (
              <div key={f.title} className="td-card">
                <div className="td-card-ico"><f.icon size={20} color="#6366F1" /></div>
                <p className="td-card-t">{f.title}</p>
                <p className="td-card-d">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Student preview highlight */}
        <div className="td-hl">
          <div className="td-hl-in">
            <div>
              <div className="td-sect-lbl">Student Management</div>
              <h2 className="td-h2" style={{ fontSize: "clamp(26px,2.8vw,38px)", marginBottom: 16 }}>
                Every student,<br />perfectly organised
              </h2>
              <p className="td-sect-sub">
                Add students once and track everything — modules, attendance, grades, and assignments — from a single profile. Share a portal link and they access their materials instantly.
              </p>
              <div style={{ marginTop: 28 }}>
                <Link to="/dashboard" className="td-btn td-pri">Try it now <ArrowRight size={14} /></Link>
              </div>
            </div>
            <div className="td-hl-visual">
              <div className="td-hl-head">Your Students</div>
              {mockStudents.map((s) => (
                <div key={s.name} className="td-row">
                  <span className="td-row-dot" style={{ background: s.dot }} />
                  <div style={{ flex: 1 }}>
                    <div className="td-row-name">{s.name}</div>
                    <div className="td-row-mod">{s.module}</div>
                  </div>
                  <span className="td-pill" style={{ background: s.bg, color: s.tx }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="td-cta">
          <div className="td-cta-box">
            <div className="td-cta-mesh" />
            <h2 className="td-cta-h">Start your dashboard today</h2>
            <p className="td-cta-p">Set up in 2 minutes. No credit card. No setup fee.</p>
            <Link to="/dashboard" className="td-wht">Get started free <ArrowRight size={16} /></Link>
          </div>
        </div>

        {/* Footer */}
        <div className="td-foot-wrap">
          <div className="td-foot">
            <div className="td-foot-logo">
              <div className="td-foot-mark"><Sparkles size={12} color="#fff" /></div>
              <span className="td-foot-name">TutorDash</span>
            </div>
            <span className="td-foot-copy">© {new Date().getFullYear()} TutorDash. Made for tutors who mean business.</span>
          </div>
        </div>

      </div>
    </>
  );
}
