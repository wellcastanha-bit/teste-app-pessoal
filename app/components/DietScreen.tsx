"use client";
import { useState, useEffect } from "react";

type Meal = "Café da manhã" | "Almoço" | "Lanche" | "Jantar";
type FoodItem = {
  id: number;
  name: string;
  meal: Meal;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  portion: string;
};

const MEAL_CFG: Record<Meal, { icon: string; color: string }> = {
  "Café da manhã": { icon: "☀️", color: "#f59e0b" },
  "Almoço":        { icon: "🍽️", color: "#fb923c" },
  "Lanche":        { icon: "🍎", color: "#10b981" },
  "Jantar":        { icon: "🌙", color: "#a78bfa" },
};
const ALL_MEALS: Meal[] = ["Café da manhã","Almoço","Lanche","Jantar"];

const MOCK_FOODS: FoodItem[] = [
  { id:1,  name:"Aveia com banana",    meal:"Café da manhã", kcal:320, carbs:58,  protein:9,  fat:5,  portion:"1 tigela (200g)" },
  { id:2,  name:"Café com leite",      meal:"Café da manhã", kcal:60,  carbs:6,   protein:3,  fat:2,  portion:"200ml" },
  { id:3,  name:"Ovo mexido",          meal:"Café da manhã", kcal:180, carbs:1,   protein:14, fat:13, portion:"2 ovos" },
  { id:4,  name:"Frango grelhado",     meal:"Almoço",        kcal:280, carbs:0,   protein:48, fat:8,  portion:"200g" },
  { id:5,  name:"Arroz integral",      meal:"Almoço",        kcal:220, carbs:46,  protein:5,  fat:2,  portion:"1 xícara (150g)" },
  { id:6,  name:"Salada verde",        meal:"Almoço",        kcal:40,  carbs:6,   protein:2,  fat:1,  portion:"1 prato" },
  { id:7,  name:"Feijão",              meal:"Almoço",        kcal:130, carbs:22,  protein:8,  fat:1,  portion:"1 concha (100g)" },
  { id:8,  name:"Maçã",               meal:"Lanche",        kcal:80,  carbs:21,  protein:0,  fat:0,  portion:"1 unidade (130g)" },
  { id:9,  name:"Castanhas do Pará",   meal:"Lanche",        kcal:190, carbs:4,   protein:4,  fat:19, portion:"30g" },
  { id:10, name:"Iogurte grego",       meal:"Lanche",        kcal:100, carbs:4,   protein:17, fat:1,  portion:"170g" },
  { id:11, name:"Omelete de espinafre",meal:"Jantar",        kcal:260, carbs:4,   protein:20, fat:18, portion:"3 ovos" },
  { id:12, name:"Batata doce",         meal:"Jantar",        kcal:200, carbs:46,  protein:2,  fat:0,  portion:"150g" },
];

const DAILY_GOALS = { kcal: 2200, carbs: 275, protein: 150, fat: 73, water: 2500 };

/* ── Calorie Ring ──────────────────────────────────────────── */
function CalRing({ consumed, goal, mounted }: { consumed: number; goal: number; mounted: boolean }) {
  const size = 130;
  const r = 50;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(consumed / goal, 1);
  const offset = circ - (mounted ? pct : 0) * circ;
  const remaining = Math.max(goal - consumed, 0);
  const over = consumed > goal;

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position:"absolute", inset:0 }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth="8" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r}
          stroke={over ? "#f87171" : "#fb923c"} strokeWidth="8" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ filter:`drop-shadow(0 0 8px ${over ? "#f87171" : "#fb923c"}aa)`, transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"1.6rem", fontWeight:800, color: over ? "#f87171" : "#fb923c", letterSpacing:"-0.04em", lineHeight:1 }}>
          {consumed.toLocaleString("pt-BR")}
        </div>
        <div style={{ fontSize:"0.62rem", color:"var(--text-secondary)", fontWeight:600, marginTop:3 }}>kcal</div>
        <div style={{ fontSize:"0.7rem", color: over ? "#f87171" : "var(--text-muted)", fontWeight:600, marginTop:2 }}>
          {over ? `+${(consumed - goal).toLocaleString("pt-BR")} extra` : `${remaining.toLocaleString("pt-BR")} restantes`}
        </div>
      </div>
    </div>
  );
}

