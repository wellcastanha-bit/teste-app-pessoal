"use client";
import { useState, useEffect, useRef } from "react";

type Priority = "alta" | "média" | "baixa";
type Period   = "ontem" | "hoje" | "amanha" | "semana" | "mes" | "periodo";
type Task = { id: number; title: string; category: string; priority: Priority; done: boolean; time?: string; timeTo?: string };

const PRIORITY_PTS: Record<Priority, number> = { alta: 3, média: 2, baixa: 1 };
const PRIORITY_CFG: Record<Priority, { color: string; bg: string }> = {
  alta:  { color: "#f87171", bg: "rgba(248,113,113,0.15)" },
  média: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
  baixa: { color: "#10b981", bg: "rgba(16,185,129,0.15)"  },
};
const CATEGORY_COLORS: Record<string, string> = {
  "Trabalho": "#00d4ff",
  "Saúde":    "#10b981",
  "Pessoal":  "#a78bfa",
  "Casa":     "#fb923c",
  "Estudos":  "#e879f9",
};
const ALL_CATS = ["Todas", ...Object.keys(CATEGORY_COLORS)];

const PERIODS: { id: Period; label: string }[] = [
  { id: "hoje",    label: "Hoje"     },
  { id: "amanha",  label: "Amanhã"   },
  { id: "semana",  label: "Semana"   },
  { id: "mes",     label: "Mês"      },
  { id: "periodo", label: "Período"  },
];

// Mock tasks por período
const TASKS_DATA: Record<Exclude<Period,"periodo">, Task[]> = {
  ontem: [
    { id:1,  title:"Acordar às 6h",         category:"Pessoal",    priority:"alta",  done:true,  time:"06:00" },
    { id:2,  title:"Academia",              category:"Saúde",    priority:"alta",  done:true,  time:"07:00" },
    { id:3,  title:"Reunião de planejamento",category:"Trabalho", priority:"alta",  done:true,  time:"09:00" },
    { id:4,  title:"Revisar PRs",           category:"Trabalho", priority:"média", done:false, time:"11:00" },
    { id:5,  title:"Almoço saudável",       category:"Saúde",    priority:"baixa", done:true,  time:"12:30" },
    { id:6,  title:"Estudar TypeScript",    category:"Estudos",  priority:"média", done:true,  time:"20:00" },
    { id:7,  title:"Lavar roupa",           category:"Casa",     priority:"baixa", done:false  },
  ],
  hoje: [
    { id:1,  title:"Beber 2L de água",      category:"Saúde",    priority:"alta",  done:true,  time:"07:00" },
    { id:2,  title:"Meditação 10 min",      category:"Pessoal",    priority:"média", done:true,  time:"07:15" },
    { id:3,  title:"Exercício físico",      category:"Saúde",    priority:"alta",  done:false, time:"07:30" },
    { id:4,  title:"Revisar emails",        category:"Trabalho", priority:"alta",  done:true,  time:"09:00" },
    { id:5,  title:"Reunião com equipe",    category:"Trabalho", priority:"alta",  done:true,  time:"10:00" },
    { id:6,  title:"Finalizar relatório",   category:"Trabalho", priority:"alta",  done:false, time:"14:00" },
    { id:7,  title:"Responder clientes",    category:"Trabalho", priority:"média", done:true,  time:"15:00" },
    { id:8,  title:"Ler 20 páginas",        category:"Estudos",  priority:"média", done:false, time:"20:00" },
    { id:9,  title:"Organizar despesas",    category:"Pessoal",  priority:"baixa", done:false, time:"21:00" },
    { id:10, title:"Planejar amanhã",       category:"Pessoal",  priority:"média", done:false, time:"22:00" },
    { id:11, title:"Lavar louça",           category:"Casa",     priority:"baixa", done:true   },
    { id:12, title:"Preparar refeições",    category:"Casa",     priority:"média", done:true   },
  ],
  amanha: [
    { id:1,  title:"Reunião com cliente",   category:"Trabalho", priority:"alta",  done:false, time:"09:00" },
    { id:2,  title:"Entrega de projeto",    category:"Trabalho", priority:"alta",  done:false, time:"12:00" },
    { id:3,  title:"Consulta médica",       category:"Saúde",    priority:"alta",  done:false, time:"15:00" },
    { id:4,  title:"Compras no mercado",    category:"Casa",     priority:"média", done:false, time:"18:00" },
    { id:5,  title:"Ler 20 páginas",        category:"Estudos",  priority:"média", done:false, time:"21:00" },
  ],
  semana: [
    { id:1,  title:"Fechar sprint",         category:"Trabalho", priority:"alta",  done:true,  time:"Sex" },
    { id:2,  title:"Revisão semanal",       category:"Pessoal",  priority:"média", done:false, time:"Dom" },
    { id:3,  title:"5x academia",           category:"Saúde",    priority:"alta",  done:false           },
    { id:4,  title:"Leitura: 100 páginas",  category:"Estudos",  priority:"média", done:false           },
    { id:5,  title:"Organizar casa",        category:"Casa",     priority:"baixa", done:true            },
    { id:6,  title:"Planejar próxima semana",category:"Pessoal", priority:"média", done:false           },
  ],
  mes: [
    { id:1,  title:"Fechar balanço mensal", category:"Trabalho", priority:"alta",  done:false },
    { id:2,  title:"Revisão de metas",      category:"Pessoal",  priority:"alta",  done:false },
    { id:3,  title:"Organizar finanças",    category:"Pessoal",  priority:"média", done:true  },
    { id:4,  title:"Consulta anual",        category:"Saúde",    priority:"média", done:false },
    { id:5,  title:"Curso online",          category:"Estudos",  priority:"baixa", done:false },
  ],
};

