"use client";
import { useState, useEffect, useRef } from "react";

type Period    = "today" | "7d" | "30d" | "month" | "year";
type EntryType = "expense" | "income" | "invest";

// ─── AddEntrySheet ────────────────────────────────────────────────────────────
const CATS: Record<EntryType, { label: string; icon: string; color: string }[]> = {
  expense: [
    { label: "Operacional", icon: "⚙️", color: "#00d4ff" },
    { label: "Alimentação", icon: "🍽️", color: "#f59e0b" },
    { label: "Transporte",  icon: "🚗", color: "#22d3ee" },
    { label: "Lazer",       icon: "🎮", color: "#e879f9" },
    { label: "Saúde",       icon: "💊", color: "#10b981" },
    { label: "Outros",      icon: "📦", color: "#fb923c" },
  ],
  income: [
    { label: "Salário",   icon: "💰", color: "#10b981" },
    { label: "Freelance", icon: "💼", color: "#a78bfa" },
    { label: "Bônus",     icon: "🎁", color: "#f59e0b" },
    { label: "Outros",    icon: "✨", color: "#fb923c" },
  ],
  invest: [
    { label: "Renda Var.", icon: "📈", color: "#10b981" },
    { label: "Renda Fixa", icon: "🏦", color: "#00d4ff" },
    { label: "Crypto",     icon: "₿",  color: "#f59e0b" },
    { label: "Tesouro",    icon: "🏛️", color: "#a78bfa" },
    { label: "Fundos",     icon: "📊", color: "#22d3ee" },
    { label: "Outros",     icon: "💎", color: "#fb923c" },
  ],
};
const PAYMENTS = ["PIX", "Cartão", "TED", "Dinheiro", "App"];
const TYPE_CFG = {
  expense: { label: "Despesa",       color: "#f87171", bg: "rgba(248,113,113,0.13)", border: "rgba(248,113,113,0.35)" },
  income:  { label: "Receita",       color: "#10b981", bg: "rgba(16,185,129,0.13)",  border: "rgba(16,185,129,0.35)"  },
  invest:  { label: "Investimento",  color: "#a78bfa", bg: "rgba(167,139,250,0.13)", border: "rgba(167,139,250,0.35)" },
};