/* ── Macro Bar ─────────────────────────────────────────────── */
function MacroBar({ label, current, goal, color, unit = "g", mounted }: {
  label: string; current: number; goal: number; color: string; unit?: string; mounted: boolean;
}) {
  const pct = Math.min(Math.round((current / goal) * 100), 100);
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:"0.75rem", fontWeight:600, color:"var(--text-secondary)" }}>{label}</span>
        <span style={{ fontSize:"0.73rem", fontWeight:700, color }}>
          {current}{unit} <span style={{ color:"var(--text-muted)", fontWeight:500 }}>/ {goal}{unit}</span>
        </span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden", marginBottom:2 }}>
        <div style={{
          height:"100%", borderRadius:3,
          width: mounted ? `${pct}%` : "0%",
          background:`linear-gradient(90deg, ${color}88, ${color})`,
          transition:"width 1.1s cubic-bezier(.4,0,.2,1)",
          boxShadow:`0 0 8px ${color}55`,
        }}/>
      </div>
      <div style={{ textAlign:"right", fontSize:"0.62rem", color:"var(--text-muted)", fontWeight:600 }}>{pct}%</div>
    </div>
  );
}

/* ── Water Tracker ─────────────────────────────────────────── */
function WaterTracker({ consumed, goal, onAdd, onRemove }: {
  consumed: number; goal: number; onAdd: () => void; onRemove: () => void;
}) {
  const glasses = Math.round(goal / 250);
  const filled  = Math.round(consumed / 250);
  return (
    <div style={{
      background:"rgba(255,255,255,0.05)",
      backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
      border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:20, padding:"15px 16px",
      boxShadow:"inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 20px rgba(0,0,0,0.25)",
      marginBottom:14,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:"1rem" }}>💧</span>
          <span style={{ fontSize:"0.82rem", fontWeight:700, color:"var(--text-primary)" }}>Água</span>
        </div>
        <div style={{ fontSize:"0.8rem", fontWeight:800, color:"#00d4ff" }}>
          {(consumed/1000).toFixed(1)}L <span style={{ color:"var(--text-muted)", fontWeight:500 }}>/ {(goal/1000).toFixed(1)}L</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:5, marginBottom:12 }}>
        {Array.from({ length: glasses }).map((_, i) => (
          <div key={i} style={{
            flex:1, height:28, borderRadius:8,
            background: i < filled ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.06)",
            border: i < filled ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
            boxShadow: i < filled ? "0 0 8px rgba(0,212,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
            transition:"all 0.25s",
          }}/>
        ))}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onRemove} style={{
          flex:1, height:34, borderRadius:10, cursor:"pointer",
          background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
          color:"var(--text-secondary)", fontSize:"1rem", fontWeight:700,
        }}>−</button>
        <button onClick={onAdd} style={{
          flex:2, height:34, borderRadius:10, cursor:"pointer",
          background:"rgba(0,212,255,0.14)", border:"1px solid rgba(0,212,255,0.3)",
          color:"#00d4ff", fontSize:"0.78rem", fontWeight:700,
        }}>+ 250ml</button>
      </div>
    </div>
  );
}

