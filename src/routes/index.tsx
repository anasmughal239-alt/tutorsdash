import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarDays, FolderOpen, TrendingUp, CheckSquare, ClipboardList, ArrowRight, Sparkles, BookOpen, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        .lp { font-family: 'Inter', sans-serif; background: #fff; color: #111827; min-height: 100vh; -webkit-font-smoothing: antialiased; }
        .lp *, .lp *::before, .lp *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* NAV */
        .lp-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid #F3F4F6; }
        .lp-nav-in { max-width: 1180px; margin: 0 auto; padding: 0 28px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        .lp-brand { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .lp-brand-icon { width: 32px; height: 32px; border-radius: 8px; background: #111827; display: flex; align-items: center; justify-content: center; }
        .lp-brand-name { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #111827; }

        .lp-btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 8px; transition: all .15s; cursor: pointer; border: none; }
        .lp-btn-sm { padding: 9px 18px; }
        .lp-btn-md { padding: 13px 26px; font-size: 15px; }
        .lp-primary { background: #111827; color: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.15); }
        .lp-primary:hover { background: #1F2937; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.2); }
        .lp-outline { background: transparent; color: #374151; border: 1.5px solid #E5E7EB; }
        .lp-outline:hover { border-color: #9CA3AF; background: #F9FAFB; }

        /* HERO */
        .lp-hero { padding: 72px 28px 0; max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; min-height: calc(100vh - 60px); }
        .lp-hero-left { padding-bottom: 72px; }
        .lp-hero-right { position: relative; padding-bottom: 0; align-self: end; }

        .lp-tag { display: inline-flex; align-items: center; gap: 7px; background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 100px; padding: 4px 12px; margin-bottom: 24px; font-size: 12px; color: #92400E; font-weight: 600; letter-spacing: .01em; }
        .lp-tag-dot { width: 5px; height: 5px; border-radius: 50%; background: #F59E0B; animation: lp-blink 2s infinite; }
        @keyframes lp-blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        @keyframes lp-rise { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .lp-a1 { animation: lp-rise .6s ease both; }
        .lp-a2 { animation: lp-rise .6s .1s ease both; }
        .lp-a3 { animation: lp-rise .6s .2s ease both; }
        .lp-a4 { animation: lp-rise .6s .3s ease both; }
        .lp-a5 { animation: lp-rise .6s .4s ease both; }

        .lp-h1 { font-family: 'Syne', sans-serif; font-size: clamp(40px,4.8vw,64px); font-weight: 800; line-height: 1.06; letter-spacing: -.03em; color: #111827; margin-bottom: 20px; }
        .lp-amber { color: #D97706; }
        .lp-p { font-size: 17px; line-height: 1.7; color: #6B7280; max-width: 440px; margin-bottom: 36px; font-weight: 400; }
        .lp-cta-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 40px; }
        .lp-proof { display: flex; align-items: center; gap: 18px; }
        .lp-proof-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6B7280; }
        .lp-check { width: 16px; height: 16px; border-radius: 50%; background: #D1FAE5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* DASHBOARD MOCKUP */
        .lp-mock { border-radius: 14px 14px 0 0; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,.14), 0 4px 16px rgba(0,0,0,.06); border: 1px solid #E5E7EB; border-bottom: none; background: #fff; animation: lp-rise .8s .2s ease both; }
        .lp-mock-bar { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
        .lp-mock-dots { display: flex; gap: 5px; }
        .lp-mock-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-mock-url { flex: 1; background: #fff; border: 1px solid #E5E7EB; border-radius: 6px; padding: 4px 10px; font-size: 11px; color: #9CA3AF; font-family: monospace; }
        .lp-mock-body { display: grid; grid-template-columns: 180px 1fr; height: 380px; }
        .lp-mock-side { background: #111827; padding: 16px 12px; display: flex; flex-direction: column; gap: 3px; }
        .lp-mock-logo { display: flex; align-items: center; gap: 8px; padding: 8px 8px 16px; border-bottom: 1px solid rgba(255,255,255,.08); margin-bottom: 8px; }
        .lp-mock-logo-icon { width: 24px; height: 24px; border-radius: 5px; background: #F59E0B; display: flex; align-items: center; justify-content: center; }
        .lp-mock-logo-name { font-size: 12px; font-weight: 700; color: #fff; }
        .lp-mock-nav-item { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 6px; font-size: 11.5px; color: rgba(255,255,255,.5); transition: all .15s; }
        .lp-mock-nav-item.active { background: rgba(255,255,255,.1); color: #fff; }
        .lp-mock-main { padding: 20px; overflow: hidden; background: #F9FAFB; }
        .lp-mock-page-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 14px; }
        .lp-mock-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 14px; }
        .lp-mock-stat { background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 12px; }
        .lp-mock-stat-n { font-size: 20px; font-weight: 700; color: #111827; line-height: 1; }
        .lp-mock-stat-l { font-size: 10px; color: #9CA3AF; margin-top: 3px; }
        .lp-mock-stat-badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 100px; margin-top: 4px; }
        .lp-mock-table { background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
        .lp-mock-thead { display: grid; grid-template-columns: 2fr 1.5fr 1fr; padding: 8px 12px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
        .lp-mock-th { font-size: 9.5px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: .05em; }
        .lp-mock-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr; padding: 8px 12px; border-bottom: 1px solid #F3F4F6; align-items: center; }
        .lp-mock-row:last-child { border-bottom: none; }
        .lp-mock-name { font-size: 11px; font-weight: 600; color: #111827; }
        .lp-mock-mod { font-size: 10px; color: #9CA3AF; }
        .lp-mock-pill { display: inline-block; font-size: 9.5px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }

        /* STATS STRIP */
        .lp-strip { border-top: 1px solid #F3F4F6; border-bottom: 1px solid #F3F4F6; background: #FAFAFA; }
        .lp-strip-in { max-width: 1180px; margin: 0 auto; padding: 0 28px; display: grid; grid-template-columns: repeat(3,1fr); }
        .lp-strip-item { padding: 40px 24px; border-right: 1px solid #F3F4F6; text-align: center; }
        .lp-strip-item:last-child { border-right: none; }
        .lp-strip-n { font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; color: #111827; line-height: 1; letter-spacing: -.04em; margin-bottom: 6px; }
        .lp-strip-l { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px; }
        .lp-strip-s { font-size: 13px; color: #9CA3AF; }

        /* BENTO FEATURES */
        .lp-bento-wrap { max-width: 1180px; margin: 0 auto; padding: 96px 28px; }
        .lp-bento-header { margin-bottom: 48px; }
        .lp-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #D97706; margin-bottom: 12px; }
        .lp-h2 { font-family: 'Syne', sans-serif; font-size: clamp(32px,3.5vw,48px); font-weight: 800; letter-spacing: -.03em; color: #111827; line-height: 1.08; }

        .lp-bento { display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: 180px; gap: 14px; }
        .lp-b { border-radius: 14px; padding: 28px; overflow: hidden; position: relative; transition: transform .2s, box-shadow .2s; }
        .lp-b:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,.1); }
        .lp-b1 { grid-column: span 5; grid-row: span 1; background: #111827; color: #fff; }
        .lp-b2 { grid-column: span 7; grid-row: span 1; background: #FFFBEB; border: 1px solid #FDE68A; }
        .lp-b3 { grid-column: span 4; grid-row: span 1; background: #EFF6FF; border: 1px solid #BFDBFE; }
        .lp-b4 { grid-column: span 4; grid-row: span 1; background: #F0FDF4; border: 1px solid #BBF7D0; }
        .lp-b5 { grid-column: span 4; grid-row: span 1; background: #FDF4FF; border: 1px solid #E9D5FF; }
        .lp-b6 { grid-column: span 7; grid-row: span 1; background: #FFF7ED; border: 1px solid #FED7AA; }
        .lp-b7 { grid-column: span 5; grid-row: span 1; background: #F0F9FF; border: 1px solid #BAE6FD; }

        .lp-b-ico { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .lp-b-t { font-size: 15px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 8px; }
        .lp-b-d { font-size: 13.5px; line-height: 1.6; }

        /* HIGHLIGHT */
        .lp-hl { background: #FAFAFA; border-top: 1px solid #F3F4F6; border-bottom: 1px solid #F3F4F6; }
        .lp-hl-in { max-width: 1180px; margin: 0 auto; padding: 88px 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .lp-hl-vis { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,.05); }
        .lp-hl-ttl { font-size: 11px; font-weight: 700; color: #9CA3AF; letter-spacing: .07em; text-transform: uppercase; margin-bottom: 16px; }
        .lp-stu-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #FAFAFA; border: 1px solid #F3F4F6; border-radius: 10px; margin-bottom: 8px; }
        .lp-stu-row:last-child { margin-bottom: 0; }
        .lp-stu-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .lp-stu-name { font-size: 13.5px; font-weight: 600; color: #111827; flex: 1; }
        .lp-stu-mod { font-size: 12px; color: #9CA3AF; }
        .lp-stu-tag { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 100px; }

        /* CTA */
        .lp-cta { max-width: 1180px; margin: 0 auto; padding: 32px 28px 96px; }
        .lp-cta-box { background: #111827; border-radius: 20px; padding: 80px 48px; text-align: center; position: relative; overflow: hidden; }
        .lp-cta-glow { position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 500px; height: 300px; background: radial-gradient(ellipse,rgba(245,158,11,.25),transparent); pointer-events: none; }
        .lp-cta-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px); background-size: 40px 40px; pointer-events: none; }
        .lp-cta-h { font-family: 'Syne', sans-serif; font-size: clamp(32px,3.5vw,52px); font-weight: 800; letter-spacing: -.03em; color: #fff; margin-bottom: 14px; position: relative; }
        .lp-cta-p { font-size: 17px; color: rgba(255,255,255,.5); margin-bottom: 36px; position: relative; }
        .lp-cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #F59E0B; color: #111827; padding: 15px 32px; font-size: 15px; border-radius: 8px; font-weight: 700; text-decoration: none; transition: all .15s; position: relative; letter-spacing: -.01em; }
        .lp-cta-btn:hover { background: #FBBF24; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(245,158,11,.35); }

        /* FOOTER */
        .lp-foot { border-top: 1px solid #F3F4F6; }
        .lp-foot-in { max-width: 1180px; margin: 0 auto; padding: 28px; display: flex; align-items: center; justify-content: space-between; }
        .lp-foot-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .lp-foot-icon { width: 26px; height: 26px; border-radius: 6px; background: #111827; display: flex; align-items: center; justify-content: center; }
        .lp-foot-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #111827; }
        .lp-foot-copy { font-size: 13px; color: #9CA3AF; }

        @media (max-width: 900px) {
          .lp-hero { grid-template-columns: 1fr; min-height: auto; padding-top: 56px; }
          .lp-hero-right { display: none; }
          .lp-hero-left { padding-bottom: 56px; }
          .lp-strip-in { grid-template-columns: 1fr; }
          .lp-strip-item { border-right: none; border-bottom: 1px solid #F3F4F6; }
          .lp-strip-item:last-child { border-bottom: none; }
          .lp-bento { grid-template-columns: 1fr 1fr; grid-auto-rows: auto; }
          .lp-b1,.lp-b2,.lp-b3,.lp-b4,.lp-b5,.lp-b6,.lp-b7 { grid-column: span 1; }
          .lp-hl-in { grid-template-columns: 1fr; gap: 40px; }
          .lp-foot-in { flex-direction: column; gap: 10px; text-align: center; }
          .lp-cta-box { padding: 56px 24px; }
        }
        @media (max-width: 600px) {
          .lp-bento { grid-template-columns: 1fr; }
          .lp-mock-stats { grid-template-columns: repeat(2,1fr); }
          .lp-proof { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>

      <div className="lp">

        {/* NAV */}
        <nav className="lp-nav">
          <div className="lp-nav-in">
            <div className="lp-brand">
              <div className="lp-brand-icon"><Sparkles size={14} color="#F59E0B" /></div>
              <span className="lp-brand-name">TutorDash</span>
            </div>
            <Link to="/dashboard" className="lp-btn lp-primary lp-btn-sm">Open Dashboard</Link>
          </div>
        </nav>

        {/* HERO */}
        <div className="lp-hero">
          <div className="lp-hero-left">
            <div className="lp-a1">
              <div className="lp-tag"><span className="lp-tag-dot" />Purpose-built for independent tutors</div>
            </div>
            <h1 className="lp-h1 lp-a2">
              Your students.<br />
              Your schedule.<br />
              <span className="lp-amber">Your classroom.</span>
            </h1>
            <p className="lp-p lp-a3">
              Replace the WhatsApp groups and Excel spreadsheets. TutorDash gives you a real professional workspace — students, lessons, attendance, grades, all in one place.
            </p>
            <div className="lp-cta-row lp-a4">
              <Link to="/dashboard" className="lp-btn lp-primary lp-btn-md">Get started free <ArrowRight size={16} /></Link>
              <Link to="/dashboard" className="lp-btn lp-outline lp-btn-md">Open Dashboard</Link>
            </div>
            <div className="lp-proof lp-a5">
              {["Free to use", "No credit card", "2 min setup"].map(t => (
                <div key={t} className="lp-proof-item">
                  <div className="lp-check">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* DASHBOARD MOCKUP */}
          <div className="lp-hero-right">
            <div className="lp-mock">
              {/* browser bar */}
              <div className="lp-mock-bar">
                <div className="lp-mock-dots">
                  <div className="lp-mock-dot" style={{background:"#FF5F57"}} />
                  <div className="lp-mock-dot" style={{background:"#FEBC2E"}} />
                  <div className="lp-mock-dot" style={{background:"#28C840"}} />
                </div>
                <div className="lp-mock-url">tutorsdash.vercel.app/dashboard</div>
              </div>
              {/* dashboard body */}
              <div className="lp-mock-body">
                {/* sidebar */}
                <div className="lp-mock-side">
                  <div className="lp-mock-logo">
                    <div className="lp-mock-logo-icon"><Sparkles size={11} color="#111827" /></div>
                    <span className="lp-mock-logo-name">TutorDash</span>
                  </div>
                  {[
                    {icon: LayoutDashboard, label: "Dashboard", active: true},
                    {icon: Users, label: "Students", active: false},
                    {icon: CalendarDays, label: "Lessons", active: false},
                    {icon: CheckSquare, label: "Attendance", active: false},
                    {icon: BookOpen, label: "Modules", active: false},
                    {icon: FolderOpen, label: "Materials", active: false},
                  ].map(item => (
                    <div key={item.label} className={`lp-mock-nav-item${item.active ? " active" : ""}`}>
                      <item.icon size={13} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                {/* main */}
                <div className="lp-mock-main">
                  <div className="lp-mock-page-title">Dashboard</div>
                  <div className="lp-mock-stats">
                    <div className="lp-mock-stat">
                      <div className="lp-mock-stat-n">12</div>
                      <div className="lp-mock-stat-l">Students</div>
                      <div className="lp-mock-stat-badge" style={{background:"#FEF3C7",color:"#D97706"}}>↑ 2 new</div>
                    </div>
                    <div className="lp-mock-stat">
                      <div className="lp-mock-stat-n" style={{fontSize:14}}>Today 3pm</div>
                      <div className="lp-mock-stat-l">Next Lesson</div>
                      <div className="lp-mock-stat-badge" style={{background:"#EFF6FF",color:"#2563EB"}}>IELTS Speaking</div>
                    </div>
                    <div className="lp-mock-stat">
                      <div className="lp-mock-stat-n">87%</div>
                      <div className="lp-mock-stat-l">Attendance</div>
                      <div className="lp-mock-stat-badge" style={{background:"#F0FDF4",color:"#16A34A"}}>↑ Good</div>
                    </div>
                    <div className="lp-mock-stat">
                      <div className="lp-mock-stat-n">2</div>
                      <div className="lp-mock-stat-l">Pending</div>
                      <div className="lp-mock-stat-badge" style={{background:"#FEF2F2",color:"#DC2626"}}>Due soon</div>
                    </div>
                  </div>
                  <div className="lp-mock-table">
                    <div className="lp-mock-thead">
                      <div className="lp-mock-th">Student</div>
                      <div className="lp-mock-th">Module</div>
                      <div className="lp-mock-th">Status</div>
                    </div>
                    {[
                      {name:"Ali Hassan",   mod:"IELTS Speaking", s:"Active",  bg:"#F0FDF4",c:"#16A34A"},
                      {name:"Fatima Malik", mod:"Sociology",       s:"Active",  bg:"#F0FDF4",c:"#16A34A"},
                      {name:"Ahmed Raza",   mod:"Math Grade 9",    s:"Pending", bg:"#FFFBEB",c:"#D97706"},
                    ].map(r => (
                      <div key={r.name} className="lp-mock-row">
                        <div><div className="lp-mock-name">{r.name}</div></div>
                        <div className="lp-mock-mod">{r.mod}</div>
                        <div><span className="lp-mock-pill" style={{background:r.bg,color:r.c}}>{r.s}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="lp-strip">
          <div className="lp-strip-in">
            {[
              {n:"9+",     l:"Core features",     s:"Students to progress reports"},
              {n:"2 min",  l:"Setup time",         s:"First student added in minutes"},
              {n:"100%",   l:"Spreadsheet-free",   s:"Everything in one dashboard"},
            ].map((s,i) => (
              <div key={i} className="lp-strip-item">
                <div className="lp-strip-n">{s.n}</div>
                <div className="lp-strip-l">{s.l}</div>
                <div className="lp-strip-s">{s.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BENTO FEATURES */}
        <section className="lp-bento-wrap">
          <div className="lp-bento-header">
            <div className="lp-eyebrow">Features</div>
            <h2 className="lp-h2">Everything a tutor needs.<br />Nothing they don't.</h2>
          </div>
          <div className="lp-bento">
            <div className="lp-b lp-b1">
              <div className="lp-b-ico" style={{background:"rgba(255,255,255,.1)"}}><Users size={20} color="#fff" /></div>
              <div className="lp-b-t" style={{color:"#fff"}}>Student Management</div>
              <div className="lp-b-d" style={{color:"rgba(255,255,255,.55)"}}>Every student's details, modules, grades, and history — all in one profile.</div>
            </div>
            <div className="lp-b lp-b2">
              <div className="lp-b-ico" style={{background:"#FDE68A"}}><CalendarDays size={20} color="#92400E" /></div>
              <div className="lp-b-t" style={{color:"#92400E"}}>Lesson Scheduling</div>
              <div className="lp-b-d" style={{color:"#A16207"}}>Plan lessons with dates, topics, and notes. See your week clearly on the dashboard.</div>
            </div>
            <div className="lp-b lp-b3">
              <div className="lp-b-ico" style={{background:"#BFDBFE"}}><CheckSquare size={20} color="#1D4ED8" /></div>
              <div className="lp-b-t" style={{color:"#1E40AF"}}>Attendance Tracking</div>
              <div className="lp-b-d" style={{color:"#3B82F6"}}>Mark in a tap. Monthly rates auto-calculated.</div>
            </div>
            <div className="lp-b lp-b4">
              <div className="lp-b-ico" style={{background:"#BBF7D0"}}><ClipboardList size={20} color="#15803D" /></div>
              <div className="lp-b-t" style={{color:"#15803D"}}>Assignments</div>
              <div className="lp-b-d" style={{color:"#16A34A"}}>Assign tasks and track who's submitted.</div>
            </div>
            <div className="lp-b lp-b5">
              <div className="lp-b-ico" style={{background:"#E9D5FF"}}><TrendingUp size={20} color="#7E22CE" /></div>
              <div className="lp-b-t" style={{color:"#7E22CE"}}>Progress Reports</div>
              <div className="lp-b-d" style={{color:"#9333EA"}}>Auto-generated reports ready to share.</div>
            </div>
            <div className="lp-b lp-b6">
              <div className="lp-b-ico" style={{background:"#FED7AA"}}><FolderOpen size={20} color="#C2410C" /></div>
              <div className="lp-b-t" style={{color:"#C2410C"}}>Materials Upload</div>
              <div className="lp-b-d" style={{color:"#EA580C"}}>Upload PDFs by module. Students access files from their own portal link — no WhatsApp file sharing needed.</div>
            </div>
            <div className="lp-b lp-b7">
              <div className="lp-b-ico" style={{background:"#BAE6FD"}}><BookOpen size={20} color="#0369A1" /></div>
              <div className="lp-b-t" style={{color:"#0369A1"}}>Module Management</div>
              <div className="lp-b-d" style={{color:"#0284C7"}}>Create batches like "IELTS Speaking" and assign students to them.</div>
            </div>
          </div>
        </section>

        {/* STUDENT PREVIEW */}
        <div className="lp-hl">
          <div className="lp-hl-in">
            <div>
              <div className="lp-eyebrow">Student Portal</div>
              <h2 className="lp-h2" style={{fontSize:"clamp(28px,2.8vw,40px)", marginBottom:16}}>
                Share a link.<br />Students see everything.
              </h2>
              <p style={{fontSize:16, lineHeight:1.7, color:"#6B7280", maxWidth:400, marginBottom:28}}>
                Each student gets a private portal link. They can see their assigned modules, download materials, and check their progress — without needing to ask you on WhatsApp.
              </p>
              <Link to="/dashboard" className="lp-btn lp-primary lp-btn-md">Try it now <ArrowRight size={14} /></Link>
            </div>
            <div className="lp-hl-vis">
              <div className="lp-hl-ttl">Your Students</div>
              {[
                {name:"Ali Hassan",   mod:"IELTS Speaking", s:"Active",  dot:"#22C55E", bg:"#F0FDF4", c:"#16A34A"},
                {name:"Fatima Malik", mod:"Sociology",       s:"Active",  dot:"#22C55E", bg:"#F0FDF4", c:"#16A34A"},
                {name:"Ahmed Raza",   mod:"IELTS Writing",   s:"Pending", dot:"#F59E0B", bg:"#FFFBEB", c:"#D97706"},
                {name:"Sara Khan",    mod:"Math Grade 9",    s:"Active",  dot:"#22C55E", bg:"#F0FDF4", c:"#16A34A"},
              ].map(s => (
                <div key={s.name} className="lp-stu-row">
                  <span className="lp-stu-dot" style={{background:s.dot}} />
                  <div style={{flex:1}}>
                    <div className="lp-stu-name">{s.name}</div>
                    <div className="lp-stu-mod">{s.mod}</div>
                  </div>
                  <span className="lp-stu-tag" style={{background:s.bg, color:s.c}}>{s.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="lp-cta">
          <div className="lp-cta-box">
            <div className="lp-cta-glow" />
            <div className="lp-cta-grid" />
            <h2 className="lp-cta-h">Start your dashboard today</h2>
            <p className="lp-cta-p">Set up in 2 minutes. Free forever. No credit card.</p>
            <Link to="/dashboard" className="lp-cta-btn">Get started free <ArrowRight size={16} /></Link>
          </div>
        </div>

        {/* FOOTER */}
        <div className="lp-foot">
          <div className="lp-foot-in">
            <div className="lp-foot-logo">
              <div className="lp-foot-icon"><Sparkles size={12} color="#F59E0B" /></div>
              <span className="lp-foot-name">TutorDash</span>
            </div>
            <span className="lp-foot-copy">© {new Date().getFullYear()} TutorDash. Made for tutors who mean business.</span>
          </div>
        </div>

      </div>
    </>
  );
}