// Dados do gráfico semanal: [meta_pts, feito_pts] por dia
const WEEK_CHART = [
  { day: "S", meta: 14, done: 11 },
  { day: "T", meta: 10, done: 10 },
  { day: "Q", meta: 16, done: 9  },
  { day: "Q", meta: 12, done: 12 },
  { day: "S", meta: 18, done: 14 }, // hoje
  { day: "S", meta: 14, done: 0  },
  { day: "D", meta: 8,  done: 0  },
];
const TODAY_IDX = 4;

// ─── Weekly Chart ──────────────────────────────────────────────────────────────
function WeekChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const W = 320, H = 140;
  const PAD = { top: 20, bottom: 24, left: 6, right: 6 };
  const ch = H - PAD.top - PAD.bottom;
  const n = WEEK_CHART.length;
  const maxVal = Math.max(...WEEK_CHART.map(d => d.meta), 1);
  const totalW = W - PAD.left - PAD.right;
  const slotW  = totalW / n;
  const barW   = Math.floor(slotW * 0.34);
  const gap    = 3;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="metaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(167,139,250,0.35)"/>
          <stop offset="100%" stopColor="rgba(167,139,250,0.08)"/>
        </linearGradient>
        <linearGradient id="doneGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5"/>
        </linearGradient>
      </defs>

      {/* grid lines */}
      {[0.5, 1].map(f => (
        <line key={f} x1={PAD.left} x2={W - PAD.right}
          y1={PAD.top + ch * f} y2={PAD.top + ch * f}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}

      {WEEK_CHART.map((d, i) => {
        const cx     = PAD.left + i * slotW + slotW / 2;
        const metaH  = (d.meta / maxVal) * ch;
        const doneH  = (d.done / maxVal) * ch;
        const isToday = i === TODAY_IDX;

        // meta bar (background)
        const mx = cx - barW - gap / 2;
        const my = PAD.top + ch - metaH;
        const mr = Math.min(4, barW / 2);

        // done bar
        const dx = cx + gap / 2;
        const dy = PAD.top + ch - (mounted ? doneH : 0);
        const dr = Math.min(4, barW / 2);
        const dH = mounted ? doneH : 0;

        return (
          <g key={i}>
            {/* today highlight */}
            {isToday && (
              <rect x={cx - slotW / 2 + 2} y={PAD.top - 4} width={slotW - 4} height={ch + 8}
                rx="8" fill="rgba(167,139,250,0.06)"/>
            )}
            {/* meta bar */}
            <path
              d={`M ${mx+mr} ${my} H ${mx+barW-mr} Q ${mx+barW} ${my} ${mx+barW} ${my+mr} V ${PAD.top+ch} H ${mx} V ${my+mr} Q ${mx} ${my} ${mx+mr} ${my} Z`}
              fill="url(#metaGrad)"
            />
            {/* done bar */}
            {dH > 0 && (
              <path
                d={`M ${dx+dr} ${dy} H ${dx+barW-dr} Q ${dx+barW} ${dy} ${dx+barW} ${dy+dr} V ${PAD.top+ch} H ${dx} V ${dy+dr} Q ${dx} ${dy} ${dx+dr} ${dy} Z`}
                fill="url(#doneGrad)"
                style={{ transition: "all 1.1s cubic-bezier(.4,0,.2,1)" }}
              />
            )}
            {dH > 0 && (
              <path d={`M ${dx+dr+1} ${dy+2} H ${dx+barW-dr-1}`}
                stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
            )}
            {/* day label */}
            <text x={cx} y={H - 5} textAnchor="middle"
              fill={isToday ? "#a78bfa" : "rgba(255,255,255,0.3)"}
              fontSize="9.5" fontWeight={isToday ? "800" : "500"}
              fontFamily="-apple-system,sans-serif">
              {d.day}
            </text>
          </g>
        );
      })}

      {/* legend */}
      <rect x={PAD.left} y={PAD.top - 14} width={8} height={8} rx="2" fill="rgba(167,139,250,0.35)"/>
      <text x={PAD.left + 11} y={PAD.top - 7} fill="rgba(255,255,255,0.3)" fontSize="8.5" fontFamily="-apple-system,sans-serif">Meta</text>
      <rect x={PAD.left + 50} y={PAD.top - 14} width={8} height={8} rx="2" fill="#a78bfa"/>
      <text x={PAD.left + 63} y={PAD.top - 7} fill="rgba(255,255,255,0.3)" fontSize="8.5" fontFamily="-apple-system,sans-serif">Realizado</text>
    </svg>
  );
}

