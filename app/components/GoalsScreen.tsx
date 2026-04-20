"use client";
import { useState, useEffect } from "react";

type GoalCategory = "Financeiro" | "Saúde" | "Fitness" | "Aprendizado" | "Pessoal" | "Viagem";
type GoalStatus   = "ativa" | "concluída" | "pausada";

type Goal = {
  id: number;
  title: string;
  category: GoalCategory;
  current: number;
  target: number;
  unit: string;
  deadline: string;
  status: GoalStatus;
  color: string;
  icon: string;
  note?: string;
};

const CAT_CFG: Record<GoalCategory, { color: string; icon: string }> = {
  Financeiro:  { color: "#10b981", icon: "💰" },
  Saúde:       { color: "#f87171", icon: "❤️" },
  Fitness:     { color: "#00d4ff", icon: "🏃" },
  Aprendizado: { color: "#a78bfa", icon: "📚" },
  Pessoal:     { color: "#f59e0b", icon: "⭐" },
  Viagem:      { color: "#e879f9", icon: "✈️" },
};

const MOCK_GOALS: Goal[] = [
  { id:1, title:"Reserva de emergência",  category:"Financeiro",  current:20000, target:30000, unit:"R$",    deadline:"2025-12-31", status:"ativa",     color:"#10b981", icon:"💰", note:"6 meses de gastos cobertos" },
  { id:2, title:"Perder 8kg",            category:"Saúde",       current:3,     target:8,     unit:"kg",    deadline:"2025-06-30", status:"ativa",     color:"#f87171", icon:"❤️" },
  { id:3, title:"Ler 24 livros",         category:"Aprendizado", current:7,     target:24,    unit:"livros",deadline:"2025-12-31", status:"ativa",     color:"#a78bfa", icon:"📚" },
  { id:4, title:"Correr 5km sem parar",  category:"Fitness",     current:3.2,   target:5,     unit:"km",    deadline:"2025-03-31", status:"ativa",     color:"#00d4ff", icon:"🏃" },
  { id:5, title:"Viagem para Europa",    category:"Viagem",      current:4800,  target:12000, unit:"R$",    deadline:"2026-07-01", status:"ativa",     color:"#e879f9", icon:"✈️", note:"Portugal, Espanha e França" },
  { id:6, title:"Aprender inglês C1",   category:"Aprendizado", current:68,    target:100,   unit:"aulas", deadline:"2025-12-31", status:"pausada",   color:"#a78bfa", icon:"📚" },
  { id:7, title:"Largar o açúcar",       category:"Saúde",       current:30,    target:30,    unit:"dias",  deadline:"2025-01-31", status:"concluída", color:"#f87171", icon:"❤️" },
];

const ALL_CATS: GoalCategory[] = ["Financeiro","Saúde","Fitness","Aprendizado","Pessoal","Viagem"];
const FILTER_TABS = ["Todas","Ativas","Concluídas","Pausadas"] as const;

function formatUnit(value: number, unit: string) {
  if (unit === "R$") return `R$ ${value.toLocaleString("pt-BR")}`;
  return `${value.toLocaleString("pt-BR")} ${unit}`;
}

function formatDeadline(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" });
}

function daysLeft(dateStr: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0)  return { label: "Vencido",        color: "#f87171" };
  if (diff === 0) return { label: "Hoje",           color: "#f59e0b" };
  if (diff <= 7)  return { label: `${diff}d`,       color: "#f59e0b" };
  if (diff <= 30) return { label: `${diff}d`,       color: "#00d4ff" };
  const months = Math.round(diff / 30);
  return { label: `${months}m`, color: "var(--text-muted)" };
}

