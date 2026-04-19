"use client";
import { useState, useEffect, useRef } from "react";
import FinanceScreen from "./components/FinanceScreen";

function useCountUp(target: number, duration = 1400, startOnMount = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!startOnMount) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, startOnMount]);
  return value;
}

/* ─── Sparkline ─── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 72;
  const h = 28;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const lx = w;
  const ly = h - ((values[values.length - 1] - min) / range) * (h - 4) - 2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.75" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

/* ─── Circular Progress ─── */
function Ring({ value, color }: { value: number; color: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
      <circle
        cx="22" cy="22" r={r}
        stroke={color} strokeWidth="3" fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 22 22)"
        style={{ filter: `drop-shadow(0 0 4px ${color}99)` }}
      />
      <text x="22" y="26" textAnchor="middle" fill={color} fontSize="9.5" fontWeight="800">
        {value}%
      </text>
    </svg>
  );
}

/* ─── Nav Icons ─── */
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const WalletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="16.5" cy="15" r="1.5" fill="currentColor" />
  </svg>
);
const ListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const TargetIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const ArrowUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M5 12l7-7 7 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M19 12l-7 7-7-7" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── MacroBar ─── */
function MacroBar({ label, current, goal, color, mounted }: {
  label: string; current: number; goal: number; color: string; mounted: boolean;
}) {
  const pct = Math.min(Math.round((current / goal) * 100), 100);
  return (
    <div style={{ marginBottom: "9px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "0.72rem", color, fontWeight: 700 }}>{current}g <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>/ {goal}g</span></span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: mounted ? `${pct}%` : "0%", background: color, boxShadow: `0 0 6px ${color}55` }} />
      </div>
    </div>
  );
}

/* ─── Cards data ─── */
const CARDS = [
  {
    id: "finance",
    accent: "#00d4ff",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="14" rx="2.5" stroke="#00d4ff" strokeWidth="1.8" />
        <path d="M2 10h20" stroke="#00d4ff" strokeWidth="1.8" />
        <circle cx="16.5" cy="15" r="1.5" fill="#00d4ff" opacity="0.8" />
      </svg>
    ),
    title: "Controle Financeiro",
    description: "Entradas, saídas e saldo",
    statValue: "R$ 4.280",
    statLabel: "saldo atual",
    extra: "trend" as const,
    trend: "+12,4%",
    trendUp: true,
    sparkline: [2800, 3200, 2950, 3800, 3500, 4100, 4280],
  },
  {
    id: "tasks",
    accent: "#a78bfa",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2.5" stroke="#a78bfa" strokeWidth="1.8" />
        <path d="M8 2v4M16 2v4M3 10h18" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 15l2.5 2.5L17 10" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Tarefas Diárias",
    description: "Organização do dia a dia",
    statValue: "7/12",
    statLabel: "concluídas hoje",
    extra: "progress" as const,
    progress: 58,
  },
  {
    id: "goals",
    accent: "#10b981",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#10b981" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="5" stroke="#10b981" strokeWidth="1.8" opacity="0.6" />
        <circle cx="12" cy="12" r="2" fill="#10b981" />
      </svg>
    ),
    title: "Metas / Objetivos",
    description: "Acompanhe seu progresso",
    statValue: "3 ativas",
    statLabel: "em andamento",
    extra: "ring" as const,
    progress: 72,
  },
  {
    id: "performance",
    accent: "#f59e0b",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Desempenho Pessoal",
    description: "Acompanhe sua produtividade",
    statValue: "3h 45min",
    statLabel: "horas produtivas",
    extra: "performance" as const,
    trend: "+8% esta semana",
    trendUp: true,
    sparkline: [3.5, 4.2, 3.0, 5.1, 4.8, 3.2, 3.75],
    progress: 75,
    perfMins: 225,
  },
  {
    id: "diet",
    accent: "#fb923c",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M18 8h-1a5 5 0 00-10 0H6a2 2 0 00-2 2v2a2 2 0 002 2h.5l1 8h7l1-8H18a2 2 0 002-2v-2a2 2 0 00-2-2z" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Dieta",
    description: "Consumo diário",
    statValue: "1.860",
    statLabel: "kcal consumidas",
    extra: "diet" as const,
    calories: 1860,
    macros: [
      { label: "Carboidratos", current: 210, goal: 250, color: "#f59e0b" },
      { label: "Proteínas",    current: 95,  goal: 120, color: "#fb923c" },
      { label: "Gorduras",     current: 55,  goal: 65,  color: "#f87171" },
    ],
  },
  {
    id: "exercise",
    accent: "#22d3ee",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 12h2M16 12h2" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 9v6M16 9v6" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 12h8" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="4.5" cy="12" r="1.5" stroke="#22d3ee" strokeWidth="1.8" />
        <circle cx="19.5" cy="12" r="1.5" stroke="#22d3ee" strokeWidth="1.8" />
      </svg>
    ),
    title: "Exercícios",
    description: "Atividade física",
    statValue: "3/5",
    statLabel: "dias ativos",
    extra: "exercise" as const,
    trend: "Sequência de 3 dias",
    trendUp: true,
    sparkline: [45, 0, 60, 45, 0, 60, 60],
    exerciseMins: 150,
  },
  {
    id: "reading",
    accent: "#e879f9",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h7a1 1 0 011 1v14a1 1 0 01-1 1H4V4z" stroke="#e879f9" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M20 4h-7a1 1 0 00-1 1v14a1 1 0 001 1h7V4z" stroke="#e879f9" strokeWidth="1.8" strokeLinejoin="round" opacity="0.6" />
        <path d="M12 6v12" stroke="#e879f9" strokeWidth="1" opacity="0.4" />
      </svg>
    ),
    title: "Leitura",
    description: "Evolução atual",
    statValue: "18",
    statLabel: "páginas hoje",
    extra: "reading" as const,
    book: "O Poder do Hábito",
    progress: 64,
    pagesRead: 18,
    pagesGoal: 25,
  },
];

