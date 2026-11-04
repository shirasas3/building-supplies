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
  { id: 1, name: "נייר טואלט", price: 26, star: true, need: false, qty: 1 },
  { id: 2, name: "קליר דיש", price: 6.2, star: false, need: false, qty: 1 },
  { id: 3, name: "שקיות אשפה", price: 13, star: false, need: false, qty: 1 },
  { id: 4, name: "מטליות", price: 10, star: false, need: false, qty: 1 },
  { id: 5, name: "אקונומיקה", price: 14, star: false, need: false, qty: 1 },
  { id: 6, name: "קליר ספריי", price: 8, star: false, need: false, qty: 1 },
  { id: 7, name: "סל אשפה", price: 9, star: false, need: false, qty: 1 },
  { id: 8, name: "סקוצ'ים", price: 6.2, star: false, need: false, qty: 1 },
];

const fmt = (n) => "₪" + (Math.round(n * 100) / 100).toLocaleString("he-IL");

export default function App() {
  const init = load() || {};
  const [tab, setTab] = useState("plan");
  const [budget, setBudget] = useState(init.budget ?? "");
  const [items, setItems] = useState(init.items ?? sample);
  const [fill, setFill] = useState(init.fill ?? true);
  const [nm, setNm] = useState("");
  const [pr, setPr] = useState("");

  useEffect(() => {
    save({ budget, items, fill });
  }, [budget, items, fill]);

  const upd = (id, ch) => setItems(items.map((i) => (i.id === id ? { ...i, ...ch } : i)));
  const del = (id) => setItems(items.filter((i) => i.id !== id));

  const add = () => {
    const p = parseFloat(pr);
    if (!nm.trim() || isNaN(p) || p < 0) return;
    setItems([...items, { id: Date.now(), name: nm.trim(), price: p, star: false, need: false, qty: 1 }]);
    setNm("");
    setPr("");
  };

  const plan = useMemo(() => {
    const B = parseFloat(budget) || 0;
    const isReq = (i) => i.star || i.need;
    const q = {};
    items.forEach((i) => {
      q[i.id] = isReq(i) ? i.qty : 0;
    });
    const reqCost = items.filter(isReq).reduce((s, i) => s + i.price * i.qty, 0);
    let left = B - reqCost;
    if (fill) {
      // starred and "need now" items absorb the leftover budget; star gets about double
      const w = (i) => (i.star ? 4 : 2);
      const valid = items.filter((i) => isReq(i) && i.price > 0);
      while (true) {
        const c = valid
          .filter((i) => i.price <= left + 1e-9)
          .sort((a, b) => q[a.id] / w(a) - q[b.id] / w(b) || a.price - b.price)[0];
        if (!c) break;
        q[c.id]++;
        left -= c.price;
      }
    }
    const withQ = (i) => ({ ...i, qty: q[i.id] });
    return {
      B,
      reqCost,
      left,
      total: B - left,
      need: items.filter((i) => i.need).map(withQ),
      star: items.filter((i) => i.star && !i.need).map(withQ),
      extra: items.filter((i) => !isReq(i) && q[i.id] > 0).map(withQ),
    };
  }, [items, budget, fill]);

  return (
    <div className="app">
      <header>{tab === "plan" ? "🏢 תקציב הבניין" : "📦 הפריטים שלי"}</header>

      <main>
        {tab === "plan" && (
          <>
            <section className="card">
              <label>כמה תקציב יש?</label>
              <div className="money">
                <span>₪</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={budget}
                  placeholder="300"
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </section>

            <section className="card">
              <label>🛒 מה צריך עכשיו? (לחץ לבחירה)</label>
              {items.length === 0 && <div className="empty">אין פריטים. הוסף בלשונית פריטים</div>}
              <div className="chips">
                {items.map((i) => (
                  <button key={i.id} className={"chip " + (i.need ? "on" : "")} onClick={() => upd(i.id, { need: !i.need })}>
                    {i.need ? "✓ " : ""}
                    {i.name}
                  </button>
                ))}
              </div>
              <label className="switch">
                <input type="checkbox" checked={fill} onChange={(e) => setFill(e.target.checked)} />
                <span>למלא את שאר התקציב בפריטים מסומנים</span>
              </label>
            </section>

            {plan.B > 0 ? (
              <>
                {plan.reqCost > plan.B && (
                  <div className="warn">
                    הפריטים הנדרשים עולים {fmt(plan.reqCost - plan.B)} יותר מהתקציב. כדאי להגדיל תקציב או להוריד כמות.
                  </div>
                )}
                <section className="card">
                  <div className="mut">סה״כ בסל</div>
                  <div className={"big " + (plan.left < 0 ? "bad" : "ok")}>{fmt(plan.total)}</div>
                  <div className="mut">{plan.left >= 0 ? "נשאר: " + fmt(plan.left) : "חריגה: " + fmt(-plan.left)}</div>
                  <div className="bar">
                    <i style={{ width: Math.min(100, (plan.total / plan.B) * 100) + "%" }} />
                  </div>
                </section>

                <section className="card">
                  {plan.need.length > 0 && (
                    <>
                      <div className="tag first">🛒 צריך עכשיו</div>
                      {plan.need.map((i) => (
                        <Line key={i.id} i={i} />
                      ))}
                    </>
                  )}
                  {plan.star.length > 0 && (
                    <>
                      <div className={"tag " + (plan.need.length === 0 ? "first" : "")}>⭐ חובה</div>
                      {plan.star.map((i) => (
                        <Line key={i.id} i={i} />
                      ))}
                    </>
                  )}
                  {plan.need.length + plan.star.length === 0 && <div className="empty">לא סומנו פריטים חשובים</div>}
                  {fill && plan.extra.length > 0 && (
                    <>
                      <div className="tag">מילוי התקציב</div>
                      {plan.extra.map((i) => (
                        <Line key={i.id} i={i} />
                      ))}
                    </>
                  )}
                </section>
              </>
            ) : (
              <div className="empty">הכנס תקציב כדי לראות את הרשימה</div>
            )}
          </>
        )}

        {tab === "items" && (
          <>
            <section className="card">
              <label>הוספת פריט</label>
              <input type="text" value={nm} onChange={(e) => setNm(e.target.value)} placeholder="שם הפריט" />
              <div className="row gap">
                <input
                  type="number"
                  inputMode="decimal"
                  value={pr}
                  onChange={(e) => setPr(e.target.value)}
                  placeholder="מחיר ₪"
                />
                <button className="btn" onClick={add}>
                  הוסף +
                </button>
              </div>
            </section>

            <section className="card">
              {items.length === 0 && <div className="empty">אין פריטים עדיין</div>}
              {items.map((i) => (
                <div className="item col" key={i.id}>
                  <div className="top">
                    <b className="nm">{i.name}</b>
                    <button className="ghost" onClick={() => del(i.id)} aria-label="מחק">
                      🗑
                    </button>
                  </div>
                  <div className="bot">
                    <span className="mut">{fmt(i.price)}</span>
                    <span className="sp" />
                    <button className={"tog " + (i.need ? "on" : "")} onClick={() => upd(i.id, { need: !i.need })} aria-label="צריך עכשיו">
                      🛒
                    </button>
                    <button className={"tog star " + (i.star ? "on" : "")} onClick={() => upd(i.id, { star: !i.star })} aria-label="חשוב">
                      ★
                    </button>
                    <div className="qty">
                      <button onClick={() => upd(i.id, { qty: i.qty + 1 })}>+</button>
                      <b>{i.qty}</b>
                      <button onClick={() => upd(i.id, { qty: Math.max(1, i.qty - 1) })}>−</button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
            <div className="mut small">
              🛒 = צריך עכשיו, ★ = חשוב תמיד. הכמות היא המינימום לפריט מסומן. את שאר התקציב ממלאים פריטים מסומנים בלבד: פריט עם כוכב מקבל הכי הרבה יחידות, ופריט עם 🛒 בערך חצי ממנו.
            </div>
          </>
        )}
      </main>

      <nav>
        <button className={tab === "plan" ? "act" : ""} onClick={() => setTab("plan")}>
          🛍 רשימת קניות
        </button>
        <button className={tab === "items" ? "act" : ""} onClick={() => setTab("items")}>
          📦 פריטים
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