"use client";
import { useState, useEffect } from "react";

type SessionCategory = "Trabalho" | "Estudos" | "Exercício" | "Leitura" | "Projeto";
type Session = {
  id: number;
  title: string;
  category: SessionCategory;
  mins: number;
  startTime: string;
  date: string; // "hoje" | "ontem" | YYYY-MM-DD
};

const CAT_CFG: Record<SessionCategory, { color: string; icon: string }> = {
  Trabalho:  { color: "#00d4ff", icon: "💼" },
  Estudos:   { color: "#a78bfa", icon: "📚" },
  Exercício: { color: "#10b981", icon: "🏃" },
  Leitura:   { color: "#e879f9", icon: "📖" },
  Projeto:   { color: "#f59e0b", icon: "⚡" },
};

const ALL_CATS: SessionCategory[] = ["Trabalho","Estudos","Exercício","Leitura","Projeto"];

// Mock data — semana atual (S T Q Q S S D)
const WEEK_HOURS = [6.5, 7.2, 4.8, 8.1, 3.75, 2.0, 0];
const WEEK_DAYS  = ["S","T","Q","Q","S","S","D"];

const MOCK_SESSIONS: Session[] = [
  { id:1,  title:"Reunião de alinhamento",  category:"Trabalho",  mins:60,  startTime:"09:00", date:"hoje" },
  { id:2,  title:"Desenvolvimento de feature", category:"Projeto", mins:90, startTime:"10:15", date:"hoje" },
  { id:3,  title:"Revisão de PRs",          category:"Trabalho",  mins:45,  startTime:"12:00", date:"hoje" },
  { id:4,  title:"Aula de TypeScript",      category:"Estudos",   mins:50,  startTime:"14:00", date:"hoje" },
  { id:5,  title:"Corrida 5km",             category:"Exercício", mins:40,  startTime:"17:30", date:"hoje" },
  { id:6,  title:"Leitura noturna",         category:"Leitura",   mins:20,  startTime:"21:00", date:"hoje" },
  { id:7,  title:"Planejamento semanal",    category:"Trabalho",  mins:30,  startTime:"08:00", date:"ontem" },
  { id:8,  title:"Estudar React",           category:"Estudos",   mins:120, startTime:"19:00", date:"ontem" },
  { id:9,  title:"Musculação",              category:"Exercício", mins:60,  startTime:"07:00", date:"ontem" },
];

type FilterPeriod = "hoje" | "ontem" | "semana";

function fmtMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/* ── Weekly Bar Chart ──────────────────────────────────────── */
function WeekChart({ mounted }: { mounted: boolean }) {
  const maxH = Math.max(...WEEK_HOURS);
  const todayIdx = 4; // sexta = índice 4 na semana mock

  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80, paddingTop:4 }}>
      {WEEK_HOURS.map((h, i) => {
        const pct  = h / maxH;
        const isToday = i === todayIdx;
        const isFuture = h === 0;
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <div style={{ fontSize:"0.6rem", color: isToday ? "#f59e0b" : "var(--text-muted)", fontWeight:700, letterSpacing:"0.02em", height:14, display:"flex", alignItems:"center" }}>
              {!isFuture && `${h}h`}
            </div>
            <div style={{ width:"100%", height:50, display:"flex", alignItems:"flex-end" }}>
              <div style={{
                width:"100%",
                height: mounted ? `${Math.max(pct * 50, isFuture ? 0 : 4)}px` : "0px",
                borderRadius:6,
                background: isToday
                  ? "linear-gradient(180deg, #fbbf24, #f59e0b)"
                  : isFuture
                  ? "rgba(255,255,255,0.06)"
                  : "linear-gradient(180deg, rgba(245,158,11,0.5), rgba(245,158,11,0.25))",
                boxShadow: isToday ? "0 0 12px rgba(245,158,11,0.5)" : "none",
                transition: "height 0.9s cubic-bezier(.4,0,.2,1)",
                border: isFuture ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}/>
            </div>
            <div style={{ fontSize:"0.65rem", fontWeight: isToday ? 800 : 600, color: isToday ? "#f59e0b" : "var(--text-muted)" }}>
              {WEEK_DAYS[i]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Category Breakdown ────────────────────────────────────── */
function CategoryBreakdown({ sessions, mounted }: { sessions: Session[]; mounted: boolean }) {
  const totals: Partial<Record<SessionCategory, number>> = {};
  sessions.forEach(s => { totals[s.category] = (totals[s.category] ?? 0) + s.mins; });
  const total = Object.values(totals).reduce((a, b) => a + (b ?? 0), 0) || 1;
  const sorted = (Object.entries(totals) as [SessionCategory, number][]).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return null;

  return (
    <div>
      {sorted.map(([cat, mins]) => {
        const cfg = CAT_CFG[cat];
        const pct = Math.round((mins / total) * 100);
        return (
          <div key={cat} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ fontSize:"0.85rem" }}>{cfg.icon}</span>
                <span style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text-primary)" }}>{cat}</span>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:"0.72rem", color:"var(--text-secondary)" }}>{fmtMins(mins)}</span>
                <span style={{ fontSize:"0.72rem", fontWeight:700, color:cfg.color }}>{pct}%</span>
              </div>
            </div>
            <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:3,
                width: mounted ? `${pct}%` : "0%",
                background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                transition:"width 1.1s cubic-bezier(.4,0,.2,1)",
                boxShadow:`0 0 8px ${cfg.color}55`,
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Session Card ──────────────────────────────────────────── */
function SessionCard({ session, onDelete }: { session: Session; onDelete: (id: number) => void }) {
  const cfg = CAT_CFG[session.category];
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12,
      background:"rgba(255,255,255,0.05)",
      backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
      border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:16, padding:"13px 14px", marginBottom:8,
      boxShadow:"inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.25)",
    }}>
      <div style={{
        width:40, height:40, borderRadius:12, flexShrink:0,
        background:`${cfg.color}18`, border:`1px solid ${cfg.color}30`,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem",
      }}>
        {cfg.icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:"0.88rem", fontWeight:700, color:"var(--text-primary)", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {session.title}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:"0.68rem", fontWeight:700, color:cfg.color, background:`${cfg.color}18`, border:`1px solid ${cfg.color}28`, borderRadius:20, padding:"2px 7px" }}>
            {session.category}
          </span>
          <span style={{ fontSize:"0.68rem", color:"var(--text-muted)", fontWeight:500 }}>{session.startTime}</span>
        </div>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ fontSize:"0.95rem", fontWeight:800, color:cfg.color, letterSpacing:"-0.02em" }}>{fmtMins(session.mins)}</div>
      </div>
      <button onClick={()=>onDelete(session.id)} style={{
        width:28, height:28, borderRadius:8, flexShrink:0,
        background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#f87171",
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ── Add Session Sheet ─────────────────────────────────────── */
function AddSessionSheet({ onClose, onSave }: {
  onClose: () => void;
  onSave: (s: Omit<Session,"id">) => void;
}) {
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState<SessionCategory>("Trabalho");
  const [mins,     setMins]     = useState("");
  const [startTime,setStartTime]= useState("");

  const canSave = title.trim() && mins;

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"11px 14px", borderRadius:14,
    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
    color:"var(--text-primary)", fontSize:"0.9rem", fontWeight:500,
    outline:"none", fontFamily:"inherit",
  };
  const labelStyle: React.CSSProperties = {
    fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)",
    letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6, display:"block",
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)", zIndex:300 }}/>
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:301,
        maxWidth:480, margin:"0 auto",
        background:"rgba(8,9,18,0.94)",
        backdropFilter:"blur(48px) saturate(160%)", WebkitBackdropFilter:"blur(48px) saturate(160%)",
        borderTop:"1px solid rgba(255,255,255,0.14)",
        borderRadius:"28px 28px 0 0",
        padding:"20px 20px calc(env(safe-area-inset-bottom, 16px) + 20px)",
        boxShadow:"0 -8px 48px rgba(0,0,0,0.6)",
      }}>
        <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.18)", margin:"0 auto 18px" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <span style={{ fontSize:"1rem", fontWeight:800, color:"var(--text-primary)" }}>Nova sessão</span>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <label style={labelStyle}>Título</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Reunião de planejamento"
          style={{ ...inputStyle, marginBottom:14 }}/>

        <label style={labelStyle}>Categoria</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, marginBottom:14 }}>
          {ALL_CATS.map(cat => {
            const c = CAT_CFG[cat];
            const active = category === cat;
            return (
              <button key={cat} onClick={()=>setCategory(cat)} style={{
                padding:"8px 4px", borderRadius:12, cursor:"pointer",
                background: active ? `${c.color}22` : "rgba(255,255,255,0.05)",
                border: active ? `1px solid ${c.color}55` : "1px solid rgba(255,255,255,0.1)",
                color: active ? c.color : "var(--text-muted)",
                fontSize:"0.65rem", fontWeight:700, display:"flex", flexDirection:"column",
                alignItems:"center", gap:3, transition:"all 0.18s",
              }}>
                <span style={{ fontSize:"1rem" }}>{c.icon}</span>
                {cat}
              </button>
            );
          })}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
          <div>
            <label style={labelStyle}>Duração (min)</label>
            <input value={mins} onChange={e=>setMins(e.target.value)} placeholder="60" type="number"
              style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Horário</label>
            <input value={startTime} onChange={e=>setStartTime(e.target.value)} type="time"
              style={{ ...inputStyle, colorScheme:"dark" }}/>
          </div>
        </div>

        <button onClick={()=>{ if (!canSave) return; onSave({ title:title.trim(), category, mins:parseInt(mins)||0, startTime:startTime||"--:--", date:"hoje" }); }} disabled={!canSave} style={{
          width:"100%", height:44, borderRadius:13,
          cursor: canSave ? "pointer" : "not-allowed",
          background: canSave ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)",
          border: canSave ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.08)",
          color: canSave ? "#f59e0b" : "var(--text-muted)",
          fontSize:"0.88rem", fontWeight:700, transition:"all 0.18s",
        }}>
          Registrar sessão
        </button>
      </div>
    </>
  );
}

