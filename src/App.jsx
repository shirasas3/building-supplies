import { useState, useEffect, useMemo } from "react";

const KEY = "bldg-supplies-v1";
const load = () => {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
};
const save = (d) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch (e) {}
};

const sample = [
  { id: 1, name: "נייר טואלט (חבילה)", price: 30, star: true, qty: 1 },
  { id: 2, name: "סבון כלים", price: 12, star: true, qty: 1 },
  { id: 3, name: "שקיות אשפה", price: 15, star: false, qty: 1 },
  { id: 4, name: "אקונומיקה", price: 10, star: false, qty: 1 },
];

const fmt = (n) => "₪" + (Math.round(n * 100) / 100).toLocaleString("he-IL");

export default function App() {
  const init = load() || {};
  const [tab, setTab] = useState("plan");
  const [budget, setBudget] = useState(init.budget ?? "");
  const [items, setItems] = useState(init.items ?? sample);
  const [nm, setNm] = useState("");
  const [pr, setPr] = useState("");

  useEffect(() => {
    save({ budget, items });
  }, [budget, items]);

  const add = () => {
    const p = parseFloat(pr);
    if (!nm.trim() || isNaN(p) || p < 0) return;
    setItems([...items, { id: Date.now(), name: nm.trim(), price: p, star: false, qty: 1 }]);
    setNm("");
    setPr("");
  };
  const upd = (id, ch) => setItems(items.map((i) => (i.id === id ? { ...i, ...ch } : i)));
  const del = (id) => setItems(items.filter((i) => i.id !== id));

  // Fills the whole budget: starred items first (at their minimum quantity),
  // then adds units one by one. Starred items get double weight.
  const plan = useMemo(() => {
    const B = parseFloat(budget) || 0;
    const q = {};
    items.forEach((i) => {
      q[i.id] = i.star ? i.qty : 0;
    });
    const mustCost = items.filter((i) => i.star).reduce((s, i) => s + i.price * i.qty, 0);
    let left = B - mustCost;
    const w = (i) => (i.star ? 2 : 1);
    const valid = items.filter((i) => i.price > 0);
    while (true) {
      const c = valid
        .filter((i) => i.price <= left + 1e-9)
        .sort((a, b) => q[a.id] / w(a) - q[b.id] / w(b) || a.price - b.price)[0];
      if (!c) break;
      q[c.id]++;
      left -= c.price;
    }
    const withQ = (i) => ({ ...i, qty: q[i.id] });
    const must = items.filter((i) => i.star).map(withQ);
    const extra = items.filter((i) => !i.star && q[i.id] > 0).map(withQ);
    const skipped = items.filter((i) => !i.star && q[i.id] === 0);
    return { B, must, mustCost, extra, skipped, left, total: B - left };
  }, [items, budget]);

  return (
    <div className="wrap">
      {tab === "plan" && (
        <>
          <h1>🏢 תקציב הבניין</h1>
          <div className="card">
            <label>כמה תקציב יש לך? (₪)</label>
            <input
              type="number"
              inputMode="decimal"
              value={budget}
              placeholder="לדוגמה 300"
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          {plan.B > 0 ? (
            <>
              {plan.mustCost > plan.B && (
                <div className="warn">
                  הפריטים המסומנים בכוכב עולים {fmt(plan.mustCost - plan.B)} יותר מהתקציב. כדאי להגדיל תקציב או להוריד כמות.
                </div>
              )}
              <div className="card">
                <div>סה"כ בסל</div>
                <div className={"big " + (plan.left < 0 ? "bad" : "ok")}>{fmt(plan.total)}</div>
                <div className="mut">
                  {plan.left >= 0 ? "נשאר: " + fmt(plan.left) : "חריגה: " + fmt(-plan.left)}
                </div>
                <div className="bar">
                  <i style={{ width: Math.min(100, (plan.total / plan.B) * 100) + "%" }} />
                </div>
              </div>
              <div className="card">
                <div className="tag first">⭐ חובה</div>
                {plan.must.length === 0 && <div className="empty">לא סימנת פריטים חשובים</div>}
                {plan.must.map((i) => (
                  <Line key={i.id} i={i} />
                ))}
                <div className="tag">מילוי התקציב</div>
                {plan.extra.length === 0 && <div className="empty">אין עוד פריטים שנכנסים</div>}
                {plan.extra.map((i) => (
                  <Line key={i.id} i={i} />
                ))}
                {plan.skipped.length > 0 && (
                  <>
                    <div className="tag">לא נכנס</div>
                    {plan.skipped.map((i) => (
                      <Line key={i.id} i={i} dim />
                    ))}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="empty">הכנס תקציב כדי לראות את הרשימה</div>
          )}
        </>
      )}

      {tab === "items" && (
        <>
          <h1>📦 הפריטים שלי</h1>
          <div className="card">
            <label>שם פריט</label>
            <input type="text" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="לדוגמה: נוזל רצפות" />
            <div className="row" style={{ marginTop: 8 }}>
              <div>
                <label>מחיר (₪)</label>
                <input type="number" inputMode="decimal" value={pr} onChange={(e) => setPr(e.target.value)} />
              </div>
              <button style={{ alignSelf: "flex-end" }} onClick={add}>
                הוסף +
              </button>
            </div>
          </div>
          <div className="card">
            {items.length === 0 && <div className="empty">אין פריטים עדיין</div>}
            {items.map((i) => (
              <div className="item" key={i.id}>
                <button
                  className={"star " + (i.star ? "on" : "")}
                  onClick={() => upd(i.id, { star: !i.star })}
                  aria-label="חשוב"
                >
                  ★
                </button>
                <div className="nm">
                  <b>{i.name}</b>
                  <span>{fmt(i.price)} ליחידה</span>
                </div>
                <div className="qty">
                  <button onClick={() => upd(i.id, { qty: i.qty + 1 })}>+</button>
                  <b>{i.qty}</b>
                  <button onClick={() => upd(i.id, { qty: Math.max(1, i.qty - 1) })}>−</button>
                </div>
                <button className="ghost" onClick={() => del(i.id)} aria-label="מחק">
                  🗑
                </button>
              </div>
            ))}
          </div>
          <div className="mut small">
            הכוכב מסמן פריט חשוב, והוא מקבל כמות כפולה בחלוקת התקציב. הכמות כאן היא המינימום לפריט עם כוכב. את שאר התקציב האפליקציה ממלאת לבד.
          </div>
        </>
      )}

      <nav>
        <button className={tab === "plan" ? "act" : ""} onClick={() => setTab("plan")}>
          רשימת קניות
        </button>
        <button className={tab === "items" ? "act" : ""} onClick={() => setTab("items")}>
          פריטים
        </button>
      </nav>
    </div>
  );
}

function Line({ i, dim }) {
  return (
    <div className="item" style={dim ? { opacity: 0.55 } : null}>
      <div className="nm">
        <b>{i.name}</b>
        <span>
          {i.qty} × {fmt(i.price)}
        </span>
      </div>
      <b>{fmt(i.qty * i.price)}</b>
    </div>
  );
}
