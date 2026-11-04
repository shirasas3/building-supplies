import Line from "../components/Line";
import { fmt } from "../utils";

function BudgetCard({ budget, onChange }) {
  return (
    <section className="card">
      <label>כמה תקציב יש?</label>
      <div className="money">
        <span>₪</span>
        <input type="number" inputMode="decimal" value={budget} placeholder="300" onChange={(e) => onChange(e.target.value)} />
      </div>
    </section>
  );
}

function NeedPicker({ items, onToggle, fill, onFillChange }) {
  return (
    <section className="card">
      <label>🛒 מה צריך עכשיו? (לחץ לבחירה)</label>
      {items.length === 0 && <div className="empty">אין פריטים. הוסף בלשונית פריטים</div>}
      <div className="chips">
        {items.map((i) => (
          <button key={i.id} className={"chip " + (i.need ? "on" : "")} onClick={() => onToggle(i)}>
            {i.need ? "✓ " : ""}
            {i.name}
          </button>
        ))}
      </div>
      <label className="switch">
        <input type="checkbox" checked={fill} onChange={(e) => onFillChange(e.target.checked)} />
        <span>למלא את שאר התקציב בפריטי כוכב</span>
      </label>
    </section>
  );
}

function PlanSummary({ plan }) {
  return (
    <section className="card">
      <div className="mut">סה״כ בסל</div>
      <div className={"big " + (plan.left < 0 ? "bad" : "ok")}>{fmt(plan.total)}</div>
      <div className="mut">{plan.left >= 0 ? "נשאר: " + fmt(plan.left) : "חריגה: " + fmt(-plan.left)}</div>
      <div className="bar">
        <i style={{ width: Math.min(100, (plan.total / plan.B) * 100) + "%" }} />
      </div>
    </section>
  );
}

function PlanGroup({ title, items, first }) {
  if (items.length === 0) return null;
  return (
    <>
      <div className={"tag " + (first ? "first" : "")}>{title}</div>
      {items.map((i) => (
        <Line key={i.id} i={i} />
      ))}
    </>
  );
}

function PlanList({ plan }) {
  return (
    <section className="card">
      <PlanGroup title="🛒 צריך עכשיו" items={plan.need} first />
      <PlanGroup title="⭐ חובה" items={plan.star} first={plan.need.length === 0} />
      {plan.need.length + plan.star.length === 0 && <div className="empty">לא סומנו פריטים חשובים</div>}
      <PlanGroup title="מילוי התקציב" items={plan.extra} />
    </section>
  );
}

export default function PlanTab({ items, budget, setBudget, fill, setFill, plan, onUpdateItem, onFinishOrder }) {
  const hasLines = plan.need.length + plan.star.length + plan.extra.length > 0;

  return (
    <>
      <BudgetCard budget={budget} onChange={setBudget} />
      <NeedPicker items={items} onToggle={(i) => onUpdateItem(i.id, { need: !i.need })} fill={fill} onFillChange={setFill} />

      {plan.B > 0 ? (
        <>
          {plan.reqCost > plan.B && (
            <div className="warn">
              הפריטים הנדרשים עולים {fmt(plan.reqCost - plan.B)} יותר מהתקציב. כדאי להגדיל תקציב או להוריד כמות.
            </div>
          )}
          <PlanSummary plan={plan} />
          <PlanList plan={plan} />
          {hasLines && (
            <button className="btn full" onClick={onFinishOrder}>
              ✅ סיים הזמנה
            </button>
          )}
        </>
      ) : (
        <div className="empty">הכנס תקציב כדי לראות את הרשימה</div>
      )}
    </>
  );
}