/* ── Progress Ring ───────────────────────────────────────── */
function ProgressRing({ pct, color, size = 52 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" fill="none" />
      <circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth="3.5" fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cx})`}
        style={{ filter: `drop-shadow(0 0 5px ${color}99)`, transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x={cx} y={cx + 4} textAnchor="middle" fill={color} fontSize={size < 50 ? "9" : "10"} fontWeight="800">
        {pct}%
      </text>
    </svg>
  );
}

/* ── Goal Card ───────────────────────────────────────────── */
function GoalCard({ goal, onEdit, mounted }: { goal: Goal; onEdit: (g: Goal) => void; mounted: boolean }) {
  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const dl  = daysLeft(goal.deadline);
  const isDone = goal.status === "concluída";
  const isPaused = goal.status === "pausada";

  return (
    <div onClick={() => onEdit(goal)} style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(56px) saturate(280%) brightness(1.06)",
      WebkitBackdropFilter: "blur(56px) saturate(280%) brightness(1.06)",
      border: isDone
        ? `1px solid ${goal.color}44`
        : `1px solid rgba(255,255,255,0.13)`,
      borderRadius: 22,
      padding: "18px 18px 16px",
      marginBottom: 10,
      cursor: "pointer",
      opacity: isPaused ? 0.65 : 1,
      boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.4), 0 6px 28px rgba(0,0,0,0.35)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* subtle color tint top-right */}
      <div style={{
        position:"absolute", top:0, right:0, width:120, height:120,
        background: `radial-gradient(circle at 80% 20%, ${goal.color}18 0%, transparent 65%)`,
        pointerEvents:"none",
      }} />

      <div style={{ display:"flex", gap:14, alignItems:"flex-start", position:"relative" }}>
        {/* Icon */}
        <div style={{
          width:46, height:46, borderRadius:14, flexShrink:0,
          background: `${goal.color}18`,
          border: `1px solid ${goal.color}35`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"1.3rem",
          boxShadow: `0 0 12px ${goal.color}22`,
        }}>
          {goal.icon}
        </div>

        {/* Main content */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:"0.95rem", fontWeight:700, color:"var(--text-primary)", letterSpacing:"-0.015em" }}>
              {goal.title}
            </span>
            {isDone && (
              <span style={{ fontSize:"0.62rem", fontWeight:700, color:goal.color, background:`${goal.color}20`, border:`1px solid ${goal.color}40`, borderRadius:20, padding:"2px 8px" }}>
                ✓ Concluída
              </span>
            )}
            {isPaused && (
              <span style={{ fontSize:"0.62rem", fontWeight:700, color:"var(--text-muted)", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:"2px 8px" }}>
                ⏸ Pausada
              </span>
            )}
          </div>

          {goal.note && (
            <div style={{ fontSize:"0.72rem", color:"var(--text-secondary)", marginBottom:6, fontWeight:400 }}>
              {goal.note}
            </div>
          )}

          {/* Progress bar */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <div style={{ flex:1, height:5, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:3,
                width: mounted ? `${pct}%` : "0%",
                background: isDone
                  ? `linear-gradient(90deg, ${goal.color}cc, ${goal.color})`
                  : `linear-gradient(90deg, ${goal.color}99, ${goal.color})`,
                transition:"width 1.1s cubic-bezier(.4,0,.2,1)",
                boxShadow: `0 0 8px ${goal.color}66`,
              }} />
            </div>
            <span style={{ fontSize:"0.72rem", fontWeight:800, color:goal.color, flexShrink:0 }}>{pct}%</span>
          </div>

          {/* Stats row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontSize:"0.72rem", color:"var(--text-secondary)", fontWeight:500 }}>
              <span style={{ color:"var(--text-primary)", fontWeight:700 }}>{formatUnit(goal.current, goal.unit)}</span>
              {" "}<span style={{ color:"var(--text-muted)" }}>de</span>{" "}
              {formatUnit(goal.target, goal.unit)}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke={dl.color} strokeWidth="2"/>
                <path d="M12 7v5l3 3" stroke={dl.color} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize:"0.68rem", fontWeight:700, color:dl.color }}>{dl.label}</span>
            </div>
          </div>
        </div>

        {/* Ring */}
        <div style={{ flexShrink:0, marginTop:2 }}>
          <ProgressRing pct={pct} color={goal.color} size={48} />
        </div>
      </div>
    </div>
  );
}

/* ── Add / Edit Sheet ────────────────────────────────────── */
function GoalSheet({ goal, onClose, onSave, onDelete }: {
  goal: Goal | null;
  onClose: () => void;
  onSave: (g: Omit<Goal,"id">) => void;
  onDelete?: (id: number) => void;
}) {
  const isEdit = goal !== null;
  const [title,    setTitle]    = useState(goal?.title    ?? "");
  const [category, setCategory] = useState<GoalCategory>(goal?.category ?? "Pessoal");
  const [current,  setCurrent]  = useState(String(goal?.current  ?? ""));
  const [target,   setTarget]   = useState(String(goal?.target   ?? ""));
  const [unit,     setUnit]     = useState(goal?.unit     ?? "");
  const [deadline, setDeadline] = useState(goal?.deadline ?? "");
  const [status,   setStatus]   = useState<GoalStatus>(goal?.status ?? "ativa");
  const [note,     setNote]     = useState(goal?.note     ?? "");

  const cfg = CAT_CFG[category];

  const canSave = title.trim() && target && deadline;

  function handleSave() {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      category,
      current: parseFloat(current) || 0,
      target:  parseFloat(target)  || 0,
      unit:    unit.trim() || "",
      deadline,
      status,
      color: cfg.color,
      icon:  cfg.icon,
      note:  note.trim() || undefined,
    });
  }

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"11px 14px", borderRadius:14,
    background:"rgba(255,255,255,0.06)",
    border:"1px solid rgba(255,255,255,0.12)",
    color:"var(--text-primary)", fontSize:"0.9rem", fontWeight:500,
    outline:"none", fontFamily:"inherit",
  };
  const labelStyle: React.CSSProperties = {
    fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)",
    letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6, display:"block",
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
        backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)", zIndex:300,
      }} />
      {/* Sheet */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:301,
        maxWidth:480, margin:"0 auto",
        background:"rgba(8,9,18,0.94)",
        backdropFilter:"blur(48px) saturate(160%)",
        WebkitBackdropFilter:"blur(48px) saturate(160%)",
        borderTop:"1px solid rgba(255,255,255,0.14)",
        borderRadius:"28px 28px 0 0",
        padding:"20px 20px calc(env(safe-area-inset-bottom, 16px) + 20px)",
        boxShadow:"0 -8px 48px rgba(0,0,0,0.6)",
      }}>
        {/* Handle */}
        <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.18)", margin:"0 auto 18px" }} />

        {/* Title row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <span style={{ fontSize:"1rem", fontWeight:800, color:"var(--text-primary)" }}>
            {isEdit ? "Editar meta" : "Nova meta"}
          </span>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:10, background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.12)", color:"var(--text-secondary)",
            display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Title */}
        <label style={labelStyle}>Título</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Reserva de emergência"
          style={{ ...inputStyle, marginBottom:14 }} />

        {/* Category */}
        <label style={labelStyle}>Categoria</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7, marginBottom:14 }}>
          {ALL_CATS.map(cat => {
            const c = CAT_CFG[cat];
            const active = category === cat;
            return (
              <button key={cat} onClick={()=>setCategory(cat)} style={{
                padding:"9px 6px", borderRadius:12, cursor:"pointer",
                background: active ? `${c.color}22` : "rgba(255,255,255,0.05)",
                border: active ? `1px solid ${c.color}55` : "1px solid rgba(255,255,255,0.1)",
                color: active ? c.color : "var(--text-muted)",
                fontSize:"0.75rem", fontWeight:700, display:"flex", flexDirection:"column",
                alignItems:"center", gap:3,
                boxShadow: active ? `0 0 12px ${c.color}22, inset 0 1px 0 rgba(255,255,255,0.1)` : "none",
                transition:"all 0.18s",
              }}>
                <span style={{ fontSize:"1rem" }}>{c.icon}</span>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Values row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 0.7fr", gap:8, marginBottom:14 }}>
          <div>
            <label style={labelStyle}>Atual</label>
            <input value={current} onChange={e=>setCurrent(e.target.value)} placeholder="0" type="number"
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Meta</label>
            <input value={target} onChange={e=>setTarget(e.target.value)} placeholder="100" type="number"
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Unidade</label>
            <input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="kg"
              style={inputStyle} />
          </div>
        </div>

        {/* Deadline + Status */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
          <div>
            <label style={labelStyle}>Prazo</label>
            <input value={deadline} onChange={e=>setDeadline(e.target.value)} type="date"
              style={{ ...inputStyle, colorScheme:"dark" }} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value as GoalStatus)}
              style={{ ...inputStyle, colorScheme:"dark" }}>
              <option value="ativa">Ativa</option>
              <option value="pausada">Pausada</option>
              <option value="concluída">Concluída</option>
            </select>
          </div>
        </div>

        {/* Note */}
        <label style={labelStyle}>Observação (opcional)</label>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Adicione um detalhe..."
          style={{ ...inputStyle, marginBottom:18 }} />

        {/* Actions */}
        <div style={{ display:"flex", gap:8 }}>
          {isEdit && onDelete && (
            <button onClick={()=>{ onDelete(goal!.id); onClose(); }} style={{
              width:44, height:44, borderRadius:13, cursor:"pointer", flexShrink:0,
              background:"rgba(248,113,113,0.12)", border:"1px solid rgba(248,113,113,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center", color:"#f87171",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button onClick={handleSave} disabled={!canSave} style={{
            flex:1, height:44, borderRadius:13, cursor: canSave ? "pointer" : "not-allowed",
            background: canSave ? `${cfg.color}22` : "rgba(255,255,255,0.05)",
            border: canSave ? `1px solid ${cfg.color}44` : "1px solid rgba(255,255,255,0.08)",
            color: canSave ? cfg.color : "var(--text-muted)",
            fontSize:"0.88rem", fontWeight:700, transition:"all 0.18s",
          }}>
            {isEdit ? "Salvar alterações" : "Criar meta"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Main Screen ─────────────────────────────────────────── */
export default function GoalsScreen({ onBack }: { onBack: () => void }) {
  const [mounted,   setMounted]   = useState(false);
  const [goals,     setGoals]     = useState<Goal[]>(MOCK_GOALS);
  const [filter,    setFilter]    = useState<typeof FILTER_TABS[number]>("Todas");
  const [sheet,     setSheet]     = useState(false);
  const [editGoal,  setEditGoal]  = useState<Goal | null>(null);

  useEffect(() => { setMounted(true); }, []);

  /* filtered list */
  const filtered = goals.filter(g => {
    if (filter === "Ativas")     return g.status === "ativa";
    if (filter === "Concluídas") return g.status === "concluída";
    if (filter === "Pausadas")   return g.status === "pausada";
    return true;
  });

  /* summary */
  const active    = goals.filter(g => g.status === "ativa").length;
  const done      = goals.filter(g => g.status === "concluída").length;
  const avgPct    = goals.length
    ? Math.round(goals.reduce((acc,g) => acc + Math.min((g.current/g.target)*100,100), 0) / goals.length)
    : 0;

  function handleSave(data: Omit<Goal,"id">) {
    if (editGoal) {
      setGoals(gs => gs.map(g => g.id === editGoal.id ? { ...data, id: g.id } : g));
    } else {
      setGoals(gs => [...gs, { ...data, id: Date.now() }]);
    }
    setSheet(false);
    setEditGoal(null);
  }

  function handleDelete(id: number) {
    setGoals(gs => gs.filter(g => g.id !== id));
  }

  function openEdit(g: Goal) {
    setEditGoal(g);
    setSheet(true);
  }

  function openAdd() {
    setEditGoal(null);
    setSheet(true);
  }

  return (
    <div style={{ minHeight:"100dvh", background:"var(--bg-deep)", position:"relative", fontFamily:"var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* Ambient */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:[
          "radial-gradient(ellipse 80% 50% at 30% -5%, rgba(16,185,129,0.18) 0%, transparent 60%)",
          "radial-gradient(ellipse 60% 40% at 85% 85%, rgba(167,139,250,0.12) 0%, transparent 55%)",
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
            <div style={{ fontSize:"1.1rem", fontWeight:800, color:"var(--text-primary)", letterSpacing:"-0.025em" }}>Metas & Objetivos</div>
            <div style={{ fontSize:"0.72rem", color:"var(--text-secondary)", fontWeight:500, marginTop:1 }}>{active} ativas · {done} concluídas</div>
          </div>
        </div>

        {/* ── Summary Card ── */}
        <div style={{ margin:"0 16px 18px",
          background:"rgba(255,255,255,0.06)",
          backdropFilter:"blur(56px) saturate(300%) brightness(1.06)",
          WebkitBackdropFilter:"blur(56px) saturate(300%) brightness(1.06)",
          border:"1px solid rgba(255,255,255,0.13)",
          borderRadius:22,
          padding:"18px 20px",
          boxShadow:"inset 0 1.5px 0 rgba(255,255,255,0.4), 0 8px 32px rgba(0,0,0,0.35)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, right:0, width:160, height:120,
            background:"radial-gradient(circle at 80% 20%, rgba(16,185,129,0.14) 0%, transparent 65%)",
            pointerEvents:"none" }}/>

          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <ProgressRing pct={mounted ? avgPct : 0} color="#10b981" size={72} />

            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8 }}>
                Progresso Geral
              </div>
              <div style={{ display:"flex", gap:16 }}>
                <div>
                  <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#10b981", letterSpacing:"-0.03em", lineHeight:1 }}>{active}</div>
                  <div style={{ fontSize:"0.68rem", color:"var(--text-secondary)", marginTop:3 }}>em andamento</div>
                </div>
                <div style={{ width:1, background:"rgba(255,255,255,0.08)" }}/>
                <div>
                  <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#a78bfa", letterSpacing:"-0.03em", lineHeight:1 }}>{done}</div>
                  <div style={{ fontSize:"0.68rem", color:"var(--text-secondary)", marginTop:3 }}>concluídas</div>
                </div>
                <div style={{ width:1, background:"rgba(255,255,255,0.08)" }}/>
                <div>
                  <div style={{ fontSize:"1.3rem", fontWeight:800, color:"var(--text-primary)", letterSpacing:"-0.03em", lineHeight:1 }}>{goals.length}</div>
                  <div style={{ fontSize:"0.68rem", color:"var(--text-secondary)", marginTop:3 }}>total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Pills ── */}
        <div style={{ display:"flex", gap:7, padding:"0 16px", marginBottom:16, overflowX:"auto", scrollbarWidth:"none" }}>
          {FILTER_TABS.map(tab => {
            const active = filter === tab;
            return (
              <button key={tab} onClick={()=>setFilter(tab)} style={{
                flexShrink:0,
                padding:"7px 16px", borderRadius:20,
                background: active ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.06)",
                border: active ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: active ? "#10b981" : "var(--text-secondary)",
                fontSize:"0.78rem", fontWeight:700, cursor:"pointer",
                boxShadow: active ? "0 0 12px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                transition:"all 0.18s",
              }}>
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── Goal List ── */}
        <div style={{ padding:"0 16px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text-muted)", fontSize:"0.88rem" }}>
              Nenhuma meta aqui
            </div>
          ) : (
            filtered.map(goal => (
              <GoalCard key={goal.id} goal={goal} onEdit={openEdit} mounted={mounted} />
            ))
          )}
        </div>
      </div>

      {/* ── FAB ── */}
      <button onClick={openAdd} style={{
        position:"fixed", bottom:32, right:24, zIndex:200,
        width:58, height:58, borderRadius:19, cursor:"pointer",
        background:"rgba(16,185,129,0.18)",
        backdropFilter:"blur(28px) saturate(180%)", WebkitBackdropFilter:"blur(28px) saturate(180%)",
        border:"1px solid rgba(16,185,129,0.35)",
        boxShadow:"0 8px 32px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      </button>

      {/* ── Sheet ── */}
      {sheet && (
        <GoalSheet
          goal={editGoal}
          onClose={()=>{ setSheet(false); setEditGoal(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
