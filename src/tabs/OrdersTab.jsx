import AllocationForm from "../components/AllocationForm";
import RoomGroups from "../components/RoomGroups";
import { fmt, fmtDate } from "../utils";

// כמה נשאר לשייך מכל מוצר בהזמנה
const linesWithRemaining = (order) =>
  order.lines.map((l) => {
    const used = order.allocations.filter((a) => a.itemId === l.itemId).reduce((s, a) => s + a.qty, 0);
    return { ...l, used, remaining: l.qty - used };
  });

const progress = (order) => {
  const total = order.lines.reduce((s, l) => s + l.qty, 0);
  const used = order.allocations.reduce((s, a) => s + a.qty, 0);
  return { total, used };
};

function OrderList({ orders, onOpen }) {
  if (orders.length === 0) {
    return <div className="empty">אין הזמנות עדיין. לחצי "סיים הזמנה" ברשימת הקניות</div>;
  }
  return (
    <section className="card">
      {orders.map((o) => {
        const p = progress(o);
        return (
          <button className="item order-row" key={o.id} onClick={() => onOpen(o.id)}>
            <div className="nm">
              <b>הזמנה {fmtDate(o.date)}</b>
              <span>
                {fmt(o.total)} · שויכו {p.used}/{p.total}
              </span>
            </div>
            <b>{p.used >= p.total ? "✓" : "‹"}</b>
          </button>
        );
      })}
    </section>
  );
}

function OrderDetail({ order, onChange, onBack, onDelete }) {
  const lines = linesWithRemaining(order);

  const addAllocation = (a) => onChange({ allocations: [...order.allocations, a] });
  const removeAllocation = (id) => onChange({ allocations: order.allocations.filter((a) => a.id !== id) });

  return (
    <>
      <div className="row gap">
        <button className="ghost" onClick={onBack}>
          › חזרה להזמנות
        </button>
        <span className="sp" />
        <button
          className="ghost"
          onClick={() => {
            if (window.confirm("למחוק את ההזמנה וכל השיוכים שלה?")) onDelete();
          }}
        >
          🗑 מחק הזמנה
        </button>
      </div>

      <section className="card">
        <div className="room-title">
          <b>🧾 הזמנה {fmtDate(order.date)}</b>
          <span className="mut">{fmt(order.total)}</span>
        </div>
        {lines.map((l) => (
          <div className="item" key={l.itemId}>
            <div className="nm">
              <b>{l.name}</b>
              <span>
                שויכו {l.used} מתוך {l.qty}
              </span>
            </div>
            <b className={l.remaining === 0 ? "ok" : ""}>{l.remaining === 0 ? "✓" : `נשאר ${l.remaining}`}</b>
          </div>
        ))}
      </section>

      <div className="tag first">➕ שיוך מוצר לחדר</div>
      <AllocationForm key={order.id} lines={lines} onAdd={addAllocation} />

      <div className="tag">🚪 לפי חדר</div>
      <RoomGroups allocations={order.allocations} onDelete={removeAllocation} />
    </>
  );
}

export default function OrdersTab({ orders, openOrderId, setOpenOrderId, onUpdateOrder, onDeleteOrder }) {
  const order = orders.find((o) => o.id === openOrderId);
  if (order) {
    return (
      <OrderDetail
        order={order}
        onChange={(ch) => onUpdateOrder(order.id, ch)}
        onBack={() => setOpenOrderId(null)}
        onDelete={() => {
          onDeleteOrder(order.id);
          setOpenOrderId(null);
        }}
      />
    );
  }
  return <OrderList orders={orders} onOpen={setOpenOrderId} />;
}