/* ── Add Food Sheet ────────────────────────────────────────── */
function AddFoodSheet({ onClose, onSave }: {
  onClose: () => void;
  onSave: (f: Omit<FoodItem,"id">) => void;
}) {
  const [name,    setName]    = useState("");
  const [meal,    setMeal]    = useState<Meal>("Almoço");
  const [kcal,    setKcal]    = useState("");
  const [carbs,   setCarbs]   = useState("");
  const [protein, setProtein] = useState("");
  const [fat,     setFat]     = useState("");
  const [portion, setPortion] = useState("");

  const canSave = name.trim() && kcal;

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
        maxHeight:"90dvh", overflowY:"auto",
      }}>
        <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.18)", margin:"0 auto 18px" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <span style={{ fontSize:"1rem", fontWeight:800, color:"var(--text-primary)" }}>Adicionar alimento</span>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <label style={labelStyle}>Alimento</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Frango grelhado"
          style={{ ...inputStyle, marginBottom:14 }}/>

        <label style={labelStyle}>Refeição</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:14 }}>
          {ALL_MEALS.map(m => {
            const c = MEAL_CFG[m];
            const active = meal === m;
            return (
              <button key={m} onClick={()=>setMeal(m)} style={{
                padding:"10px 8px", borderRadius:12, cursor:"pointer",
                background: active ? `${c.color}20` : "rgba(255,255,255,0.05)",
                border: active ? `1px solid ${c.color}50` : "1px solid rgba(255,255,255,0.1)",
                color: active ? c.color : "var(--text-muted)",
                fontSize:"0.78rem", fontWeight:700, display:"flex", alignItems:"center", gap:6,
                transition:"all 0.18s",
              }}>
                <span>{c.icon}</span> {m}
              </button>
            );
          })}
        </div>

        <label style={labelStyle}>Porção</label>
        <input value={portion} onChange={e=>setPortion(e.target.value)} placeholder="Ex: 200g, 1 xícara"
          style={{ ...inputStyle, marginBottom:14 }}/>

        <label style={labelStyle}>Calorias (kcal)</label>
        <input value={kcal} onChange={e=>setKcal(e.target.value)} placeholder="0" type="number"
          style={{ ...inputStyle, marginBottom:14 }}/>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:18 }}>
          <div>
            <label style={labelStyle}>Carbs (g)</label>
            <input value={carbs} onChange={e=>setCarbs(e.target.value)} placeholder="0" type="number" style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Prot. (g)</label>
            <input value={protein} onChange={e=>setProtein(e.target.value)} placeholder="0" type="number" style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Gordura (g)</label>
            <input value={fat} onChange={e=>setFat(e.target.value)} placeholder="0" type="number" style={inputStyle}/>
          </div>
        </div>

        <button onClick={()=>{ if (!canSave) return; onSave({ name:name.trim(), meal, kcal:parseInt(kcal)||0, carbs:parseInt(carbs)||0, protein:parseInt(protein)||0, fat:parseInt(fat)||0, portion:portion.trim()||"—" }); }} disabled={!canSave} style={{
          width:"100%", height:44, borderRadius:13,
          cursor: canSave ? "pointer" : "not-allowed",
          background: canSave ? "rgba(251,146,60,0.2)" : "rgba(255,255,255,0.05)",
          border: canSave ? "1px solid rgba(251,146,60,0.4)" : "1px solid rgba(255,255,255,0.08)",
          color: canSave ? "#fb923c" : "var(--text-muted)",
          fontSize:"0.88rem", fontWeight:700, transition:"all 0.18s",
        }}>
          Adicionar alimento
        </button>
      </div>
    </>
  );
}