function AddEntrySheet({ open, initialType, onClose }: {
  open: boolean; initialType: EntryType; onClose: () => void;
}) {
  const [type, setType]       = useState<EntryType>(initialType);
  const [value, setValue]     = useState("");
  const [desc, setDesc]       = useState("");
  const [category, setCat]    = useState("");
  const [payment, setPayment] = useState("PIX");
  const [date, setDate]       = useState("");
  const [saved, setSaved]     = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (open) {
      setType(initialType); setValue(""); setDesc(""); setCat("");
      setPayment("PIX"); setSaved(false);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, initialType]);

  const tc   = TYPE_CFG[type];
  const cats = CATS[type];
  const ok   = !!value && !!category;

  const handleSave = () => {
    if (!ok) return;
    setSaved(true);
    setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 900);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => { setVisible(false); setTimeout(onClose, 300); }} style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px) saturate(140%)",
        opacity: visible ? 1 : 0, transition: "opacity 0.28s",
      }} />

      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "100%"})`,
        transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
        width: "100%", maxWidth: 480,
        /* Apple glass */
        background: "rgba(18,18,28,0.78)",
        backdropFilter: "blur(48px) saturate(200%)",
        WebkitBackdropFilter: "blur(48px) saturate(200%)",
        borderRadius: "28px 28px 0 0",
        border: "1px solid rgba(255,255,255,0.13)", borderBottom: "none",
        boxShadow: "0 -8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
        zIndex: 401,
        maxHeight: "92dvh", overflowY: "auto",
        paddingBottom: "env(safe-area-inset-bottom,16px)",
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)" }} />
        </div>

        <div style={{ padding: "12px 20px 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f0f6ff", letterSpacing: "-0.025em", margin: 0 }}>
              Nova transação
            </h2>
            <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} style={{
              width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.07)",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6b7fa3",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Type selector */}
          <div style={{ display: "flex", gap: 6, marginBottom: 22, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4 }}>
            {(["expense", "income", "invest"] as EntryType[]).map(t => (
              <button key={t} onClick={() => { setType(t); setCat(""); }} style={{
                flex: 1, padding: "9px 4px", borderRadius: 10,
                fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.18s",
                background: type === t ? TYPE_CFG[t].bg : "transparent",
                border: type === t ? `1px solid ${TYPE_CFG[t].border}` : "1px solid transparent",
                color: type === t ? TYPE_CFG[t].color : "#3d4f6b",
              }}>
                {TYPE_CFG[t].label}
              </button>
            ))}
          </div>

          {/* Value */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#3d4f6b", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Valor</label>
            <div style={{
              display: "flex", alignItems: "center",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${value ? tc.color + "50" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 16, padding: "0 18px", transition: "border-color 0.2s",
            }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#3d4f6b", marginRight: 6 }}>R$</span>
              <input
                type="number" inputMode="decimal" placeholder="0,00"
                value={value} onChange={e => setValue(e.target.value)}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: "1.6rem", fontWeight: 800, color: tc.color,
                  padding: "14px 0", letterSpacing: "-0.03em", width: "100%",
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#3d4f6b", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Descrição</label>
            <input
              type="text" placeholder={type === "expense" ? "Ex: iFood, Uber, Netflix…" : type === "income" ? "Ex: Salário abril, Projeto X…" : "Ex: PETR4, Tesouro Selic…"}
              value={desc} onChange={e => setDesc(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
                padding: "13px 16px", fontSize: "0.92rem", color: "#f0f6ff",
                outline: "none", boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#3d4f6b", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Categoria</label>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
              {cats.map(cat => (
                <button key={cat.label} onClick={() => setCat(cat.label)} style={{
                  flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 30, cursor: "pointer", transition: "all 0.15s",
                  background: category === cat.label ? `${cat.color}20` : "rgba(255,255,255,0.05)",
                  border: category === cat.label ? `1px solid ${cat.color}55` : "1px solid rgba(255,255,255,0.09)",
                  fontSize: "0.8rem", fontWeight: 600,
                  color: category === cat.label ? cat.color : "#6b7fa3",
                  fontFamily: "inherit",
                }}>
                  <span style={{ fontSize: "0.95rem" }}>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date + Payment */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#3d4f6b", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Data</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
                  padding: "12px 12px", fontSize: "0.85rem", color: "#f0f6ff",
                  outline: "none", boxSizing: "border-box", colorScheme: "dark",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.68rem", fontWeight: 700, color: "#3d4f6b", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Pagamento</label>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {PAYMENTS.map(p => (
                  <button key={p} onClick={() => setPayment(p)} style={{
                    padding: "6px 10px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                    fontSize: "0.72rem", fontWeight: 600, fontFamily: "inherit",
                    background: payment === p ? `${tc.color}20` : "rgba(255,255,255,0.05)",
                    border: payment === p ? `1px solid ${tc.color}55` : "1px solid rgba(255,255,255,0.09)",
                    color: payment === p ? tc.color : "#6b7fa3",
                  }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={!ok} style={{
            width: "100%", padding: "16px", borderRadius: 16, border: "none",
            cursor: ok ? "pointer" : "not-allowed", fontFamily: "inherit",
            background: saved
              ? "linear-gradient(135deg,#10b981,#059669)"
              : ok
              ? `linear-gradient(135deg,${tc.color},${tc.color}bb)`
              : "rgba(255,255,255,0.06)",
            color: ok ? "white" : "#3d4f6b",
            fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.01em",
            transition: "all 0.22s",
            boxShadow: ok && !saved ? `0 8px 24px ${tc.color}40` : "none",
          }}>
            {saved ? "✓  Salvo com sucesso!" : "Salvar"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── useCountUp ───────────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number, trigger: number) {
  const [v, setV] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    setV(0);
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(ease * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, trigger]);
  return v;
}

// ─── Expense Chart — Apple-style area chart ───────────────────────────────────
function ExpenseChart({ values, labels }: { values: number[]; labels: string[] }) {
  const C = "#f87171";
  const W = 320, H = 170;
  const PAD = { top: 30, bottom: 22, left: 6, right: 6 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const active = values.map((v, i) => ({ v, i, active: v > 0 }));
  const mx = Math.max(...active.filter(a => a.active).map(a => a.v), 1);

  const gx = (i: number) => PAD.left + (i / (values.length - 1)) * cw;
  const gy = (v: number) => PAD.top + ch - (v / mx) * (ch - 4);

  // Build cubic bezier through all points (treating 0 as floor)
  const pts = values.map((v, i) => ({ x: gx(i), y: v > 0 ? gy(v) : PAD.top + ch }));

  let line = `M ${pts[0].x} ${pts[0].y}`;
  let area = `M ${pts[0].x} ${PAD.top + ch} L ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const c1x = pts[i].x + dx * 0.42, c1y = pts[i].y;
    const c2x = pts[i + 1].x - dx * 0.42, c2y = pts[i + 1].y;
    line += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
    area += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  area += ` L ${pts[pts.length - 1].x} ${PAD.top + ch} Z`;

  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="expArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C} stopOpacity="0.28" />
          <stop offset="100%" stopColor={C} stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="expClip">
          <rect x={PAD.left} y={PAD.top} width={cw} height={ch + 1} />
        </clipPath>
      </defs>

      {/* subtle horizontal grid lines */}
      {[0.33, 0.66].map(f => (
        <line key={f}
          x1={PAD.left} y1={PAD.top + ch * f}
          x2={W - PAD.right} y2={PAD.top + ch * f}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1"
        />
      ))}

      {/* gradient area fill */}
      <path d={area} fill="url(#expArea)" clipPath="url(#expClip)" />

      {/* line */}
      <path d={line} fill="none" stroke={C} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* dots + value labels */}
      {values.map((v, i) => {
        if (!v) return null;
        const x = gx(i), y = gy(v);
        return (
          <g key={i}>
            {/* outer glow ring */}
            <circle cx={x} cy={y} r="5.5" fill={C} opacity="0.18" />
            {/* solid dot */}
            <circle cx={x} cy={y} r="3.5" fill={C} />
            {/* inner cutout */}
            <circle cx={x} cy={y} r="1.6" fill="#0c0c18" />
            {/* value label */}
            <text x={x} y={y - 11} textAnchor="middle" fill={C}
              fontSize="10" fontWeight="700" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">
              {fmt(v)}
            </text>
          </g>
        );
      })}

      {/* x-axis labels */}
      {labels.map((lbl, i) => (
        <text key={i} x={gx(i)} y={H - 4}
          textAnchor="middle" fill="rgba(255,255,255,0.3)"
          fontSize="10" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">
          {lbl}
        </text>
      ))}
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
type ExpItem = { desc: string; date: string; payment: string; value: number };
type Cat = { label: string; icon: string; total: number; pct: number; color: string; items: ExpItem[] };
type AlertItem = { type: "warn" | "good" | "info"; text: string };