/* ── Main Screen ───────────────────────────────────────────── */
export default function PerformanceScreen({ onBack }: { onBack: () => void }) {
  const [mounted,  setMounted]  = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [period,   setPeriod]   = useState<FilterPeriod>("hoje");
  const [sheet,    setSheet]    = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = sessions.filter(s => s.date === period);

  const totalMins   = filtered.reduce((a, s) => a + s.mins, 0);
  const weekTotal   = WEEK_HOURS.reduce((a, h) => a + h, 0);
  const weekAvg     = (weekTotal / WEEK_HOURS.filter(h => h > 0).length).toFixed(1);
  const dailyGoal   = 480; // 8h em minutos
  const goalPct     = Math.min(Math.round((totalMins / dailyGoal) * 100), 100);

  function handleDelete(id: number) {
    setSessions(ss => ss.filter(s => s.id !== id));
  }

  function handleSave(data: Omit<Session,"id">) {
    setSessions(ss => [{ ...data, id: Date.now() }, ...ss]);
    setSheet(false);
  }

  const FILTER_PERIODS: { id: FilterPeriod; label: string }[] = [
    { id:"hoje",   label:"Hoje"   },
    { id:"ontem",  label:"Ontem"  },
    { id:"semana", label:"Semana" },
  ];

  return (
    <div style={{ minHeight:"100dvh", background:"var(--bg-deep)", position:"relative", fontFamily:"var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* Ambient */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:[
          "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(245,158,11,0.18) 0%, transparent 60%)",
          "radial-gradient(ellipse 60% 40% at 90% 80%, rgba(251,146,60,0.10) 0%, transparent 55%)",
        ].join(", "),
      }}/>

      <div style={{ maxWidth:480, margin:"0 auto", position:"relative", zIndex:1, paddingBottom:120 }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"calc(env(safe-area-inset-top) + 20px) 20px 14px" }}>
          <button onClick={onBack} style={{
            width:44, height:44, borderRadius:14, flexShrink:0,
            background:"rgba(255,255,255,0.07)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
            border:"1px solid rgba(255,255,255,0.15)",
            boxShadow:"inset 0 1.5px 0 rgba(255,255,255,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"rgba(255,255,255,0.7)", cursor:"pointer",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"1.1rem", fontWeight:800, color:"var(--text-primary)", letterSpacing:"-0.025em" }}>Desempenho Pessoal</div>
            <div style={{ fontSize:"0.72rem", color:"var(--text-secondary)", fontWeight:500, marginTop:1 }}>
              {fmtMins(totalMins)} registradas hoje
            </div>
          </div>
        </div>

        {/* ── Summary Cards Row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, margin:"0 16px 16px" }}>
          {[
            { label:"Hoje",       value: fmtMins(totalMins), color:"#f59e0b" },
            { label:"Meta diária",value: `${goalPct}%`,      color: goalPct >= 100 ? "#10b981" : "#f59e0b" },
            { label:"Média/dia",  value: `${weekAvg}h`,      color:"#00d4ff" },
          ].map(item => (
            <div key={item.label} style={{
              background:"rgba(255,255,255,0.06)",
              backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:18, padding:"14px 12px",
              boxShadow:"inset 0 1.5px 0 rgba(255,255,255,0.35), 0 4px 20px rgba(0,0,0,0.3)",
              textAlign:"center",
            }}>
              <div style={{ fontSize:"1.1rem", fontWeight:800, color:item.color, letterSpacing:"-0.025em", lineHeight:1 }}>{item.value}</div>
              <div style={{ fontSize:"0.62rem", color:"var(--text-muted)", marginTop:4, fontWeight:600 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* ── Weekly Chart Card ── */}
        <div style={{ margin:"0 16px 16px",
          background:"rgba(255,255,255,0.06)",
          backdropFilter:"blur(56px) saturate(300%) brightness(1.06)",
          WebkitBackdropFilter:"blur(56px) saturate(300%) brightness(1.06)",
          border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:22, padding:"18px 18px 14px",
          boxShadow:"inset 0 1.5px 0 rgba(255,255,255,0.4), 0 8px 32px rgba(0,0,0,0.35)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--text-secondary)" }}>Esta semana</span>
            <span style={{ fontSize:"0.78rem", fontWeight:800, color:"#f59e0b" }}>{weekTotal.toFixed(1)}h total</span>
          </div>
          <WeekChart mounted={mounted} />
          {/* Meta line */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
            <div style={{ flex:1, height:1, background:"rgba(245,158,11,0.2)", borderRadius:1 }}/>
            <span style={{ fontSize:"0.62rem", color:"rgba(245,158,11,0.6)", fontWeight:600 }}>meta: 8h/dia</span>
            <div style={{ flex:1, height:1, background:"rgba(245,158,11,0.2)", borderRadius:1 }}/>
          </div>
        </div>

        {/* ── Period Filter ── */}
        <div style={{ display:"flex", gap:7, padding:"0 16px", marginBottom:14 }}>
          {FILTER_PERIODS.map(p => {
            const active = period === p.id;
            return (
              <button key={p.id} onClick={()=>setPeriod(p.id)} style={{
                padding:"7px 16px", borderRadius:20,
                background: active ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.06)",
                border: active ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: active ? "#f59e0b" : "var(--text-secondary)",
                fontSize:"0.78rem", fontWeight:700, cursor:"pointer",
                transition:"all 0.18s",
              }}>
                {p.label}
              </button>
            );
          })}
        </div>

        {/* ── Category Breakdown ── */}
        {filtered.length > 0 && (
          <div style={{ margin:"0 16px 16px",
            background:"rgba(255,255,255,0.05)",
            backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:20, padding:"16px 16px 10px",
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 20px rgba(0,0,0,0.25)",
          }}>
            <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:14 }}>
              Por categoria
            </div>
            <CategoryBreakdown sessions={filtered} mounted={mounted} />
          </div>
        )}

        {/* ── Sessions List ── */}
        <div style={{ padding:"0 16px" }}>
          <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:12 }}>
            Sessões · {filtered.length}
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"var(--text-muted)", fontSize:"0.88rem" }}>
              Nenhuma sessão registrada
            </div>
          ) : (
            filtered.map(s => (
              <SessionCard key={s.id} session={s} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>

      {/* ── FAB ── */}
      <button onClick={()=>setSheet(true)} style={{
        position:"fixed", bottom:32, right:24, zIndex:200,
        width:58, height:58, borderRadius:19, cursor:"pointer",
        background:"rgba(245,158,11,0.18)",
        backdropFilter:"blur(28px) saturate(180%)", WebkitBackdropFilter:"blur(28px) saturate(180%)",
        border:"1px solid rgba(245,158,11,0.35)",
        boxShadow:"0 8px 32px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      </button>

      {sheet && <AddSessionSheet onClose={()=>setSheet(false)} onSave={handleSave} />}
    </div>
  );
}
