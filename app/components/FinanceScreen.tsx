"use client";
import { useState, useEffect, useRef } from "react";

type Period    = "today" | "7d" | "30d" | "month" | "year";
type EntryType = "expense" | "income" | "invest" | "transfer";

// ─── AddEntrySheet ────────────────────────────────────────────────────────────
const CATS: Record<EntryType, { label: string; icon: string; color: string }[]> = {
  transfer: [],
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
const PAYMENTS = ["Crédito", "Débito", "PIX", "Dinheiro"];
const TYPE_CFG = {
  income:   { label: "Receita",       color: "#10b981", bg: "rgba(16,185,129,0.13)",  border: "rgba(16,185,129,0.35)"  },
  expense:  { label: "Despesa",       color: "#f87171", bg: "rgba(248,113,113,0.13)", border: "rgba(248,113,113,0.35)" },
  invest:   { label: "Investimento",  color: "#a78bfa", bg: "rgba(167,139,250,0.13)", border: "rgba(167,139,250,0.35)" },
  transfer: { label: "Transferência", color: "#00d4ff", bg: "rgba(0,212,255,0.13)",   border: "rgba(0,212,255,0.35)"   },
};

function AddEntrySheet({ open, initialType, onClose }: {
  open: boolean; initialType: EntryType; onClose: () => void;
}) {
  const [type, setType]       = useState<EntryType>(initialType);
  const [value, setValue]     = useState("");
  const [desc, setDesc]       = useState("");
  const [category, setCat]    = useState("");
  const [payment, setPayment] = useState("Crédito");
  const [fromAcc, setFromAcc] = useState("Sicredi");
  const [toAcc,   setToAcc]   = useState("Nubank");
  const [date, setDate]       = useState("");
  const [saved, setSaved]     = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (open) {
      setType(initialType); setValue(""); setDesc(""); setCat("");
      setPayment("Crédito"); setFromAcc("Sicredi"); setToAcc("Nubank"); setSaved(false);
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
      {/* Backdrop — leve escurecimento, conteúdo atrás visível */}
      <div onClick={() => { setVisible(false); setTimeout(onClose, 300); }} style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        opacity: visible ? 1 : 0, transition: "opacity 0.28s",
      }} />

      {/* Sheet — Dark Liquid Glass alinhado à paleta */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "100%"})`,
        transition: "transform 0.42s cubic-bezier(0.32,0.72,0,1)",
        width: "100%", maxWidth: 480,
        background: "rgba(8,9,18,0.88)",
        backdropFilter: "blur(48px) saturate(160%)",
        WebkitBackdropFilter: "blur(48px) saturate(160%)",
        borderRadius: "32px 32px 0 0",
        border: "1px solid rgba(255,255,255,0.14)",
        borderBottom: "none",
        boxShadow: [
          "inset 0 1.5px 0 rgba(255,255,255,0.18)",
          "inset 1px 0 0 rgba(255,255,255,0.06)",
          "inset -1px 0 0 rgba(255,255,255,0.06)",
          "0 -24px 80px rgba(0,0,0,0.6)",
        ].join(", "),
        zIndex: 401,
        maxHeight: "92dvh", overflowY: "auto",
        paddingBottom: "env(safe-area-inset-bottom,16px)",
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
          <div style={{ width: 44, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.28)" }} />
        </div>

        <div style={{ padding: "14px 20px 28px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.03em", margin: 0 }}>
              Nova transação
            </h2>
            <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} style={{
              width: 32, height: 32, borderRadius: 50,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.7)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Type selector — 2×2 grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 22,
          }}>
            {(["income", "expense", "invest", "transfer"] as EntryType[]).map(t => (
              <button key={t} onClick={() => { setType(t); setCat(""); }} style={{
                padding: "10px 8px", borderRadius: 14,
                fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.22s",
                background: type === t ? `${TYPE_CFG[t].color}1a` : "rgba(255,255,255,0.05)",
                border: type === t ? `1px solid ${TYPE_CFG[t].color}55` : "1px solid rgba(255,255,255,0.1)",
                boxShadow: type === t
                  ? `inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 12px ${TYPE_CFG[t].color}28`
                  : "inset 0 1px 0 rgba(255,255,255,0.08)",
                color: type === t ? TYPE_CFG[t].color : "rgba(255,255,255,0.35)",
                fontFamily: "inherit",
              }}>
                {TYPE_CFG[t].label}
              </button>
            ))}
          </div>

          {/* Value — liquid glass field */}
          <div style={{
            marginBottom: 12,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: `1px solid ${value ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 20, padding: "12px 18px",
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.4)",
              value ? `0 0 0 3px ${tc.color}25` : "",
            ].filter(Boolean).join(", "),
            transition: "all 0.22s",
          }}>
            <label style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Valor</label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>R$</span>
              <input
                type="number" inputMode="decimal" placeholder="0,00"
                value={value} onChange={e => setValue(e.target.value)}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: "1.7rem", fontWeight: 800, color: value ? tc.color : "rgba(255,255,255,0.25)",
                  padding: "2px 0", letterSpacing: "-0.04em", width: "100%",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{
            marginBottom: 12,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 20, padding: "12px 18px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
          }}>
            <label style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Descrição</label>
            <input
              type="text"
              placeholder={type === "expense" ? "Ex: iFood, Uber, Netflix…" : type === "income" ? "Ex: Salário abril, Projeto X…" : "Ex: PETR4, Tesouro Selic…"}
              value={desc} onChange={e => setDesc(e.target.value)}
              style={{
                width: "100%", background: "none", border: "none", outline: "none",
                fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.9)",
                padding: 0, boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Category — oculto em transferência */}
          {type !== "transfer" && <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>Categoria</label>
            <div style={{ display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
              {cats.map(cat => (
                <button key={cat.label} onClick={() => setCat(cat.label)} style={{
                  flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 30, cursor: "pointer", transition: "all 0.18s",
                  background: category === cat.label
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: category === cat.label
                    ? `1px solid ${cat.color}88`
                    : "1px solid rgba(255,255,255,0.14)",
                  boxShadow: category === cat.label
                    ? `inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 12px ${cat.color}30`
                    : "inset 0 1px 0 rgba(255,255,255,0.15)",
                  fontSize: "0.8rem", fontWeight: 600,
                  color: category === cat.label ? cat.color : "rgba(255,255,255,0.45)",
                  fontFamily: "inherit",
                }}>
                  <span style={{ fontSize: "0.95rem" }}>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>}

          {/* Date + Payment — oculto em transferência */}
          {type !== "transfer" && (
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <div style={{
                flexShrink: 0,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 10px", height: 36,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="17" rx="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"/>
                  <path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input
                  type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{
                    background: "none", border: "none", outline: "none",
                    fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.8)",
                    padding: 0, colorScheme: "dark", fontFamily: "inherit", width: 100,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>Pagamento</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {PAYMENTS.map(p => (
                    <button key={p} onClick={() => setPayment(p)} style={{
                      padding: "7px 11px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                      fontSize: "0.73rem", fontWeight: 600, fontFamily: "inherit",
                      background: payment === p ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)",
                      border: payment === p ? `1px solid ${tc.color}88` : "1px solid rgba(255,255,255,0.14)",
                      boxShadow: payment === p
                        ? `inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px ${tc.color}28`
                        : "inset 0 1px 0 rgba(255,255,255,0.12)",
                      color: payment === p ? tc.color : "rgba(255,255,255,0.45)",
                    }}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account flow — só em transferência */}
          {type === "transfer" && (() => {
            const ACCOUNTS = ["Nubank", "C6", "Mercado Pago", "Sicredi", "Cofre", "Carteira"];
            const ACC_COLORS: Record<string, string> = {
              Nubank: "#820ad1", C6: "#c8a951", "Mercado Pago": "#00b1ea",
              Sicredi: "#2d9a27", Cofre: "#f59e0b", Carteira: "#10b981",
            };
            const AccRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 } as React.CSSProperties}>
                  {ACCOUNTS.map(acc => {
                    const active = value === acc;
                    const c = ACC_COLORS[acc];
                    return (
                      <button key={acc} onClick={() => onChange(acc)} style={{
                        flexShrink: 0, padding: "6px 12px", borderRadius: 10,
                        fontSize: "0.73rem", fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit", transition: "all 0.15s",
                        background: active ? `${c}22` : "rgba(255,255,255,0.05)",
                        border: active ? `1px solid ${c}66` : "1px solid rgba(255,255,255,0.1)",
                        boxShadow: active ? `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 8px ${c}28` : "inset 0 1px 0 rgba(255,255,255,0.08)",
                        color: active ? c : "rgba(255,255,255,0.4)",
                      }}>{acc}</button>
                    );
                  })}
                </div>
              </div>
            );
            return (
              <div style={{ marginBottom: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "12px 14px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                <AccRow label="Saída" value={fromAcc} onChange={setFromAcc} />
                <AccRow label="Entrada" value={toAcc} onChange={setToAcc} />
              </div>
            );
          })()}

          {/* Save */}
          <button onClick={handleSave} disabled={!ok} style={{
            width: "100%", padding: "17px", borderRadius: 20,
            border: ok
              ? `1px solid ${saved ? "rgba(16,185,129,0.5)" : tc.color + "55"}`
              : "1px solid rgba(255,255,255,0.12)",
            cursor: ok ? "pointer" : "not-allowed", fontFamily: "inherit",
            background: saved
              ? "linear-gradient(135deg, rgba(16,185,129,0.85), rgba(5,150,105,0.85))"
              : ok
              ? `linear-gradient(135deg, ${tc.color}cc, ${tc.color}88)`
              : "rgba(255,255,255,0.07)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            color: ok ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.2)",
            fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.01em",
            transition: "all 0.22s",
            boxShadow: ok && !saved
              ? `inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 28px ${tc.color}44`
              : "inset 0 1px 0 rgba(255,255,255,0.1)",
          } as React.CSSProperties}>
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

// ─── Expense Chart — Apple-style bar chart ────────────────────────────────────
function ExpenseChart({ values, labels }: { values: number[]; labels: string[] }) {
  const C = "#a78bfa";
  const W = 320, H = 170;
  const PAD = { top: 28, bottom: 24, left: 6, right: 6 };
  const ch = H - PAD.top - PAD.bottom;
  const n = values.length;
  const mx = Math.max(...values, 1);
  const totalW = W - PAD.left - PAD.right;
  const barW = Math.floor(totalW / n * 0.52);
  const gap  = totalW / n;
  const bx   = (i: number) => PAD.left + i * gap + (gap - barW) / 2;
  const bh   = (v: number) => v > 0 ? Math.max((v / mx) * ch, 6) : 0;
  const by   = (v: number) => PAD.top + ch - bh(v);
  const fmt  = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C} stopOpacity="0.95" />
          <stop offset="100%" stopColor={C} stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C} stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* subtle grid lines */}
      {[0.33, 0.66].map(f => (
        <line key={f}
          x1={PAD.left} y1={PAD.top + ch * f}
          x2={W - PAD.right} y2={PAD.top + ch * f}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1"
        />
      ))}

      {values.map((v, i) => {
        if (!v) return (
          <text key={i} x={bx(i) + barW / 2} y={H - 6}
            textAnchor="middle" fill="rgba(255,255,255,0.2)"
            fontSize="9.5" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">
            {labels[i]}
          </text>
        );
        const x = bx(i), y = by(v), h = bh(v), cx = x + barW / 2;
        const r = Math.min(6, barW / 2);
        return (
          <g key={i}>
            {/* glow shadow bar (wider, faded) */}
            <rect x={x - 3} y={y + 4} width={barW + 6} height={h}
              rx={r + 2} fill={C} opacity="0.12" />
            {/* main bar with rounded top */}
            <path
              d={`M ${x + r} ${y} H ${x + barW - r} Q ${x + barW} ${y} ${x + barW} ${y + r} V ${y + h} H ${x} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`}
              fill="url(#barGrad)"
            />
            {/* top highlight streak */}
            <path
              d={`M ${x + r + 2} ${y + 2} H ${x + barW - r - 2}`}
              stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"
            />
            {/* value label */}
            <text x={cx} y={y - 7} textAnchor="middle" fill={C}
              fontSize="10" fontWeight="700" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">
              {fmt(v)}
            </text>
            {/* x-axis label */}
            <text x={cx} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.3)"
              fontSize="9.5" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">
              {labels[i]}
            </text>
          </g>
        );
      })}
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
  { id: "7d",    label: "Semana" },
  { id: "30d",   label: "Mês" },
  { id: "month", label: "Ano" },
  { id: "year",  label: "Um período" },
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
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo,   setRangeTo]   = useState("");

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

  // ── Liquid Glass tokens ──────────────────────────────────────────────────────
  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(56px) saturate(320%) brightness(1.08)",
    WebkitBackdropFilter: "blur(56px) saturate(320%) brightness(1.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 22,
    overflow: "hidden",
    boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.45), inset 1px 0 0 rgba(255,255,255,0.07), inset -1px 0 0 rgba(255,255,255,0.07), 0 8px 40px rgba(0,0,0,0.4)",
  };

  const glassItem = (accent?: string): React.CSSProperties => ({
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(40px) saturate(280%)",
    WebkitBackdropFilter: "blur(40px) saturate(280%)",
    border: accent ? `1px solid ${accent}44` : "1px solid rgba(255,255,255,0.14)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 20px rgba(0,0,0,0.3)${accent ? `, 0 0 0 0.5px ${accent}22` : ""}`,
  });

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-deep)", position: "relative", fontFamily: "var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: [
          "radial-gradient(ellipse 100% 60% at 50% -8%,  rgba(0,212,255,0.22) 0%, transparent 65%)",
          "radial-gradient(ellipse  80% 55% at 90% 95%,  rgba(167,139,250,0.18) 0%, transparent 58%)",
          "radial-gradient(ellipse  60% 45% at  5% 65%,  rgba(16,185,129,0.13) 0%, transparent 52%)",
          "radial-gradient(ellipse  50% 40% at 55% 45%,  rgba(248,113,113,0.08) 0%, transparent 48%)",
          "radial-gradient(ellipse  70% 50% at 20% 10%,  rgba(167,139,250,0.10) 0%, transparent 55%)",
        ].join(", "),
      }} />

      <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1, paddingBottom: 120 }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "calc(env(safe-area-inset-top) + 20px) 20px 14px" }}>
          <button onClick={onBack} aria-label="Voltar" style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(40px) saturate(280%)",
            WebkitBackdropFilter: "blur(40px) saturate(280%)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.4), 0 4px 16px rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.7)", cursor: "pointer",
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
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: "rgba(0,212,255,0.1)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(0,212,255,0.3)",
            boxShadow: "inset 0 1.5px 0 rgba(0,212,255,0.35), 0 4px 16px rgba(0,212,255,0.12)",
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
        <div style={{ display: "flex", gap: 7, padding: "0 20px 12px", overflowX: "auto", scrollbarWidth: "none" as const }}>
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => handlePeriod(p.id)} style={{
              flexShrink: 0, padding: "9px 18px", borderRadius: 40,
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.2s",
              background: period === p.id ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.07)",
              backdropFilter: "blur(40px) saturate(280%)",
              WebkitBackdropFilter: "blur(40px) saturate(280%)",
              border: period === p.id ? "1px solid rgba(0,212,255,0.45)" : "1px solid rgba(255,255,255,0.14)",
              boxShadow: period === p.id
                ? "inset 0 1.5px 0 rgba(0,212,255,0.35), 0 4px 16px rgba(0,212,255,0.15)"
                : "inset 0 1px 0 rgba(255,255,255,0.25)",
              color: period === p.id ? "#00d4ff" : "var(--text-secondary)",
              fontFamily: "inherit",
            }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Date Range Picker — só em "Um período" ───────────────────────── */}
        {period === "year" && (
          <div style={{
            margin: "0 20px 16px",
            background: "rgba(0,212,255,0.06)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            border: "1px solid rgba(0,212,255,0.25)",
            borderRadius: 18,
            padding: "14px 16px",
            boxShadow: "inset 0 1px 0 rgba(0,212,255,0.2), 0 4px 20px rgba(0,0,0,0.3)",
          }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "rgba(0,212,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Selecione o período
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* De */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>De</div>
                <div style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="17" rx="3" stroke="rgba(0,212,255,0.6)" strokeWidth="1.8"/>
                    <path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(0,212,255,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} style={{
                    background: "none", border: "none", outline: "none", flex: 1,
                    fontSize: "0.8rem", fontWeight: 600, color: rangeFrom ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                    colorScheme: "dark", fontFamily: "inherit", padding: 0,
                  }}/>
                </div>
              </div>

              {/* seta */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 18 }}>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="rgba(0,212,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              {/* Até */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Até</div>
                <div style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 12, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="17" rx="3" stroke="rgba(0,212,255,0.6)" strokeWidth="1.8"/>
                    <path d="M3 9h18M8 2v4M16 2v4" stroke="rgba(0,212,255,0.6)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)} style={{
                    background: "none", border: "none", outline: "none", flex: 1,
                    fontSize: "0.8rem", fontWeight: 600, color: rangeTo ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                    colorScheme: "dark", fontFamily: "inherit", padding: 0,
                  }}/>
                </div>
              </div>
            </div>

            {/* Confirmar — só habilita quando ambas as datas estão preenchidas */}
            {rangeFrom && rangeTo && (
              <button onClick={() => setTrigger(t => t + 1)} style={{
                width: "100%", marginTop: 12, padding: "10px",
                borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.4)",
                boxShadow: "inset 0 1px 0 rgba(0,212,255,0.3)",
                color: "#00d4ff", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.01em",
                transition: "all 0.2s",
              }}>
                Aplicar período
              </button>
            )}
          </div>
        )}

        {/* ── Summary Card — Liquid Glass ──────────────────────────────────── */}
        <div style={{
          margin: "0 20px 14px",
          padding: "22px 20px 18px",
          borderRadius: 28,
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(72px) saturate(350%) brightness(1.1)",
          WebkitBackdropFilter: "blur(72px) saturate(350%) brightness(1.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          position: "relative", overflow: "hidden",
          boxShadow: [
            "inset 0 1.5px 0 rgba(255,255,255,0.55)",
            "inset 1px 0 0 rgba(255,255,255,0.08)",
            "inset -1px 0 0 rgba(255,255,255,0.08)",
            "0 12px 48px rgba(0,0,0,0.45)",
          ].join(", "),
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                Saldo Atual
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>R$</span>
                <span style={{ fontSize: "2.6rem", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1, color: "rgba(255,255,255,0.95)" }}>
                  {fmt(animBalance)}
                </span>
                <span style={{ fontSize: "1.2rem", fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>,00</span>
              </div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 20, marginTop: 4,
              background: "rgba(0,212,255,0.12)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(0,212,255,0.3)",
              boxShadow: "inset 0 1px 0 rgba(0,212,255,0.3)",
              fontSize: "0.72rem", fontWeight: 600, color: "#00d4ff",
            }}>
              {PERIODS.find(p => p.id === period)?.label}
            </div>
          </div>

          {/* Flow row — Liquid Glass inner */}
          <div style={{
            display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 18, padding: "12px 14px",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
          }}>
            {[
              { label: "Entradas", value: fmtR(animIncome), color: "#10b981", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>, bg: "rgba(16,185,129,0.16)" },
              { label: "Saídas", value: fmtR(animExpense), color: "#f87171", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M19 12l-7 7-7-7" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>, bg: "rgba(248,113,113,0.14)" },
            ].map((item, idx, arr) => (
              <>
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.45)", fontWeight: 500, marginBottom: 1 }}>{item.label}</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: item.color, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{item.value}</div>
                  </div>
                </div>
                {idx < arr.length - 1 && <div key={`div-${idx}`} style={{ width: 1, height: 32, background: "rgba(255,255,255,0.1)", margin: "0 8px", flexShrink: 0 }} />}
              </>
            ))}
          </div>
        </div>

        {/* ── Open Finance ─────────────────────────────────────────────────── */}
        <div style={{ padding: "0 20px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Open Finance</span>
          <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
            Conectado
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "0 20px 20px", overflowX: "auto", scrollbarWidth: "none" as const }}>
          {[
            {
              name: "Mercado Pago", balance: 1240, color: "#00b1ea", bg: "#009ee3",
              logo: (
                <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill="#009ee3"/>
                  <path d="M10 24c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                  <circle cx="24" cy="30" r="5" fill="white"/>
                </svg>
              ),
            },
            {
              name: "Nubank", balance: 3040, color: "#820ad1", bg: "#820ad1",
              logo: (
                <svg width="22" height="10" viewBox="0 0 60 26" fill="none">
                  <path d="M0 25V1l22 24V1M36 1v14c0 5.523 4.477 10 10 10s10-4.477 10-10V1" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              name: "Sicredi", balance: 890, color: "#2d9a27", bg: "#2d9a27",
              logo: (
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4 L40 32 H8 Z" fill="white" opacity="0.9"/>
                  <path d="M24 14 L34 32 H14 Z" fill="#2d9a27"/>
                </svg>
              ),
            },
            {
              name: "C6 Bank (Empresa)", balance: 110, color: "#c8a951", bg: "#1a1a1a",
              logo: (
                <svg width="24" height="14" viewBox="0 0 64 36" fill="none">
                  <path d="M20 6C12 6 6 12 6 18s6 12 14 12c4 0 7.5-1.5 10-4" stroke="#c8a951" strokeWidth="4" strokeLinecap="round"/>
                  <text x="34" y="26" fontFamily="Arial" fontWeight="800" fontSize="22" fill="#c8a951">6</text>
                </svg>
              ),
            },
            {
              name: "Cofre", balance: 2500, color: "#f59e0b", bg: "#1c1408",
              logo: (
                <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="12" width="32" height="26" rx="5" stroke="#f59e0b" strokeWidth="3.2"/>
                  <path d="M17 12V9a7 7 0 0 1 14 0v3" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round"/>
                  <circle cx="24" cy="25" r="5" stroke="#f59e0b" strokeWidth="2.8"/>
                  <circle cx="24" cy="25" r="2" fill="#f59e0b"/>
                </svg>
              ),
            },
            {
              name: "Carteira", balance: 350, color: "#10b981", bg: "#071a12",
              logo: (
                <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="12" width="40" height="28" rx="5" stroke="#10b981" strokeWidth="3.2"/>
                  <path d="M4 20h40" stroke="#10b981" strokeWidth="3.2"/>
                  <path d="M30 20v28" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3"/>
                  <rect x="30" y="26" width="10" height="8" rx="2" fill="#10b981" opacity="0.7"/>
                  <path d="M4 16V14a5 5 0 0 1 5-5h30a5 5 0 0 1 5 5v2" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              ),
            },
          ].map(bank => (
            <div key={bank.name} style={{
              flexShrink: 0, width: 130,
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(56px) saturate(300%)",
              WebkitBackdropFilter: "blur(56px) saturate(300%)",
              border: `1px solid ${bank.color}44`,
              borderRadius: 20,
              padding: "14px 14px 12px",
              boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.4), 0 4px 20px rgba(0,0,0,0.35), 0 0 0 0.5px ${bank.color}22`,
            }}>
              {/* Logo */}
              <div style={{
                width: 38, height: 38, borderRadius: 12, marginBottom: 10,
                background: bank.bg,
                border: `1px solid ${bank.color}55`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 12px ${bank.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {bank.logo}
              </div>
              <div style={{ fontSize: "0.68rem", fontWeight: 500, color: "rgba(255,255,255,0.45)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {bank.name}
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.025em", whiteSpace: "nowrap" }}>
                {`R$\u00a0${bank.balance.toLocaleString("pt-BR")}`}
              </div>
            </div>
          ))}
        </div>

        {/* ── Incomes ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 10 }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Entradas</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#10b981" }}>{fmtR(d.income)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 20px 16px" }}>
          {d.incomes.map(src => {
            const open = expandedInc === src.label;
            return (
              <div key={src.label} style={glassItem(open ? src.color : undefined)}>
                <button onClick={() => setExpandedInc(open ? null : src.label)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: `${src.color}18`, border: `1px solid ${src.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 0.5px ${src.color}20` }}>
                    {src.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{src.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${src.pct}%`, height: "100%", background: src.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: src.color, flexShrink: 0 }}>{src.pct}%</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#10b981", whiteSpace: "nowrap" }}>+ {fmtR(src.total)}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", display: "flex", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.22s" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </div>
                </button>
                {open && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px 12px" }}>
                    {src.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i < src.items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</div>
                          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{item.date} · {item.payment}</div>
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

        {/* ── Expenses ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 10 }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Despesas</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#f87171" }}>{fmtR(d.expense)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 20px 16px" }}>
          {d.expenses.map(cat => {
            const open = expandedExp === cat.label;
            return (
              <div key={cat.label} style={glassItem(open ? cat.color : undefined)}>
                <button onClick={() => setExpandedExp(open ? null : cat.label)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: `${cat.color}18`, border: `1px solid ${cat.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 0.5px ${cat.color}20` }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{cat.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${cat.pct}%`, height: "100%", background: cat.color, borderRadius: 2, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: cat.color, flexShrink: 0 }}>{cat.pct}%</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{fmtR(cat.total)}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", display: "flex", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.22s" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </div>
                </button>
                {open && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 16px 12px" }}>
                    {cat.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i < cat.items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</div>
                          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{item.date} · {item.payment}</div>
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

        {/* ── Expense Chart — Liquid Glass ─────────────────────────────────── */}
        <div style={{ margin: "0 20px 14px", ...glass, borderRadius: 24, padding: "18px 16px 10px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                📊 Despesas
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                Semana atual
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                Acumulado
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#a78bfa", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {fmtR(expenseTotal)}
              </div>
            </div>
          </div>
          <ExpenseChart values={weekData} labels={weekLabels} />
        </div>


      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setSheet("expense")}
        aria-label="Nova transação"
        style={{
          position: "fixed", bottom: 32, right: 24, zIndex: 200,
          width: 60, height: 60, borderRadius: 20, cursor: "pointer",
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

      {/* ── Bottom Sheet ─────────────────────────────────────────────────────── */}
      <AddEntrySheet
        open={sheet !== null}
        initialType={sheet ?? "expense"}
        onClose={() => setSheet(null)}
      />

    </div>
  );
}