type PData = {
  balance: number; income: number; expense: number; invest: number; profit: number; margin: number; dailyAvg: number;
  vsPrev: { income: number; expense: number; profit: number; margin: number };
  chartLabels: string[];
  chartIncome: number[]; chartExpense: number[]; chartBalance: number[];
  expenses: Cat[]; incomes: Cat[]; alerts: AlertItem[];
};

const DATA: Record<Period, PData> = {
  today: {
    balance: 4280, income: 420, expense: 180, invest: 0, profit: 240, margin: 57.1, dailyAvg: 240,
    vsPrev: { income: 5, expense: -3, profit: 8, margin: 2 },
    chartLabels: ["8h", "10h", "12h", "14h", "16h", "18h", "20h"],
    chartIncome:  [0, 0, 420, 420, 420, 420, 420],
    chartExpense: [0, 45,  45,  90, 130, 180, 180],
    chartBalance: [4040, 3995, 4375, 4330, 4290, 4280, 4280],
    expenses: [
      { label: "Alimentação", icon: "🍽️", total: 95, pct: 52.8, color: "#f59e0b", items: [
        { desc: "iFood — Almoço", date: "Hoje 12:30", payment: "Cartão", value: 45 },
        { desc: "Supermercado", date: "Hoje 09:00", payment: "PIX", value: 50 },
      ]},
      { label: "Transporte", icon: "🚗", total: 55, pct: 30.6, color: "#22d3ee", items: [
        { desc: "Uber — Trabalho", date: "Hoje 07:45", payment: "App", value: 32 },
        { desc: "Estacionamento", date: "Hoje 14:00", payment: "Dinheiro", value: 23 },
      ]},
      { label: "Lazer", icon: "🎮", total: 30, pct: 16.7, color: "#e879f9", items: [
        { desc: "Streaming", date: "Hoje 08:00", payment: "Cartão", value: 30 },
      ]},
    ],
    incomes: [
      { label: "Freelance", icon: "💼", total: 420, pct: 100, color: "#10b981", items: [
        { desc: "Projeto Web", date: "Hoje 10:00", payment: "PIX", value: 420 },
      ]},
    ],
    alerts: [
      { type: "good", text: "Receita 75% acima da média diária" },
      { type: "info", text: "Alimentação representa mais da metade das despesas" },
    ],
  },
  "7d": {
    balance: 4280, income: 2840, expense: 1120, invest: 150, profit: 1720, margin: 60.6, dailyAvg: 245,
    vsPrev: { income: 8, expense: 12, profit: 4, margin: -2 },
    chartLabels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    chartIncome:  [850,   0,  620,   0, 950, 420,   0],
    chartExpense: [180,  95,  240, 160, 220, 180,  45],
    chartBalance: [3710, 3615, 3995, 3835, 4565, 4805, 4760],
    expenses: [
      { label: "Operacional", icon: "⚙️", total: 380, pct: 33.9, color: "#00d4ff", items: [
        { desc: "Assinatura SaaS", date: "Seg 09:00", payment: "Cartão", value: 180 },
        { desc: "Internet", date: "Qua 10:00", payment: "Débito", value: 120 },
        { desc: "Celular", date: "Qui 10:00", payment: "Débito", value: 80 },
      ]},
      { label: "Alimentação", icon: "🍽️", total: 320, pct: 28.6, color: "#f59e0b", items: [
        { desc: "Supermercado", date: "Qua 14:00", payment: "Cartão", value: 180 },
        { desc: "Restaurantes", date: "Vários", payment: "Cartão/PIX", value: 140 },
      ]},
      { label: "Transporte", icon: "🚗", total: 220, pct: 19.6, color: "#22d3ee", items: [
        { desc: "Combustível", date: "Ter 11:00", payment: "Cartão", value: 160 },
        { desc: "Uber / 99", date: "Vários", payment: "App", value: 60 },
      ]},
      { label: "Lazer", icon: "🎮", total: 200, pct: 17.9, color: "#e879f9", items: [
        { desc: "Cinema", date: "Sáb 19:00", payment: "Cartão", value: 80 },
        { desc: "Streaming", date: "Dom 08:00", payment: "Cartão", value: 120 },
      ]},
    ],
    incomes: [
      { label: "Salário", icon: "💰", total: 1800, pct: 63.4, color: "#10b981", items: [
        { desc: "Adiantamento", date: "Seg 09:00", payment: "TED", value: 1800 },
      ]},
      { label: "Freelance", icon: "💼", total: 750, pct: 26.4, color: "#a78bfa", items: [
        { desc: "Projeto UI", date: "Qua 14:00", payment: "PIX", value: 420 },
        { desc: "Consultoria", date: "Sex 16:00", payment: "PIX", value: 330 },
      ]},
      { label: "Outros", icon: "✨", total: 290, pct: 10.2, color: "#fb923c", items: [
        { desc: "Venda Marketplace", date: "Sáb 11:00", payment: "PIX", value: 290 },
      ]},
    ],
    alerts: [
      { type: "warn", text: "Despesas cresceram 12% vs semana anterior" },
      { type: "info", text: "Maior gasto: Operacional (33.9%)" },
      { type: "good", text: "Receitas acima da meta semanal" },
    ],
  },
  "30d": {
    balance: 4280, income: 8200, expense: 2980, invest: 800, profit: 5220, margin: 63.7, dailyAvg: 174,
    vsPrev: { income: 14, expense: 20, profit: 6, margin: -3 },
    chartLabels: ["S1", "S2", "S3", "S4"],
    chartIncome:  [2100, 2400, 2200, 1500],
    chartExpense: [ 720,  840,  760,  660],
    chartBalance: [1380, 2940, 4380, 5220],
    expenses: [
      { label: "Operacional", icon: "⚙️", total: 1100, pct: 36.9, color: "#00d4ff", items: [
        { desc: "Ferramentas SaaS", date: "01/04", payment: "Cartão", value: 600 },
        { desc: "Internet / Telecom", date: "05/04", payment: "Débito", value: 280 },
        { desc: "Serviços Cloud", date: "10/04", payment: "Cartão", value: 220 },
      ]},
      { label: "Alimentação", icon: "🍽️", total: 680, pct: 22.8, color: "#f59e0b", items: [
        { desc: "Mercado", date: "Quinzenal", payment: "Cartão", value: 440 },
        { desc: "Delivery", date: "Semanal", payment: "App", value: 240 },
      ]},
      { label: "Transporte", icon: "🚗", total: 420, pct: 14.1, color: "#22d3ee", items: [
        { desc: "Combustível", date: "Semanal", payment: "Cartão", value: 320 },
        { desc: "Uber / 99", date: "Eventual", payment: "App", value: 100 },
      ]},
      { label: "Lazer", icon: "🎮", total: 480, pct: 16.1, color: "#e879f9", items: [
        { desc: "Streamings", date: "01/04", payment: "Cartão", value: 220 },
        { desc: "Eventos", date: "Quinzenal", payment: "Cartão", value: 260 },
      ]},
      { label: "Outros", icon: "📦", total: 300, pct: 10.1, color: "#fb923c", items: [
        { desc: "Vestuário", date: "15/04", payment: "Cartão", value: 190 },
        { desc: "Farmácia", date: "Variado", payment: "Cartão/PIX", value: 110 },
      ]},
    ],
    incomes: [
      { label: "Salário", icon: "💰", total: 6500, pct: 79.3, color: "#10b981", items: [
        { desc: "Salário + Bônus", date: "05/04", payment: "TED", value: 6500 },
      ]},
      { label: "Freelance", icon: "💼", total: 1200, pct: 14.6, color: "#a78bfa", items: [
        { desc: "Projeto App", date: "12/04", payment: "PIX", value: 720 },
        { desc: "Consultoria", date: "22/04", payment: "PIX", value: 480 },
      ]},
      { label: "Investimentos", icon: "📈", total: 500, pct: 6.1, color: "#10b981", items: [
        { desc: "Renda variável", date: "30/04", payment: "Corretora", value: 500 },
      ]},
    ],
    alerts: [
      { type: "warn", text: "Saídas cresceram 20% vs 30 dias anteriores" },
      { type: "warn", text: "Margem caiu de 66.7% para 63.7%" },
      { type: "info", text: "Maior despesa: Operacional (36.9%)" },
      { type: "good", text: "Receitas 14% acima vs período anterior" },
    ],
  },
  month: {
    balance: 4280, income: 6500, expense: 2220, invest: 400, profit: 4280, margin: 65.8, dailyAvg: 143,
    vsPrev: { income: 12, expense: 18, profit: -9, margin: -6 },
    chartLabels: ["S", "T", "Q", "Q", "S", "S", "D"],
    chartIncome:  [850,   0, 1200,   0, 950, 420,   0],
    chartExpense: [180,  95,  240, 160, 320, 180,  45],
    chartBalance: [3710, 3615, 4575, 4415, 5045, 5285, 5240],
    expenses: [
      { label: "Operacional", icon: "⚙️", total: 850, pct: 38.3, color: "#00d4ff", items: [
        { desc: "Ferramentas SaaS", date: "01/04", payment: "Cartão", value: 480 },
        { desc: "Internet / Telecom", date: "05/04", payment: "Débito", value: 200 },
        { desc: "Serviços Cloud", date: "10/04", payment: "Cartão", value: 170 },
      ]},
      { label: "Alimentação", icon: "🍽️", total: 420, pct: 18.9, color: "#f59e0b", items: [
        { desc: "Mercado", date: "Quinzenal", payment: "Cartão", value: 280 },
        { desc: "Delivery", date: "Semanal", payment: "App", value: 140 },
      ]},
      { label: "Transporte", icon: "🚗", total: 280, pct: 12.6, color: "#22d3ee", items: [
        { desc: "Combustível", date: "Semanal", payment: "Cartão", value: 200 },
        { desc: "Uber / 99", date: "Eventual", payment: "App", value: 80 },
      ]},
      { label: "Lazer", icon: "🎮", total: 380, pct: 17.1, color: "#e879f9", items: [
        { desc: "Streamings", date: "01/04", payment: "Cartão", value: 180 },
        { desc: "Eventos / Saídas", date: "Quinzenal", payment: "Cartão", value: 200 },
      ]},
      { label: "Outros", icon: "📦", total: 290, pct: 13.1, color: "#fb923c", items: [
        { desc: "Vestuário", date: "15/04", payment: "Cartão", value: 180 },
        { desc: "Farmácia", date: "Variado", payment: "Cartão/PIX", value: 110 },
      ]},
    ],
    incomes: [
      { label: "Salário", icon: "💰", total: 5200, pct: 80, color: "#10b981", items: [
        { desc: "Salário base", date: "05/04", payment: "TED", value: 5200 },
      ]},
      { label: "Freelance", icon: "💼", total: 900, pct: 13.8, color: "#a78bfa", items: [
        { desc: "Projeto App", date: "12/04", payment: "PIX", value: 560 },
        { desc: "Consultoria", date: "19/04", payment: "PIX", value: 340 },
      ]},
      { label: "Investimentos", icon: "📈", total: 400, pct: 6.2, color: "#10b981", items: [
        { desc: "Renda variável", date: "30/04", payment: "Corretora", value: 400 },
      ]},
    ],
    alerts: [
      { type: "warn", text: "Saídas cresceram 18% vs mês anterior" },
      { type: "warn", text: "Margem caiu de 71.8% para 65.8%" },
      { type: "info", text: "Maior despesa: Operacional (38.3%)" },
      { type: "good", text: "Receitas 12% acima vs mês anterior" },
    ],
  },
  year: {
    balance: 4280, income: 52800, expense: 21600, invest: 3000, profit: 31200, margin: 59.1, dailyAvg: 86,
    vsPrev: { income: 22, expense: 15, profit: 28, margin: 3 },
    chartLabels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    chartIncome:  [4200, 4500, 4800, 6500, 0, 0, 0, 0, 0, 0, 0, 0],
    chartExpense: [1800, 1920, 1980, 2220, 0, 0, 0, 0, 0, 0, 0, 0],
    chartBalance: [2400, 4980, 7800, 12080, 0, 0, 0, 0, 0, 0, 0, 0],
    expenses: [
      { label: "Operacional", icon: "⚙️", total: 8400, pct: 38.9, color: "#00d4ff", items: [
        { desc: "Ferramentas SaaS", date: "Mensal", payment: "Cartão", value: 4800 },
        { desc: "Internet / Telecom", date: "Mensal", payment: "Débito", value: 2400 },
        { desc: "Serviços Cloud", date: "Mensal", payment: "Cartão", value: 1200 },
      ]},
      { label: "Alimentação", icon: "🍽️", total: 4320, pct: 20, color: "#f59e0b", items: [
        { desc: "Mercado", date: "Quinzenal", payment: "Cartão", value: 2880 },
        { desc: "Delivery", date: "Semanal", payment: "App", value: 1440 },
      ]},
      { label: "Transporte", icon: "🚗", total: 3240, pct: 15, color: "#22d3ee", items: [
        { desc: "Combustível", date: "Semanal", payment: "Cartão", value: 2400 },
        { desc: "Manutenção", date: "Trimestral", payment: "Cartão", value: 840 },
      ]},
      { label: "Lazer", icon: "🎮", total: 2880, pct: 13.3, color: "#e879f9", items: [
        { desc: "Streamings", date: "Mensal", payment: "Cartão", value: 1440 },
        { desc: "Eventos", date: "Mensal", payment: "Cartão", value: 1440 },
      ]},
      { label: "Outros", icon: "📦", total: 2760, pct: 12.8, color: "#fb923c", items: [
        { desc: "Vestuário", date: "Trimestral", payment: "Cartão", value: 1440 },
        { desc: "Saúde", date: "Variado", payment: "Cartão/PIX", value: 1320 },
      ]},
    ],
    incomes: [
      { label: "Salário", icon: "💰", total: 43200, pct: 81.8, color: "#10b981", items: [
        { desc: "Salário base", date: "Mensal", payment: "TED", value: 43200 },
      ]},
      { label: "Freelance", icon: "💼", total: 6600, pct: 12.5, color: "#a78bfa", items: [
        { desc: "Projetos variados", date: "Variado", payment: "PIX", value: 6600 },
      ]},
      { label: "Investimentos", icon: "📈", total: 3000, pct: 5.7, color: "#10b981", items: [
        { desc: "Renda variável", date: "Mensal", payment: "Corretora", value: 3000 },
      ]},
    ],
    alerts: [
      { type: "good", text: "Receitas cresceram 22% vs ano anterior" },
      { type: "good", text: "Margem melhorou 3 pontos percentuais" },
      { type: "info", text: "Maior despesa: Operacional (38.9%)" },
      { type: "warn", text: "Fique atento aos gastos Operacionais" },
    ],
  },
};

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "7d",    label: "7 dias" },
  { id: "30d",   label: "30 dias" },
  { id: "month", label: "Esse mês" },
  { id: "year",  label: "Esse ano" },
];