/* ── Main Screen ───────────────────────────────────────────── */
export default function DietScreen({ onBack }: { onBack: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [foods,   setFoods]   = useState<FoodItem[]>(MOCK_FOODS);
  const [water,   setWater]   = useState(1750);
  const [sheet,   setSheet]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalKcal    = foods.reduce((a, f) => a + f.kcal, 0);
  const totalCarbs   = foods.reduce((a, f) => a + f.carbs, 0);
  const totalProtein = foods.reduce((a, f) => a + f.protein, 0);
  const totalFat     = foods.reduce((a, f) => a + f.fat, 0);

  function handleDelete(id: number) {
    setFoods(fs => fs.filter(f => f.id !== id));
  }

  function handleSave(data: Omit<FoodItem,"id">) {
    setFoods(fs => [...fs, { ...data, id: Date.now() }]);
    setSheet(false);
  }

  const glass: React.CSSProperties = {
    background:"rgba(255,255,255,0.06)",
    backdropFilter:"blur(56px) saturate(300%) brightness(1.06)",
    WebkitBackdropFilter:"blur(56px) saturate(300%) brightness(1.06)",
    border:"1px solid rgba(255,255,255,0.12)",
    borderRadius:22,
    boxShadow:"inset 0 1.5px 0 rgba(255,255,255,0.4), 0 8px 32px rgba(0,0,0,0.35)",
  };

  return (
    <div style={{ minHeight:"100dvh", background:"var(--bg-deep)", position:"relative", fontFamily:"var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* Ambient */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:[
          "radial-gradient(ellipse 80% 50% at 60% -5%, rgba(251,146,60,0.18) 0%, transparent 60%)",
          "radial-gradient(ellipse 60% 40% at 10% 80%, rgba(245,158,11,0.10) 0%, transparent 55%)",
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
            <div style={{ fontSize:"1.1rem", fontWeight:800, color:"var(--text-primary)", letterSpacing:"-0.025em" }}>Dieta</div>
            <div style={{ fontSize:"0.72rem", color:"var(--text-secondary)", fontWeight:500, marginTop:1 }}>
              {totalKcal.toLocaleString("pt-BR")} kcal · hoje
            </div>
          </div>
        </div>

        {/* ── Calorie + Macros Card ── */}
        <div style={{ ...glass, margin:"0 16px 14px", padding:"20px" }}>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            <CalRing consumed={totalKcal} goal={DAILY_GOALS.kcal} mounted={mounted} />
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
              <MacroBar label="Carboidratos" current={totalCarbs}   goal={DAILY_GOALS.carbs}   color="#f59e0b" mounted={mounted}/>
              <MacroBar label="Proteínas"    current={totalProtein} goal={DAILY_GOALS.protein} color="#fb923c" mounted={mounted}/>
              <MacroBar label="Gorduras"     current={totalFat}     goal={DAILY_GOALS.fat}     color="#f87171" mounted={mounted}/>
            </div>
          </div>

          {/* Kcal meta linha */}
          <div style={{ marginTop:16, display:"flex", justifyContent:"space-around" }}>
            {[
              { label:"Meta", value:`${DAILY_GOALS.kcal.toLocaleString("pt-BR")} kcal`, color:"var(--text-secondary)" },
              { label:"Consumido", value:`${totalKcal.toLocaleString("pt-BR")} kcal`, color:"#fb923c" },
              { label:"Restante", value:`${Math.max(DAILY_GOALS.kcal - totalKcal, 0).toLocaleString("pt-BR")} kcal`, color:"var(--text-muted)" },
            ].map(item => (
              <div key={item.label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"0.78rem", fontWeight:800, color:item.color }}>{item.value}</div>
                <div style={{ fontSize:"0.62rem", color:"var(--text-muted)", marginTop:2, fontWeight:500 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Water ── */}
        <div style={{ padding:"0 16px" }}>
          <WaterTracker
            consumed={water}
            goal={DAILY_GOALS.water}
            onAdd={()=>setWater(w=>Math.min(w+250, DAILY_GOALS.water*2))}
            onRemove={()=>setWater(w=>Math.max(w-250, 0))}
          />
        </div>

        {/* ── Meals ── */}
        {ALL_MEALS.map(meal => {
          const mealFoods = foods.filter(f => f.meal === meal);
          const mealKcal  = mealFoods.reduce((a, f) => a + f.kcal, 0);
          const cfg = MEAL_CFG[meal];
          return (
            <div key={meal} style={{ padding:"0 16px", marginBottom:6 }}>
              {/* Meal header */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                <span style={{ fontSize:"0.95rem" }}>{cfg.icon}</span>
                <span style={{ fontSize:"0.8rem", fontWeight:700, color:"var(--text-primary)" }}>{meal}</span>
                <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
                <span style={{ fontSize:"0.72rem", fontWeight:700, color:cfg.color }}>{mealKcal} kcal</span>
              </div>

              {/* Food items */}
              {mealFoods.length === 0 ? (
                <div style={{ fontSize:"0.75rem", color:"var(--text-muted)", padding:"10px 0 14px", textAlign:"center" }}>
                  Nenhum alimento
                </div>
              ) : (
                mealFoods.map(food => (
                  <div key={food.id} style={{
                    display:"flex", alignItems:"center", gap:12,
                    background:"rgba(255,255,255,0.05)",
                    backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
                    border:"1px solid rgba(255,255,255,0.09)",
                    borderRadius:15, padding:"11px 13px", marginBottom:7,
                    boxShadow:"inset 0 1px 0 rgba(255,255,255,0.25)",
                  }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"0.85rem", fontWeight:700, color:"var(--text-primary)", marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {food.name}
                      </div>
                      <div style={{ fontSize:"0.65rem", color:"var(--text-muted)", fontWeight:500 }}>
                        {food.portion} · C:{food.carbs}g · P:{food.protein}g · G:{food.fat}g
                      </div>
                    </div>
                    <div style={{ fontSize:"0.9rem", fontWeight:800, color:cfg.color, flexShrink:0 }}>
                      {food.kcal} kcal
                    </div>
                    <button onClick={()=>handleDelete(food.id)} style={{
                      width:26, height:26, borderRadius:8, flexShrink:0,
                      background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)",
                      display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#f87171",
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* ── FAB ── */}
      <button onClick={()=>setSheet(true)} style={{
        position:"fixed", bottom:32, right:24, zIndex:200,
        width:58, height:58, borderRadius:19, cursor:"pointer",
        background:"rgba(251,146,60,0.18)",
        backdropFilter:"blur(28px) saturate(180%)", WebkitBackdropFilter:"blur(28px) saturate(180%)",
        border:"1px solid rgba(251,146,60,0.35)",
        boxShadow:"0 8px 32px rgba(251,146,60,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="#fb923c" strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      </button>

      {sheet && <AddFoodSheet onClose={()=>setSheet(false)} onSave={handleSave} />}
    </div>
  );
}