// ─── AddTaskSheet ──────────────────────────────────────────────────────────────
function AddTaskSheet({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void;
  onAdd: (t: Omit<Task, "id" | "done">) => void;
}) {
  const [visible,  setVisible]  = useState(false);
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState("Trabalho");
  const [priority, setPriority] = useState<Priority>("média");
  const [time,     setTime]     = useState("");
  const [timeTo,   setTimeTo]   = useState("");

  useEffect(() => {
    if (open) { setTitle(""); setTime(""); setTimeTo(""); requestAnimationFrame(() => setVisible(true)); }
    else setVisible(false);
  }, [open]);

  const ok = title.trim().length > 0;
  const save = () => {
    if (!ok) return;
    onAdd({ title: title.trim(), category, priority, time, timeTo });
    setVisible(false); setTimeout(onClose, 320);
  };

  if (!open) return null;
  return (
    <>
      <div onClick={() => { setVisible(false); setTimeout(onClose, 320); }} style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
        opacity: visible ? 1 : 0, transition: "opacity 0.28s",
      }}/>
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "100%"})`,
        transition: "transform 0.4s cubic-bezier(0.32,0.72,0,1)",
        width: "100%", maxWidth: 480, zIndex: 401,
        background: "rgba(8,9,18,0.92)",
        backdropFilter: "blur(48px) saturate(160%)", WebkitBackdropFilter: "blur(48px) saturate(160%)",
        borderRadius: "28px 28px 0 0",
        border: "1px solid rgba(255,255,255,0.13)", borderBottom: "none",
        boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.16), 0 -20px 60px rgba(0,0,0,0.5)",
        paddingBottom: "env(safe-area-inset-bottom,16px)",
        maxHeight: "85dvh", overflowY: "auto",
      }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.22)" }}/>
        </div>
        <div style={{ padding:"12px 20px 28px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <h2 style={{ fontSize:"1.1rem", fontWeight:800, color:"rgba(255,255,255,0.95)", letterSpacing:"-0.025em", margin:0 }}>Nova tarefa</h2>
            <button onClick={() => { setVisible(false); setTimeout(onClose, 320); }} style={{
              width:30, height:30, borderRadius:"50%",
              background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", color:"rgba(255,255,255,0.6)",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Título */}
          <div style={{ marginBottom:12, background:"rgba(255,255,255,0.05)", border:`1px solid ${title?"rgba(167,139,250,0.4)":"rgba(255,255,255,0.12)"}`, borderRadius:18, padding:"12px 16px", boxShadow:title?"0 0 0 3px rgba(167,139,250,0.12)":"inset 0 1px 0 rgba(255,255,255,0.1)", transition:"all 0.2s" }}>
            <label style={{ fontSize:"0.55rem", fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Tarefa</label>
            <input type="text" placeholder="O que precisa ser feito?" value={title} onChange={e=>setTitle(e.target.value)} autoFocus
              style={{ width:"100%", background:"none", border:"none", outline:"none", fontSize:"0.95rem", fontWeight:600, color:"rgba(255,255,255,0.9)", padding:0, fontFamily:"inherit" }}/>
          </div>

          {/* Prioridade + pontos */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:"0.55rem", fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Prioridade</label>
            <div style={{ display:"flex", gap:8 }}>
              {(["alta","média","baixa"] as Priority[]).map(p => {
                const cfg = PRIORITY_CFG[p];
                const active = priority === p;
                return (
                  <button key={p} onClick={()=>setPriority(p)} style={{
                    flex:1, padding:"9px 6px", borderRadius:12, cursor:"pointer", fontFamily:"inherit",
                    fontSize:"0.75rem", fontWeight:700, transition:"all 0.18s",
                    background:active?cfg.bg:"rgba(255,255,255,0.05)",
                    border:active?`1px solid ${cfg.color}55`:"1px solid rgba(255,255,255,0.1)",
                    color:active?cfg.color:"rgba(255,255,255,0.35)",
                    boxShadow:active?`inset 0 1px 0 rgba(255,255,255,0.2), 0 0 10px ${cfg.color}28`:"none",
                  }}>
                    <div>{p}</div>
                    <div style={{ fontSize:"0.62rem", marginTop:2, opacity:0.7 }}>{PRIORITY_PTS[p]} pts</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categoria */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:"0.55rem", fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Categoria</label>
            <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:2 } as React.CSSProperties}>
              {Object.keys(CATEGORY_COLORS).map(cat => {
                const c = CATEGORY_COLORS[cat];
                const active = category === cat;
                return (
                  <button key={cat} onClick={()=>setCategory(cat)} style={{
                    flexShrink:0, padding:"7px 14px", borderRadius:20, cursor:"pointer", fontFamily:"inherit",
                    fontSize:"0.78rem", fontWeight:600, transition:"all 0.18s",
                    background:active?`${c}20`:"rgba(255,255,255,0.05)",
                    border:active?`1px solid ${c}55`:"1px solid rgba(255,255,255,0.1)",
                    color:active?c:"rgba(255,255,255,0.35)",
                  }}>{cat}</button>
                );
              })}
            </div>
          </div>

          {/* Horário */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:"0.55rem", fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Horário (opcional)</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"8px 12px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ background:"none", border:"none", outline:"none", fontSize:"0.8rem", fontWeight:600, color:time?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.3)", colorScheme:"dark", fontFamily:"inherit", padding:0 }}/>
              </div>
              <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.3)", fontWeight:600 }}>até</span>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"8px 12px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input type="time" value={timeTo} onChange={e=>setTimeTo(e.target.value)} style={{ background:"none", border:"none", outline:"none", fontSize:"0.8rem", fontWeight:600, color:timeTo?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.3)", colorScheme:"dark", fontFamily:"inherit", padding:0 }}/>
              </div>
            </div>
          </div>

          <button onClick={save} disabled={!ok} style={{
            width:"100%", padding:"15px", borderRadius:18, cursor:ok?"pointer":"not-allowed",
            fontFamily:"inherit", fontSize:"0.95rem", fontWeight:800, transition:"all 0.22s",
            background:ok?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.05)",
            border:ok?"1px solid rgba(167,139,250,0.45)":"1px solid rgba(255,255,255,0.1)",
            color:ok?"#a78bfa":"rgba(255,255,255,0.2)",
            boxShadow:ok?"inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 20px rgba(167,139,250,0.2)":"none",
          }}>Adicionar tarefa</button>
        </div>
      </div>
    </>
  );
}

// ─── EditTaskSheet ─────────────────────────────────────────────────────────────
function EditTaskSheet({ task, onClose, onSave }: {
  task: Task | null; onClose: () => void; onSave: (t: Task) => void;
}) {
  const open = task !== null;
  const [visible,  setVisible]  = useState(false);
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState("Trabalho");
  const [priority, setPriority] = useState<Priority>("média");
  const [time,     setTime]     = useState("");
  const [timeTo,   setTimeTo]   = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title); setCategory(task.category);
      setPriority(task.priority); setTime(task.time ?? ""); setTimeTo(task.timeTo ?? "");
      requestAnimationFrame(() => setVisible(true));
    } else setVisible(false);
  }, [task]);

  if (!open) return null;
  const save = () => {
    if (!title.trim()) return;
    onSave({ ...task!, title: title.trim(), category, priority, time, timeTo });
    setVisible(false); setTimeout(onClose, 320);
  };

  return (
    <>
      <div onClick={() => { setVisible(false); setTimeout(onClose, 320); }} style={{
        position:"fixed", inset:0, zIndex:400,
        background:"rgba(0,0,0,0.3)", backdropFilter:"blur(2px)", WebkitBackdropFilter:"blur(2px)",
        opacity:visible?1:0, transition:"opacity 0.28s",
      }}/>
      <div style={{
        position:"fixed", bottom:0, left:"50%",
        transform:`translateX(-50%) translateY(${visible?"0":"100%"})`,
        transition:"transform 0.4s cubic-bezier(0.32,0.72,0,1)",
        width:"100%", maxWidth:480, zIndex:401,
        background:"rgba(8,9,18,0.92)",
        backdropFilter:"blur(48px) saturate(160%)", WebkitBackdropFilter:"blur(48px) saturate(160%)",
        borderRadius:"28px 28px 0 0",
        border:"1px solid rgba(255,255,255,0.13)", borderBottom:"none",
        boxShadow:"inset 0 1.5px 0 rgba(255,255,255,0.16), 0 -20px 60px rgba(0,0,0,0.5)",
        paddingBottom:"env(safe-area-inset-bottom,16px)",
        maxHeight:"85dvh", overflowY:"auto",
      }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.22)" }}/>
        </div>
        <div style={{ padding:"12px 20px 28px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <h2 style={{ fontSize:"1.1rem", fontWeight:800, color:"rgba(255,255,255,0.95)", letterSpacing:"-0.025em", margin:0 }}>Editar tarefa</h2>
            <button onClick={() => { setVisible(false); setTimeout(onClose, 320); }} style={{
              width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.1)",
              border:"1px solid rgba(255,255,255,0.18)", display:"flex", alignItems:"center",
              justifyContent:"center", cursor:"pointer", color:"rgba(255,255,255,0.6)",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {/* Título */}
          <div style={{ marginBottom:12, background:"rgba(255,255,255,0.05)", border:`1px solid ${title?"rgba(167,139,250,0.4)":"rgba(255,255,255,0.12)"}`, borderRadius:18, padding:"12px 16px", transition:"all 0.2s" }}>
            <label style={{ fontSize:"0.55rem", fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:6 }}>Tarefa</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} autoFocus
              style={{ width:"100%", background:"none", border:"none", outline:"none", fontSize:"0.95rem", fontWeight:600, color:"rgba(255,255,255,0.9)", padding:0, fontFamily:"inherit" }}/>
          </div>
          {/* Prioridade */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:"0.55rem", fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Prioridade</label>
            <div style={{ display:"flex", gap:8 }}>
              {(["alta","média","baixa"] as Priority[]).map(p => {
                const cfg = PRIORITY_CFG[p]; const active = priority === p;
                return (
                  <button key={p} onClick={()=>setPriority(p)} style={{
                    flex:1, padding:"9px 6px", borderRadius:12, cursor:"pointer", fontFamily:"inherit",
                    fontSize:"0.75rem", fontWeight:700, transition:"all 0.18s",
                    background:active?cfg.bg:"rgba(255,255,255,0.05)",
                    border:active?`1px solid ${cfg.color}55`:"1px solid rgba(255,255,255,0.1)",
                    color:active?cfg.color:"rgba(255,255,255,0.35)",
                  }}>
                    <div>{p}</div>
                    <div style={{ fontSize:"0.62rem", marginTop:2, opacity:0.7 }}>{PRIORITY_PTS[p]} pts</div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Categoria */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:"0.55rem", fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Categoria</label>
            <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:2 } as React.CSSProperties}>
              {Object.keys(CATEGORY_COLORS).map(cat => {
                const c = CATEGORY_COLORS[cat]; const active = category === cat;
                return (
                  <button key={cat} onClick={()=>setCategory(cat)} style={{
                    flexShrink:0, padding:"7px 14px", borderRadius:20, cursor:"pointer", fontFamily:"inherit",
                    fontSize:"0.78rem", fontWeight:600, transition:"all 0.18s",
                    background:active?`${c}20`:"rgba(255,255,255,0.05)",
                    border:active?`1px solid ${c}55`:"1px solid rgba(255,255,255,0.1)",
                    color:active?c:"rgba(255,255,255,0.35)",
                  }}>{cat}</button>
                );
              })}
            </div>
          </div>
          {/* Horário */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:"0.55rem", fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Horário (opcional)</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"8px 12px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{ background:"none", border:"none", outline:"none", fontSize:"0.8rem", fontWeight:600, color:time?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.3)", colorScheme:"dark", fontFamily:"inherit", padding:0 }}/>
              </div>
              <span style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.3)", fontWeight:600 }}>até</span>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"8px 12px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input type="time" value={timeTo} onChange={e=>setTimeTo(e.target.value)} style={{ background:"none", border:"none", outline:"none", fontSize:"0.8rem", fontWeight:600, color:timeTo?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.3)", colorScheme:"dark", fontFamily:"inherit", padding:0 }}/>
              </div>
            </div>
          </div>
          <button onClick={save} style={{
            width:"100%", padding:"15px", borderRadius:18, cursor:"pointer",
            fontFamily:"inherit", fontSize:"0.95rem", fontWeight:800,
            background:"rgba(167,139,250,0.2)", border:"1px solid rgba(167,139,250,0.45)",
            color:"#a78bfa", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 20px rgba(167,139,250,0.2)",
          }}>Salvar alterações</button>
        </div>
      </div>
    </>
  );
}

// ─── SwipeableTask ─────────────────────────────────────────────────────────────
const SWIPE_OPEN = 116; // pixels to reveal

function SwipeableTask({ task, onToggle, onEdit, onDelete }: {
  task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const isOpen              = useRef(false);
  const startX              = useRef(0);
  const startY              = useRef(0);
  const dragging            = useRef(false);
  const lockAxis            = useRef<"h"|"v"|null>(null);
  const animating           = useRef(false);

  const pc  = PRIORITY_CFG[task.priority];
  const cc  = CATEGORY_COLORS[task.category] ?? "#a78bfa";
  const pts = PRIORITY_PTS[task.priority];

  const snapTo = (target: number) => {
    isOpen.current = target > 0;
    animating.current = true;
    setOffset(target);
    setTimeout(() => { animating.current = false; }, 320);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // don't intercept clicks on buttons (checkbox, etc.)
    if ((e.target as HTMLElement).closest("button")) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = true;
    lockAxis.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!lockAxis.current) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      lockAxis.current = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
    }
    if (lockAxis.current === "v") return;
    e.preventDefault();
    const base = isOpen.current ? -SWIPE_OPEN : 0;
    const raw  = base + dx;
    // only allow left swipe (negative) — clamp between -SWIPE_OPEN-8 and 0
    setOffset(Math.min(0, Math.max(-SWIPE_OPEN - 8, raw)));
  };

  const handlePointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (lockAxis.current !== "h") return;
    snapTo(offset < -SWIPE_OPEN / 2 ? -SWIPE_OPEN : 0);
  };

  return (
    <div style={{ position:"relative", height:"auto", borderRadius:18, overflow:"hidden" }}>
      {/* Actions — always rendered but hidden until card slides */}
      <div style={{
        position:"absolute", right:0, top:0, bottom:0,
        width: SWIPE_OPEN, display:"flex",
      }}>
        <button onClick={() => { snapTo(0); setTimeout(onEdit, 50); }} style={{
          flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3,
          background:"transparent", border:"none", cursor:"pointer",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize:"0.58rem", fontWeight:700, color:"#00d4ff" }}>Editar</span>
        </button>
        <button onClick={() => { snapTo(0); setTimeout(onDelete, 50); }} style={{
          flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3,
          background:"transparent", border:"none", cursor:"pointer",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <polyline points="3 6 5 6 21 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize:"0.58rem", fontWeight:700, color:"#f87171" }}>Apagar</span>
        </button>
      </div>

      {/* Card — slides left to reveal buttons */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging.current ? "none" : "transform 0.3s cubic-bezier(.4,0,.2,1)",
          touchAction: "pan-y",
          userSelect: "none",
          /* dark enough to hide buttons but still glass-like */
          background: "rgba(10,11,22,0.96)",
          backdropFilter: "blur(40px) saturate(240%)",
          WebkitBackdropFilter: "blur(40px) saturate(240%)",
          borderRadius: 18, padding: "13px 16px",
          display: "flex", alignItems: "center", gap: 13,
          border: task.done ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(255,255,255,0.13)",
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.14), 0 3px 14px rgba(0,0,0,0.3)",
          cursor: "grab",
          position: "relative", zIndex: 1,
        }}
      >

        {/* Checkbox */}
        <button onClick={e => { e.stopPropagation(); onToggle(); }} style={{
          width:26, height:26, borderRadius:8, flexShrink:0, cursor:"pointer", position:"relative", zIndex:2,
          background: task.done ? "#a78bfa" : "rgba(255,255,255,0.07)",
          border: task.done ? "1px solid #a78bfa88" : "1px solid rgba(255,255,255,0.2)",
          boxShadow: task.done ? "0 0 10px rgba(167,139,250,0.4), inset 0 1px 0 rgba(255,255,255,0.3)" : "inset 0 1px 0 rgba(255,255,255,0.15)",
          display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.22s",
        }}>
          {task.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>

        {/* Content */}
        <div style={{ flex:1, minWidth:0, position:"relative", zIndex:2, opacity: task.done ? 0.5 : 1, transition:"opacity 0.25s" }}>
          <div style={{ fontSize:"0.88rem", fontWeight:600, color:"rgba(255,255,255,0.9)", textDecoration:task.done?"line-through":"none", marginBottom:4, lineHeight:1.3 }}>{task.title}</div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:"0.62rem", fontWeight:700, padding:"2px 8px", borderRadius:20, background:`${cc}18`, color:cc, border:`1px solid ${cc}33` }}>{task.category}</span>
            {task.time && <span style={{ fontSize:"0.62rem", color:"rgba(255,255,255,0.28)", fontWeight:500 }}>{task.time}{task.timeTo ? ` – ${task.timeTo}` : ""}</span>}
          </div>
        </div>

        {/* Priority */}
        <div style={{ flexShrink:0, position:"relative", zIndex:2 }}>
          <span style={{ fontSize:"0.68rem", fontWeight:700, color:pc.color, background:pc.bg, padding:"3px 10px", borderRadius:20, border:`1px solid ${pc.color}33`, textTransform:"capitalize" }}>{task.priority}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function TasksScreen({ onBack }: { onBack: () => void }) {
  const [period,    setPeriod]    = useState<Period>("hoje");
  const [tasks,     setTasks]     = useState<Task[]>(TASKS_DATA["hoje"]);
  const [filter,    setFilter]    = useState("Todas");
  const [showDone,  setShowDone]  = useState(true);
  const [sheet,     setSheet]     = useState(false);
  const [editTask,  setEditTask]  = useState<Task | null>(null);
  const [mounted,   setMounted]   = useState(false);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo,   setRangeTo]   = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (period !== "periodo") {
      setTasks(TASKS_DATA[period] ?? []);
      setFilter("Todas");
    }
  }, [period]);

  const toggle = (id: number) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask    = (t: Omit<Task,"id"|"done">) => setTasks(ts => [...ts, { ...t, id: Date.now(), done: false }]);
  const deleteTask = (id: number) => setTasks(ts => ts.filter(t => t.id !== id));
  const saveEdit   = (updated: Task) => setTasks(ts => ts.map(t => t.id === updated.id ? updated : t));

  // Pontuação
  const totalPts = tasks.reduce((s, t) => s + PRIORITY_PTS[t.priority], 0);
  const donePts  = tasks.filter(t => t.done).reduce((s, t) => s + PRIORITY_PTS[t.priority], 0);
  const pct      = totalPts > 0 ? Math.round((donePts / totalPts) * 100) : 0;
  const doneCount = tasks.filter(t => t.done).length;

  const filtered = tasks.filter(t => {
    if (filter !== "Todas" && t.category !== filter) return false;
    if (!showDone && t.done) return false;
    return true;
  });

  const today = mounted
    ? new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })
    : "";

  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(56px) saturate(300%) brightness(1.06)",
    WebkitBackdropFilter: "blur(56px) saturate(300%) brightness(1.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 20,
    boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.4), 0 6px 30px rgba(0,0,0,0.35)",
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight:"100dvh", background:"var(--bg-deep)", position:"relative", fontFamily:"var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* Ambient */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:[
          "radial-gradient(ellipse 80% 50% at 20% -5%, rgba(167,139,250,0.2) 0%, transparent 60%)",
          "radial-gradient(ellipse 60% 40% at 85% 80%, rgba(0,212,255,0.12) 0%, transparent 55%)",
        ].join(", "),
      }}/>

      <div style={{ maxWidth:480, margin:"0 auto", position:"relative", zIndex:1, paddingBottom:120 }}>

        {/* Header */}
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
            <div style={{ fontSize:"1.1rem", fontWeight:800, color:"var(--text-primary)", letterSpacing:"-0.025em" }}>Tarefas Diárias</div>
            <div style={{ fontSize:"0.72rem", color:"var(--text-secondary)", fontWeight:500, marginTop:1, textTransform:"capitalize" }}>{today}</div>
          </div>
          <button onClick={()=>setShowDone(v=>!v)} style={{
            padding:"8px 14px", borderRadius:20, cursor:"pointer", fontFamily:"inherit",
            background:showDone?"rgba(167,139,250,0.12)":"rgba(255,255,255,0.07)",
            border:showDone?"1px solid rgba(167,139,250,0.35)":"1px solid rgba(255,255,255,0.14)",
            fontSize:"0.7rem", fontWeight:600,
            color:showDone?"#a78bfa":"rgba(255,255,255,0.4)",
          }}>{showDone?"Ocultar feitas":"Mostrar feitas"}</button>
        </div>

        {/* Period selector */}
        <div style={{ display:"flex", gap:7, padding:"0 20px 12px", overflowX:"auto", scrollbarWidth:"none" } as React.CSSProperties}>
          {PERIODS.map(p => {
            const active = period === p.id;
            return (
              <button key={p.id} onClick={()=>setPeriod(p.id)} style={{
                flexShrink:0, padding:"8px 16px", borderRadius:40, cursor:"pointer", fontFamily:"inherit",
                fontSize:"0.8rem", fontWeight:600, whiteSpace:"nowrap", transition:"all 0.2s",
                background:active?"rgba(167,139,250,0.15)":"rgba(255,255,255,0.06)",
                backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
                border:active?"1px solid rgba(167,139,250,0.45)":"1px solid rgba(255,255,255,0.12)",
                color:active?"#a78bfa":"var(--text-secondary)",
                boxShadow:active?"inset 0 1.5px 0 rgba(167,139,250,0.3), 0 4px 16px rgba(167,139,250,0.12)":"inset 0 1px 0 rgba(255,255,255,0.15)",
              }}>{p.label}</button>
            );
          })}
        </div>

        {/* Date range picker */}
        {period === "periodo" && (
          <div style={{ margin:"0 20px 14px", background:"rgba(167,139,250,0.06)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)", border:"1px solid rgba(167,139,250,0.22)", borderRadius:18, padding:"14px 16px", boxShadow:"inset 0 1px 0 rgba(167,139,250,0.2)" }}>
            <div style={{ fontSize:"0.6rem", fontWeight:700, color:"rgba(167,139,250,0.6)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Selecione o período</div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.55rem", fontWeight:600, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>De</div>
                <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="3" stroke="rgba(167,139,250,0.6)" strokeWidth="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(167,139,250,0.6)" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  <input type="date" value={rangeFrom} onChange={e=>setRangeFrom(e.target.value)} style={{ background:"none", border:"none", outline:"none", flex:1, fontSize:"0.78rem", fontWeight:600, color:rangeFrom?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.25)", colorScheme:"dark", fontFamily:"inherit", padding:0 }}/>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:18 }}><path d="M5 12h14M13 6l6 6-6 6" stroke="rgba(167,139,250,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.55rem", fontWeight:600, color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Até</div>
                <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="3" stroke="rgba(167,139,250,0.6)" strokeWidth="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(167,139,250,0.6)" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  <input type="date" value={rangeTo} onChange={e=>setRangeTo(e.target.value)} style={{ background:"none", border:"none", outline:"none", flex:1, fontSize:"0.78rem", fontWeight:600, color:rangeTo?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.25)", colorScheme:"dark", fontFamily:"inherit", padding:0 }}/>
                </div>
              </div>
            </div>
            {rangeFrom && rangeTo && (
              <button onClick={()=>setTasks(TASKS_DATA["hoje"])} style={{
                width:"100%", marginTop:10, padding:"9px", borderRadius:12, cursor:"pointer", fontFamily:"inherit",
                background:"rgba(167,139,250,0.15)", border:"1px solid rgba(167,139,250,0.4)",
                color:"#a78bfa", fontSize:"0.8rem", fontWeight:700, transition:"all 0.2s",
              }}>Aplicar período</button>
            )}
          </div>
        )}

        {/* Progress card */}
        <div style={{ margin:"0 20px 14px", ...glass, borderRadius:24, padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div>
              <div style={{ fontSize:"0.6rem", fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Pontuação do período</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span style={{ fontSize:"2.2rem", fontWeight:800, color:"rgba(255,255,255,0.95)", letterSpacing:"-0.04em", lineHeight:1 }}>{donePts}</span>
                <span style={{ fontSize:"1rem", fontWeight:600, color:"rgba(255,255,255,0.3)" }}>/ {totalPts} pts</span>
              </div>
              <div style={{ fontSize:"0.7rem", color:"var(--text-secondary)", fontWeight:500, marginTop:3 }}>
                {doneCount} de {tasks.length} tarefas concluídas
              </div>
            </div>
            {/* Circle */}
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" stroke="rgba(255,255,255,0.07)" strokeWidth="5" fill="none"/>
              <circle cx="36" cy="36" r="28"
                stroke="#a78bfa" strokeWidth="5" fill="none"
                strokeDasharray={2*Math.PI*28}
                strokeDashoffset={mounted ? 2*Math.PI*28*(1 - pct/100) : 2*Math.PI*28}
                strokeLinecap="round" transform="rotate(-90 36 36)"
                style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)", filter:"drop-shadow(0 0 6px rgba(167,139,250,0.6))" }}
              />
              <text x="36" y="40" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="800" fontFamily="-apple-system,sans-serif">{pct}%</text>
            </svg>
          </div>
          <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:3,
              width:mounted?`${pct}%`:"0%",
              background:"linear-gradient(90deg, #a78bfa, #c084fc)",
              boxShadow:"0 0 10px rgba(167,139,250,0.6)",
              transition:"width 1.2s cubic-bezier(.4,0,.2,1)",
            }}/>
          </div>
        </div>


        {/* Category filter */}
        <div style={{ display:"flex", gap:7, padding:"0 20px 14px", overflowX:"auto", scrollbarWidth:"none" } as React.CSSProperties}>
          {ALL_CATS.map(cat => {
            const active = filter === cat;
            const c = cat === "Todas" ? "#a78bfa" : CATEGORY_COLORS[cat];
            return (
              <button key={cat} onClick={()=>setFilter(cat)} style={{
                flexShrink:0, padding:"7px 14px", borderRadius:40, cursor:"pointer", fontFamily:"inherit",
                fontSize:"0.75rem", fontWeight:600, whiteSpace:"nowrap", transition:"all 0.2s",
                background:active?`${c}18`:"rgba(255,255,255,0.05)",
                backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
                border:active?`1px solid ${c}44`:"1px solid rgba(255,255,255,0.1)",
                color:active?c:"rgba(255,255,255,0.35)",
              }}>{cat}</button>
            );
          })}
        </div>

        {/* Task list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, padding:"0 20px" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"36px 20px", color:"rgba(255,255,255,0.2)", fontSize:"0.88rem" }}>Nenhuma tarefa aqui</div>
          )}
          {filtered.map(task => (
            <SwipeableTask
              key={task.id}
              task={task}
              onToggle={() => toggle(task.id)}
              onEdit={() => setEditTask(task)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>
      </div>

      {/* FAB */}
      <button onClick={()=>setSheet(true)} style={{
        position:"fixed", bottom:32, right:24, zIndex:200,
        width:58, height:58, borderRadius:19, cursor:"pointer",
        background:"rgba(167,139,250,0.18)", backdropFilter:"blur(28px) saturate(180%)", WebkitBackdropFilter:"blur(28px) saturate(180%)",
        border:"1px solid rgba(167,139,250,0.35)",
        boxShadow:"0 8px 32px rgba(167,139,250,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="#a78bfa" strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      </button>

      <AddTaskSheet open={sheet} onClose={()=>setSheet(false)} onAdd={addTask}/>
      <EditTaskSheet task={editTask} onClose={()=>setEditTask(null)} onSave={saveEdit}/>
    </div>
  );
}