const ALERT_STYLE = {
  warn: { bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)",  color: "#fb923c", icon: "⚠️" },
  good: { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  color: "#10b981", icon: "✅" },
  info: { bg: "rgba(0,212,255,0.08)",  border: "rgba(0,212,255,0.2)",    color: "#00d4ff", icon: "ℹ️" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FinanceScreen({ onBack }: { onBack: () => void }) {
  const [period, setPeriod]   = useState<Period>("month");
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [expandedInc, setExpandedInc] = useState<string | null>(null);
  const [sheet, setSheet] = useState<EntryType | null>(null);
  const [trigger, setTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const d = DATA[period];
  const animBalance  = useCountUp(d.balance,  1300, trigger);
  const animIncome   = useCountUp(d.income,   1100, trigger);
  const animExpense  = useCountUp(d.expense,  1100, trigger);
  const animInvest   = useCountUp(d.invest,   1100, trigger);

  const handlePeriod = (p: Period) => { setPeriod(p); setTrigger(t => t + 1); };

  const fmt  = (n: number) => n.toLocaleString("pt-BR");
  const fmtR = (n: number) => `R$\u00a0${n.toLocaleString("pt-BR")}`;
  const fmtSign = (n: number, suffix = "%") => `${n > 0 ? "+" : ""}${n}${suffix}`;

  // chart sempre mostra a semana atual (dias S T Q Q S S D)
  const weekData    = DATA["month"].chartExpense;
  const weekLabels  = DATA["month"].chartLabels;
  const expenseTotal = weekData.reduce((a, b) => a + b, 0);

  if (!mounted) return null;

  // ── Shared style tokens ──────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-deep)", position: "relative", fontFamily: "var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 85%, rgba(167,139,250,0.04) 0%, transparent 50%)" }} />

      <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1, paddingBottom: 120 }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px 14px" }}>
          <button onClick={onBack} aria-label="Voltar" style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-secondary)", cursor: "pointer",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              Controle Financeiro
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: 2 }}>
              Visão geral do período
            </div>
          </div>
          <div style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="14" rx="3" stroke="#00d4ff" strokeWidth="1.8" />
              <path d="M2 10h20" stroke="#00d4ff" strokeWidth="1.8" />
              <circle cx="16.5" cy="15" r="1.5" fill="#00d4ff" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* ── Period Selector ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, padding: "0 20px 20px", overflowX: "auto", scrollbarWidth: "none" }}>
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => handlePeriod(p.id)} style={{
              flexShrink: 0, padding: "9px 18px", borderRadius: 40,
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.18s",
              background: period === p.id ? "rgba(0,212,255,0.14)" : "rgba(255,255,255,0.05)",
              border: period === p.id ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.09)",
              color: period === p.id ? "#00d4ff" : "var(--text-secondary)",
            }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Summary Card ─────────────────────────────────────────────────── */}
        <div style={{
          margin: "0 20px 14px",
          padding: "22px 20px 18px",
          borderRadius: 24,
          background: "linear-gradient(135deg, #0d1f38 0%, #070f1d 55%, #0b0a1c 100%)",
          border: "1px solid rgba(0,212,255,0.16)",
          position: "relative", overflow: "hidden",
        }}>
          {/* top shimmer line */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.55), transparent)" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Saldo Atual
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, background: "linear-gradient(135deg,#e8f4ff,#a0c8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>R$</span>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1, background: "linear-gradient(135deg,#e8f4ff,#a0c8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {fmt(animBalance)}
                </span>
                <span style={{ fontSize: "1.2rem", fontWeight: 600, opacity: 0.4, background: "linear-gradient(135deg,#e8f4ff,#a0c8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>,00</span>
              </div>
            </div>
            <div style={{
              padding: "5px 12px", borderRadius: 20, marginTop: 4,
              background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.22)",
              fontSize: "0.72rem", fontWeight: 600, color: "#00d4ff",
            }}>
              {PERIODS.find(p => p.id === period)?.label}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Entradas */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: "rgba(16,185,129,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 500, marginBottom: 1 }}>Entradas</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#10b981", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{fmtR(animIncome)}</div>
              </div>
            </div>
            <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)", margin: "0 10px", flexShrink: 0 }} />
            {/* Saídas */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: "rgba(248,113,113,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M19 12l-7 7-7-7" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 500, marginBottom: 1 }}>Saídas</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#f87171", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{fmtR(animExpense)}</div>
              </div>
            </div>
            <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)", margin: "0 10px", flexShrink: 0 }} />
            {/* Investimentos */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: "rgba(167,139,250,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16 7 22 7 22 13" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 500, marginBottom: 1 }}>Investimentos</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#a78bfa", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{fmtR(animInvest)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Expense Chart ─────────────────────────────────────────────────── */}
        <div style={{ margin: "0 20px 14px", ...card, padding: "18px 16px 10px", position: "relative", overflow: "hidden" }}>
          {/* top shimmer */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.4), transparent)" }} />
          {/* header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                💸 Despesas
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                Semana atual
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                Acumulado
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#f87171", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {fmtR(expenseTotal)}
              </div>
            </div>
          </div>
          <ExpenseChart values={weekData} labels={weekLabels} />
        </div>

        {/* ── Expenses ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 10 }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Despesas</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#f87171" }}>{fmtR(d.expense)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 20px 16px" }}>
          {d.expenses.map(cat => {
            const open = expandedExp === cat.label;
            return (
              <div key={cat.label} style={{ ...card, borderRadius: 18, border: open ? `1px solid ${cat.color}30` : "1px solid rgba(255,255,255,0.08)" }}>
                <button onClick={() => setExpandedExp(open ? null : cat.label)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: `${cat.color}18`, border: `1px solid ${cat.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{cat.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${cat.pct}%`, height: "100%", background: cat.color, borderRadius: 2, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: cat.color, flexShrink: 0 }}>{cat.pct}%</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{fmtR(cat.total)}</span>
                    <span style={{ color: "var(--text-muted)", display: "flex", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.22s" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </div>
                </button>
                {open && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 16px 12px", display: "flex", flexDirection: "column", gap: 0 }}>
                    {cat.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i < cat.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>{item.date} · {item.payment}</div>
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#f87171", flexShrink: 0 }}>− {fmtR(item.value)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Incomes ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 10 }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Entradas</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#10b981" }}>{fmtR(d.income)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 20px 16px" }}>
          {d.incomes.map(src => {
            const open = expandedInc === src.label;
            return (
              <div key={src.label} style={{ ...card, borderRadius: 18, border: open ? `1px solid ${src.color}30` : "1px solid rgba(255,255,255,0.08)" }}>
                <button onClick={() => setExpandedInc(open ? null : src.label)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: `${src.color}18`, border: `1px solid ${src.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                    {src.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{src.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${src.pct}%`, height: "100%", background: src.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: src.color, flexShrink: 0 }}>{src.pct}%</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#10b981", whiteSpace: "nowrap" }}>+ {fmtR(src.total)}</span>
                    <span style={{ color: "var(--text-muted)", display: "flex", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.22s" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </div>
                </button>
                {open && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 16px 12px", display: "flex", flexDirection: "column", gap: 0 }}>
                    {src.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i < src.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>{item.date} · {item.payment}</div>
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#10b981", flexShrink: 0 }}>+ {fmtR(item.value)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>


      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, pointerEvents: "none" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", height: 100 }}>
          <button
            onClick={() => setSheet("expense")}
            aria-label="Nova transação"
            style={{
              position: "absolute", bottom: 24, right: 20,
              width: 60, height: 60, borderRadius: 20,
              pointerEvents: "all", cursor: "pointer",
              /* Apple glass */
              background: "rgba(255,255,255,0.13)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.22)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 0.5px rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="rgba(255,255,255,0.95)" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Bottom Sheet ─────────────────────────────────────────────────────── */}
      <AddEntrySheet
        open={sheet !== null}
        initialType={sheet ?? "expense"}
        onClose={() => setSheet(null)}
      />

    </div>
  );
}
