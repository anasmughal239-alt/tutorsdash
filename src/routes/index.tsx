import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarDays, FolderOpen, TrendingUp, CheckSquare, ClipboardList, ArrowRight, Zap, BookOpen, LayoutDashboard, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <style>{`
        /* ── Zapier design tokens ── */
        .zp {
          --canvas:      #fffefb;
          --canvas-soft: #f8f4f0;
          --ink:         #201515;
          --ink-soft:    #2f2a26;
          --body:        #605d52;
          --body-mid:    #939084;
          --mute:        #c5c0b1;
          --primary:     #ff4f00;
          --on-primary:  #fffefb;
          --r-sm:  6px;
          --r-md:  12px;
          --r-pill: 9999px;
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--canvas);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }
        .zp *, .zp *::before, .zp *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Nav ── */
        .zp-nav { position: sticky; top: 0; z-index: 100; background: var(--canvas); border-bottom: 1px solid var(--mute); }
        .zp-nav-in { max-width: 1280px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .zp-brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .zp-brand-mark { width: 30px; height: 30px; background: var(--primary); border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; }
        .zp-brand-name { font-size: 16px; font-weight: 600; color: var(--ink); }

        /* ── Buttons ── */
        .zp-btn { display: inline-flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; text-decoration: none; border-radius: var(--r-md); transition: all .14s; cursor: pointer; border: none; white-space: nowrap; }
        .zp-btn-primary { background: var(--primary); color: var(--on-primary); font-size: 18px; font-weight: 600; line-height: 27px; padding: 12px 24px; }
        .zp-btn-primary:hover { background: #e34600; transform: translateY(-1px); }
        .zp-btn-primary-sm { font-size: 14px; font-weight: 700; line-height: 1; letter-spacing: .1px; padding: 10px 18px; }
        .zp-btn-ink { background: var(--ink); color: var(--on-primary); font-size: 18px; font-weight: 600; line-height: 27px; padding: 12px 24px; }
        .zp-btn-ink:hover { background: var(--ink-soft); transform: translateY(-1px); }
        .zp-btn-outline { background: var(--canvas); color: var(--ink); border: 1.5px solid var(--ink); font-size: 18px; font-weight: 600; line-height: 27px; padding: 11px 24px; }
        .zp-btn-outline:hover { background: var(--canvas-soft); }
        .zp-btn-outline-light { background: transparent; color: var(--on-primary); border: 1.5px solid rgba(255,254,251,.4); font-size: 18px; font-weight: 600; line-height: 27px; padding: 11px 24px; }
        .zp-btn-outline-light:hover { border-color: var(--on-primary); background: rgba(255,254,251,.06); }

        /* ── Eyebrow ── */
        .zp-eyebrow { font-size: 14px; font-weight: 500; line-height: 14px; letter-spacing: 1px; text-transform: uppercase; color: var(--ink); margin-bottom: 16px; }
        .zp-eyebrow-light { color: rgba(255,254,251,.55); }
        .zp-eyebrow-muted { color: var(--body-mid); }

        /* ── Type scale ── */
        .zp-display-xl { font-size: clamp(36px,4.5vw,56px); font-weight: 500; line-height: 1.02; color: var(--ink); }
        .zp-display-lg { font-size: clamp(30px,3.8vw,48px); font-weight: 500; line-height: 1.02; color: var(--ink); }
        .zp-display-md { font-size: 32px; font-weight: 500; line-height: 36px; letter-spacing: 1px; color: var(--ink); }
        .zp-card-title { font-size: 24px; font-weight: 600; line-height: 30px; letter-spacing: -0.6px; }
        .zp-body-lg { font-size: 20px; font-weight: 400; line-height: 30px; letter-spacing: -0.2px; color: var(--body); }
        .zp-body-md { font-size: 18px; font-weight: 400; line-height: 27px; color: var(--body); }
        .zp-body-sm { font-size: 16px; font-weight: 400; line-height: 24px; color: var(--body); }

        @keyframes zp-rise { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        .za1 { animation: zp-rise .55s ease both; }
        .za2 { animation: zp-rise .55s .07s ease both; }
        .za3 { animation: zp-rise .55s .15s ease both; }
        .za4 { animation: zp-rise .55s .22s ease both; }
        .za5 { animation: zp-rise .55s .30s ease both; }
        .za6 { animation: zp-rise .7s  .12s ease both; }

        /* ── Hero ── */
        .zp-hero { max-width: 1280px; margin: 0 auto; padding: 64px 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; min-height: calc(100vh - 64px); }
        .zp-hero-left { padding-bottom: 64px; }
        .zp-hero-right { align-self: end; }
        .zp-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 36px; }
        .zp-hero-proof { margin-top: 20px; font-size: 14px; color: var(--body-mid); }

        /* ── Dashboard mockup ── */
        .zp-mock { border-radius: var(--r-md) var(--r-md) 0 0; overflow: hidden; border: 1px solid var(--mute); border-bottom: none; box-shadow: 0 20px 60px rgba(32,21,21,.1), 0 4px 16px rgba(32,21,21,.05); }
        .zp-mock-bar { background: var(--canvas-soft); border-bottom: 1px solid var(--mute); padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
        .zp-mock-dots { display: flex; gap: 5px; }
        .zp-mock-dot { width: 10px; height: 10px; border-radius: 50%; }
        .zp-mock-url { flex:1; background: var(--canvas); border: 1px solid var(--mute); border-radius: var(--r-sm); padding: 4px 10px; font-size: 11px; color: var(--body-mid); font-family: monospace; }
        .zp-mock-body { display: grid; grid-template-columns: 172px 1fr; height: 380px; }
        .zp-mock-side { background: var(--ink); padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
        .zp-mock-logo { display: flex; align-items: center; gap: 8px; padding: 6px 8px 14px; border-bottom: 1px solid rgba(255,254,251,.1); margin-bottom: 8px; }
        .zp-mock-logo-icon { width: 22px; height: 22px; border-radius: var(--r-sm); background: var(--primary); display: flex; align-items: center; justify-content: center; }
        .zp-mock-logo-name { font-size: 12px; font-weight: 600; color: var(--on-primary); }
        .zp-mock-nav { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: var(--r-sm); font-size: 11.5px; color: rgba(255,254,251,.4); }
        .zp-mock-nav.on { background: rgba(255,254,251,.07); color: var(--on-primary); }
        .zp-mock-main { padding: 20px; background: var(--canvas); overflow: hidden; }
        .zp-mock-pt { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 14px; }
        .zp-mock-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 14px; }
        .zp-mock-sc { background: var(--canvas-soft); border: 1px solid var(--mute); border-radius: var(--r-md); padding: 10px 12px; }
        .zp-mock-sn { font-size: 18px; font-weight: 600; color: var(--ink); line-height: 1; }
        .zp-mock-sl { font-size: 10px; color: var(--body-mid); margin-top: 3px; }
        .zp-mock-sb { display: inline-block; font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: var(--r-sm); margin-top: 4px; background: var(--canvas); color: var(--body-mid); border: 1px solid var(--mute); }
        .zp-mock-sb.orange { background: rgba(255,79,0,.08); color: var(--primary); border-color: rgba(255,79,0,.2); }
        .zp-mock-tbl { background: var(--canvas); border: 1px solid var(--mute); border-radius: var(--r-md); overflow: hidden; }
        .zp-mock-thead { display: grid; grid-template-columns: 2fr 1.5fr 1fr; padding: 7px 12px; background: var(--canvas-soft); border-bottom: 1px solid var(--mute); }
        .zp-mock-th { font-size: 9px; font-weight: 700; color: var(--body-mid); text-transform: uppercase; letter-spacing: .06em; }
        .zp-mock-tr { display: grid; grid-template-columns: 2fr 1.5fr 1fr; padding: 8px 12px; border-bottom: 1px solid var(--canvas-soft); align-items: center; }
        .zp-mock-tr:last-child { border-bottom: none; }
        .zp-mock-name { font-size: 11px; font-weight: 600; color: var(--ink); }
        .zp-mock-mod  { font-size: 10px; color: var(--body-mid); }
        .zp-mock-pill { display: inline-block; font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: var(--r-pill); background: var(--canvas-soft); color: var(--body-mid); border: 1px solid var(--mute); }
        .zp-mock-pill.act { background: rgba(255,79,0,.08); color: var(--primary); border-color: rgba(255,79,0,.22); }

        /* ── Stats strip ── */
        .zp-strip { background: var(--canvas-soft); border-top: 1px solid var(--mute); border-bottom: 1px solid var(--mute); }
        .zp-strip-in { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: repeat(3,1fr); }
        .zp-stat { padding: 40px 24px; text-align: center; border-right: 1px solid var(--mute); }
        .zp-stat:last-child { border-right: none; }
        .zp-stat-n { font-size: 48px; font-weight: 500; line-height: 1; color: var(--ink); letter-spacing: -0.02em; margin-bottom: 6px; }
        .zp-stat-l { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .zp-stat-s { font-size: 14px; color: var(--body-mid); }

        /* ── Bento ── */
        .zp-bento-wrap { max-width: 1280px; margin: 0 auto; padding: 64px 24px; }
        .zp-bento-hd { margin-bottom: 48px; }
        .zp-bento { display: grid; grid-template-columns: repeat(12,1fr); gap: 12px; }
        .zp-b { border-radius: var(--r-md); padding: 24px; transition: transform .18s; }
        .zp-b:hover { transform: translateY(-2px); }
        .zp-b-cream { background: var(--canvas-soft); }
        .zp-b-dark  { background: var(--ink); }
        .zp-b1 { grid-column: span 5; }
        .zp-b2 { grid-column: span 7; }
        .zp-b3 { grid-column: span 4; }
        .zp-b4 { grid-column: span 4; }
        .zp-b5 { grid-column: span 4; }
        .zp-b6 { grid-column: span 7; }
        .zp-b7 { grid-column: span 5; }
        .zp-b-ico { width: 40px; height: 40px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .zp-b-ico-cream { background: var(--canvas); }
        .zp-b-ico-dark  { background: rgba(255,254,251,.07); }

        /* ── Highlight section ── */
        .zp-hl { background: var(--canvas-soft); border-top: 1px solid var(--mute); border-bottom: 1px solid var(--mute); }
        .zp-hl-in { max-width: 1280px; margin: 0 auto; padding: 88px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .zp-hl-vis { background: var(--canvas); border: 1px solid var(--mute); border-radius: var(--r-md); padding: 28px; }
        .zp-hl-vis-ttl { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--body-mid); margin-bottom: 16px; }
        .zp-stu { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--canvas-soft); border: 1px solid var(--mute); border-radius: var(--r-md); margin-bottom: 8px; }
        .zp-stu:last-child { margin-bottom: 0; }
        .zp-stu-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .zp-stu-name { font-size: 13.5px; font-weight: 600; color: var(--ink); flex: 1; }
        .zp-stu-mod  { font-size: 12px; color: var(--body-mid); }
        .zp-stu-pill { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: var(--r-pill); background: var(--canvas); border: 1px solid var(--mute); color: var(--body-mid); }
        .zp-stu-pill.act { background: rgba(255,79,0,.08); color: var(--primary); border-color: rgba(255,79,0,.22); }

        /* ── CTA dark band ── */
        .zp-cta { background: var(--ink); }
        .zp-cta-in { max-width: 1280px; margin: 0 auto; padding: 80px 24px; text-align: center; }
        .zp-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 36px; }

        /* ── Footer ── */
        .zp-foot { background: var(--ink); border-top: 1px solid rgba(255,254,251,.08); }
        .zp-foot-in { max-width: 1280px; margin: 0 auto; padding: 48px 24px; display: flex; align-items: center; justify-content: space-between; }
        .zp-foot-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .zp-foot-mark { width: 24px; height: 24px; background: var(--primary); border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; }
        .zp-foot-name { font-size: 14px; font-weight: 600; color: var(--on-primary); }
        .zp-foot-copy { font-size: 14px; color: var(--body-mid); }

        @media (max-width: 900px) {
          .zp-hero { grid-template-columns: 1fr; min-height: auto; padding-top: 48px; }
          .zp-hero-right { display: none; }
          .zp-hero-left { padding-bottom: 48px; }
          .zp-strip-in { grid-template-columns: 1fr; }
          .zp-stat { border-right: none; border-bottom: 1px solid var(--mute); }
          .zp-stat:last-child { border-bottom: none; }
          .zp-bento { grid-template-columns: 1fr 1fr; }
          .zp-b1,.zp-b2,.zp-b3,.zp-b4,.zp-b5,.zp-b6,.zp-b7 { grid-column: span 1; }
          .zp-hl-in { grid-template-columns: 1fr; gap: 40px; }
          .zp-foot-in { flex-direction: column; gap: 12px; text-align: center; }
          .zp-cta-in { padding: 56px 24px; }
        }
        @media (max-width: 560px) {
          .zp-bento { grid-template-columns: 1fr; }
          .zp-hero-ctas { flex-direction: column; }
        }
      `}</style>

      <div className="zp">

        {/* ── Nav ── */}
        <nav className="zp-nav">
          <div className="zp-nav-in">
            <div className="zp-brand">
              <div className="zp-brand-mark"><Zap size={14} color="#fffefb" /></div>
              <span className="zp-brand-name">TutorDash</span>
            </div>
            <Link to="/pricing" className="zp-btn zp-btn-outline" style={{fontSize:14,padding:"8px 16px"}}>
              Pricing
            </Link>
            <Link to="/login" className="zp-btn zp-btn-primary zp-btn-primary-sm">
              Start trial
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div className="zp-hero">
          <div className="zp-hero-left">
            <p className="zp-eyebrow za1">Purpose-built for tutors</p>
            <h1 className="zp-display-xl za2" style={{marginBottom:20}}>
              Manage every student, lesson, and grade — in one place.
            </h1>
            <p className="zp-body-lg za3">
              Replace the spreadsheets and WhatsApp chaos with a professional workspace. Students, lessons, attendance, grades — beautifully organised.
            </p>
            <div className="zp-hero-ctas za4">
              <Link to="/login" className="zp-btn zp-btn-primary">
                Start free trial <ArrowRight size={17} />
              </Link>
              <Link to="/pricing" className="zp-btn zp-btn-outline">
                See pricing
              </Link>
            </div>
            <p className="zp-hero-proof za5">Starts from Rs 500/month · 7-day trial · 2 minute setup</p>
          </div>

          {/* Dashboard mockup */}
          <div className="zp-hero-right za6">
            <div className="zp-mock">
              <div className="zp-mock-bar">
                <div className="zp-mock-dots">
                  <div className="zp-mock-dot" style={{background:"#FF5F57"}} />
                  <div className="zp-mock-dot" style={{background:"#FEBC2E"}} />
                  <div className="zp-mock-dot" style={{background:"#28C840"}} />
                </div>
                <div className="zp-mock-url">tutorsdash.vercel.app/dashboard</div>
              </div>
              <div className="zp-mock-body">
                <div className="zp-mock-side">
                  <div className="zp-mock-logo">
                    <div className="zp-mock-logo-icon"><Zap size={11} color="#fffefb" /></div>
                    <span className="zp-mock-logo-name">TutorDash</span>
                  </div>
                  {[
                    {Icon:LayoutDashboard, label:"Dashboard",  on:true},
                    {Icon:Users,           label:"Students",   on:false},
                    {Icon:CalendarDays,    label:"Lessons",    on:false},
                    {Icon:CheckSquare,     label:"Attendance", on:false},
                    {Icon:BookOpen,        label:"Modules",    on:false},
                    {Icon:FolderOpen,      label:"Materials",  on:false},
                  ].map(n => (
                    <div key={n.label} className={`zp-mock-nav${n.on?" on":""}`}>
                      <n.Icon size={13} /><span>{n.label}</span>
                    </div>
                  ))}
                </div>
                <div className="zp-mock-main">
                  <div className="zp-mock-pt">Dashboard</div>
                  <div className="zp-mock-grid">
                    {[
                      {n:"12",  l:"Students",    b:"↑ 2 new",  o:true},
                      {n:"3pm", l:"Next lesson", b:"IELTS",     o:false},
                      {n:"87%", l:"Attendance",  b:"This month",o:false},
                      {n:"2",   l:"Pending",     b:"Due soon",  o:false},
                    ].map((s,i) => (
                      <div key={i} className="zp-mock-sc">
                        <div className="zp-mock-sn">{s.n}</div>
                        <div className="zp-mock-sl">{s.l}</div>
                        <div className={`zp-mock-sb${s.o?" orange":""}`}>{s.b}</div>
                      </div>
                    ))}
                  </div>
                  <div className="zp-mock-tbl">
                    <div className="zp-mock-thead">
                      <div className="zp-mock-th">Student</div>
                      <div className="zp-mock-th">Module</div>
                      <div className="zp-mock-th">Status</div>
                    </div>
                    {[
                      {name:"Ali Hassan",   mod:"IELTS Speaking", active:true},
                      {name:"Fatima Malik", mod:"Sociology",       active:true},
                      {name:"Ahmed Raza",   mod:"Math Grade 9",    active:false},
                    ].map(r => (
                      <div key={r.name} className="zp-mock-tr">
                        <div className="zp-mock-name">{r.name}</div>
                        <div className="zp-mock-mod">{r.mod}</div>
                        <span className={`zp-mock-pill${r.active?" act":""}`}>
                          {r.active ? "Active" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="zp-strip">
          <div className="zp-strip-in">
            {[
              {n:"9+",    l:"Core features",   s:"Students to progress reports"},
              {n:"2 min", l:"To get started",  s:"First student added in minutes"},
              {n:"100%",  l:"Spreadsheet-free",s:"Everything in one dashboard"},
            ].map((s,i) => (
              <div key={i} className="zp-stat">
                <div className="zp-stat-n">{s.n}</div>
                <div className="zp-stat-l">{s.l}</div>
                <div className="zp-stat-s">{s.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bento features ── */}
        <section className="zp-bento-wrap">
          <div className="zp-bento-hd">
            <p className="zp-eyebrow">Features</p>
            <h2 className="zp-display-lg">Everything a tutor needs.<br />Nothing they don't.</h2>
          </div>
          <div className="zp-bento">

            {/* Dark — Students */}
            <div className="zp-b zp-b1 zp-b-dark">
              <div className="zp-b-ico zp-b-ico-dark"><Users size={20} color="rgba(255,254,251,.7)" /></div>
              <p className="zp-card-title" style={{color:"var(--on-primary)",marginBottom:8}}>Student management</p>
              <p className="zp-body-sm" style={{color:"rgba(255,254,251,.55)"}}>Every student's details, modules, grades, and history in one clean profile. Nothing slips through.</p>
            </div>

            {/* Cream — Scheduling */}
            <div className="zp-b zp-b2 zp-b-cream">
              <div className="zp-b-ico zp-b-ico-cream"><CalendarDays size={20} color="var(--ink)" /></div>
              <p className="zp-card-title" style={{color:"var(--ink)",marginBottom:8}}>Lesson scheduling</p>
              <p className="zp-body-sm">Plan lessons with dates, topics, and notes. See your full week at a glance from the dashboard.</p>
            </div>

            {/* Cream — Attendance */}
            <div className="zp-b zp-b3 zp-b-cream">
              <div className="zp-b-ico zp-b-ico-cream"><CheckSquare size={20} color="var(--ink)" /></div>
              <p className="zp-card-title" style={{color:"var(--ink)",marginBottom:8}}>Attendance</p>
              <p className="zp-body-sm">Mark present or absent in a tap. Monthly rates calculated automatically.</p>
            </div>

            {/* Cream — Assignments */}
            <div className="zp-b zp-b4 zp-b-cream">
              <div className="zp-b-ico zp-b-ico-cream"><ClipboardList size={20} color="var(--ink)" /></div>
              <p className="zp-card-title" style={{color:"var(--ink)",marginBottom:8}}>Assignments</p>
              <p className="zp-body-sm">Assign tasks and instantly see who's submitted and who's behind.</p>
            </div>

            {/* Cream — Progress */}
            <div className="zp-b zp-b5 zp-b-cream">
              <div className="zp-b-ico zp-b-ico-cream"><TrendingUp size={20} color="var(--ink)" /></div>
              <p className="zp-card-title" style={{color:"var(--ink)",marginBottom:8}}>Progress reports</p>
              <p className="zp-body-sm">Auto-generated reports with marks, attendance %, and completion rates.</p>
            </div>

            {/* Cream — Materials */}
            <div className="zp-b zp-b6 zp-b-cream">
              <div className="zp-b-ico zp-b-ico-cream"><FolderOpen size={20} color="var(--ink)" /></div>
              <p className="zp-card-title" style={{color:"var(--ink)",marginBottom:8}}>Materials upload</p>
              <p className="zp-body-sm">Upload PDFs organised by module. Students access files from their own private portal link — no WhatsApp file sharing needed.</p>
            </div>

            {/* Dark — Modules */}
            <div className="zp-b zp-b7 zp-b-dark">
              <div className="zp-b-ico zp-b-ico-dark"><BookOpen size={20} color="rgba(255,254,251,.7)" /></div>
              <p className="zp-card-title" style={{color:"var(--on-primary)",marginBottom:8}}>Module management</p>
              <p className="zp-body-sm" style={{color:"rgba(255,254,251,.55)"}}>Create batches like "IELTS Speaking" and assign students directly to them.</p>
            </div>

          </div>
        </section>

        {/* ── Highlight ── */}
        <div className="zp-hl">
          <div className="zp-hl-in">
            <div>
              <p className="zp-eyebrow">Student portal</p>
              <h2 className="zp-display-md" style={{marginBottom:16}}>Share a link. Students see everything.</h2>
              <p className="zp-body-md" style={{maxWidth:400, marginBottom:32}}>
                Each student gets a private portal link. They can view their assigned modules, download materials, and check their progress — without asking you on WhatsApp.
              </p>
              <Link to="/dashboard" className="zp-btn zp-btn-primary">
                Try it now <ArrowRight size={16} />
              </Link>
            </div>
            <div className="zp-hl-vis">
              <div className="zp-hl-vis-ttl">Your Students</div>
              {[
                {name:"Ali Hassan",   mod:"IELTS Speaking", active:true},
                {name:"Fatima Malik", mod:"Sociology",       active:true},
                {name:"Ahmed Raza",   mod:"IELTS Writing",   active:false},
                {name:"Sara Khan",    mod:"Math Grade 9",    active:true},
              ].map(s => (
                <div key={s.name} className="zp-stu">
                  <span className="zp-stu-dot" style={{background: s.active?"var(--primary)":"var(--mute)"}} />
                  <div style={{flex:1}}>
                    <div className="zp-stu-name">{s.name}</div>
                    <div className="zp-stu-mod">{s.mod}</div>
                  </div>
                  <span className={`zp-stu-pill${s.active?" act":""}`}>
                    {s.active ? "Active" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Pricing ── */}
        <section className="zp-bento-wrap" style={{paddingTop:0}}>
          <div className="zp-bento-hd">
            <p className="zp-eyebrow">Pricing</p>
            <h2 className="zp-display-lg">Simple, honest pricing.</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,maxWidth:680}}>
            {[
              {name:"Starter",price:"500",limit:"Up to 5 students",features:["All tutor features","Lessons & attendance","Grades & reports","Student portal"],highlight:false},
              {name:"Pro",price:"999",limit:"Unlimited students",features:["Everything in Starter","School mode","PTM report cards","Inspector-ready export"],highlight:true},
            ].map(p => (
              <div key={p.name} style={{border:p.highlight?"2px solid #ff4f00":"1.5px solid #c5c0b1",borderRadius:16,padding:28,background:p.highlight?"#fff8f5":"var(--canvas)",position:"relative"}}>
                {p.highlight && <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#ff4f00",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 12px",borderRadius:999,whiteSpace:"nowrap"}}>MOST POPULAR</div>}
                <div style={{fontSize:18,fontWeight:600,color:"var(--ink)",marginBottom:4}}>{p.name}</div>
                <div style={{marginBottom:16}}><span style={{fontSize:36,fontWeight:700,color:"var(--ink)"}}>Rs {p.price}</span><span style={{fontSize:13,color:"var(--body-mid)"}}>/month</span></div>
                <ul style={{listStyle:"none",padding:0,margin:"0 0 20px",display:"flex",flexDirection:"column",gap:8}}>
                  <li style={{fontSize:13,fontWeight:600,color:"var(--body-mid)",marginBottom:4}}>{p.limit}</li>
                  {p.features.map(f=><li key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--ink-soft)"}}>
                    <Check size={13} color="#ff4f00"/>{f}
                  </li>)}
                </ul>
                <Link to="/pricing" className="zp-btn" style={{width:"100%",justifyContent:"center",background:p.highlight?"#ff4f00":"var(--ink)",color:"#fff",fontSize:14,padding:"11px 0",borderRadius:10,fontWeight:600}}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA dark band ── */}
        <div className="zp-cta">
          <div className="zp-cta-in">
            <p className="zp-eyebrow zp-eyebrow-light">Get started</p>
            <h2 className="zp-display-xl" style={{color:"var(--on-primary)",marginBottom:14}}>
              Start your dashboard today.
            </h2>
            <p className="zp-body-lg zp-body-lg-light">
              7-day trial. Then from Rs 500/month. No hidden fees.
            </p>
            <div className="zp-cta-btns">
              <Link to="/login" className="zp-btn zp-btn-primary">
                Start free trial <ArrowRight size={16} />
              </Link>
              <Link to="/pricing" className="zp-btn zp-btn-outline-light">
                See pricing
              </Link>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="zp-foot">
          <div className="zp-foot-in">
            <div className="zp-foot-logo">
              <div className="zp-foot-mark"><Zap size={12} color="#fffefb" /></div>
              <span className="zp-foot-name">TutorDash</span>
            </div>
            <span className="zp-foot-copy">© {new Date().getFullYear()} TutorDash. Made for tutors who mean business.</span>
          </div>
        </div>

      </div>
    </>
  );
}