const TABS = [
  { id: "home",    label: "Início",   Icon: HomeIcon },
  { id: "finance", label: "Finanças", Icon: WalletIcon },
  { id: "tasks",   label: "Tarefas",  Icon: ListIcon },
  { id: "goals",   label: "Metas",    Icon: TargetIcon },
  { id: "profile", label: "Perfil",   Icon: UserIcon },
];

/* ─── Page ─── */
export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [screen, setScreen] = useState<"home" | "finance">("home");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const animatedBalance  = useCountUp(4280, 1400, mounted);
  const animatedIncome   = useCountUp(6500, 1200, mounted);
  const animatedExpense  = useCountUp(2220, 1200, mounted);
  const animatedPerfMins = useCountUp(225,  1400, mounted);
  const animatedCalories = useCountUp(1860, 1400, mounted);
  const animatedExMins   = useCountUp(150,  1400, mounted);
  const animatedPages    = useCountUp(18,   1000, mounted);

  const fmt = (n: number) => n.toLocaleString("pt-BR");
  const fmtMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}min` : ""}`.trim() : `${m}min`;
  };

  const hour = mounted ? new Date().getHours() : 14;
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const greetingEmoji = hour < 12 ? "☀️" : hour < 18 ? "🌤️" : "🌙";

  if (screen === "finance") {
    return <FinanceScreen onBack={() => { setScreen("home"); setActiveTab("home"); }} />;
  }

  return (
    <main className="app-root">
      <div className="ambient-layer" />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div>
            <p className="greeting-sub">{greetingEmoji} {greeting}</p>
            <h1 className="greeting-name">Welton</h1>
          </div>
          <div className="header-right">
            <button className="notif-btn" aria-label="Notificações">
              <BellIcon />
              <span className="notif-dot" />
            </button>
            <div className="avatar">W</div>
          </div>
        </header>


        {/* Cards */}
        <div className="section-label">Acesso Rápido</div>
        <div className="cards-list">
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              className="module-card"
              style={{ animationDelay: `${i * 90 + 100}ms` }}
              onClick={() => { if (card.id === "finance") setScreen("finance"); }}
            >
              <div className="module-card-top">
                <div
                  className="module-icon"
                  style={{ background: `${card.accent}18`, borderColor: `${card.accent}28` }}
                >
                  <card.Icon />
                </div>

                {card.extra === "ring" ? (
                  <Ring value={card.progress!} color={card.accent} />
                ) : (
                  <div className="module-stat">
                    <div className="module-stat-value" style={{ color: card.accent }}>{card.statValue}</div>
                    <div className="module-stat-label">{card.statLabel}</div>
                  </div>
                )}
              </div>

              <div className="module-info">
                <div className="module-title">{card.title}</div>
                <div className="module-desc">{card.description}</div>
              </div>

              {card.extra === "trend" && card.sparkline && (
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div className={`trend-badge ${card.trendUp ? "up" : "down"}`}>
                    {card.trendUp ? "↑" : "↓"} {card.trend} este mês
                  </div>
                  <Sparkline values={card.sparkline} color={card.accent} />
                </div>
              )}

              {(card.extra === "progress" || card.extra === "ring") && (
                <div className="module-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: mounted ? `${card.progress}%` : "0%",
                        background: card.accent,
                        boxShadow: `0 0 8px ${card.accent}60`,
                      }}
                    />
                  </div>
                  <span className="progress-pct">{card.progress}%</span>
                </div>
              )}

              {card.extra === "performance" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, color: card.accent, letterSpacing: "-0.03em" }}>
                      {fmtMins(animatedPerfMins)}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      {card.progress}% da meta
                    </span>
                  </div>
                  <div className="module-progress" style={{ marginBottom: "12px" }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: mounted ? `${card.progress}%` : "0%", background: card.accent, boxShadow: `0 0 8px ${card.accent}60` }} />
                    </div>
                    <span className="progress-pct">{card.progress}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div className={`trend-badge ${card.trendUp ? "up" : "down"}`}>
                      {card.trendUp ? "↑" : "↓"} {card.trend}
                    </div>
                    <Sparkline values={card.sparkline!} color={card.accent} />
                  </div>
                </>
              )}

              {card.extra === "diet" && (
                <>
                  <div style={{ marginBottom: "4px" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: card.accent, letterSpacing: "-0.03em" }}>
                      {fmt(animatedCalories)}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginLeft: "6px", fontWeight: 500 }}>kcal</span>
                  </div>
                  <div style={{ marginBottom: "14px", marginTop: "12px" }}>
                    {card.macros!.map((m) => (
                      <MacroBar key={m.label} label={m.label} current={m.current} goal={m.goal} color={m.color} mounted={mounted} />
                    ))}
                  </div>
                </>
              )}

              {card.extra === "exercise" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, color: card.accent, letterSpacing: "-0.03em" }}>
                      {fmtMins(animatedExMins)}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                      total treinado
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div className="trend-badge up">
                      🔥 {card.trend}
                    </div>
                    <Sparkline values={card.sparkline!} color={card.accent} />
                  </div>
                </>
              )}

              {card.extra === "reading" && (
                <>
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", letterSpacing: "-0.01em" }}>
                      📖 {card.book}
                    </div>
                    <div className="module-progress" style={{ marginBottom: "6px" }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: mounted ? `${card.progress}%` : "0%", background: card.accent, boxShadow: `0 0 8px ${card.accent}60` }} />
                      </div>
                      <span className="progress-pct" style={{ color: card.accent }}>{card.progress}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                        Hoje: <span style={{ color: card.accent, fontWeight: 700 }}>{animatedPages} pág.</span>
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Meta: {card.pagesGoal} pág.
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: "14px" }} />
                </>
              )}

              <div className="module-arrow" style={{ color: card.accent }}>
                Abrir <ChevronRight color={card.accent} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id ? "active" : ""}`}
            onClick={() => {
              setActiveTab(id);
              if (id === "finance") setScreen("finance");
            }}
            aria-label={label}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
