import { fmt, fmtDate, groupByRoom, roomLabel } from "../utils";

// מציג שיוכים מקובצים לפי חדר. onDelete אופציונלי (במסך ההזמנה)
export default function RoomGroups({ allocations, onDelete, showCost = false }) {
  const rooms = groupByRoom(allocations);
  if (rooms.length === 0) return <div className="empty">עדיין לא שויכו מוצרים</div>;

  return rooms.map((room) => {
    const rows = [...room.rows].sort((a, b) => a.date.localeCompare(b.date));
    const units = rows.reduce((s, r) => s + r.qty, 0);
    const cost = rows.reduce((s, r) => s + r.qty * r.price, 0);
    return (
      <section className="card room" key={room.key}>
        <div className="room-title">
          <b>🚪 {roomLabel(room)}</b>
          <span className="mut">
            {units} יח׳{showCost ? " · " + fmt(cost) : ""}
          </span>
        </div>
        {rows.map((r) => (
          <div className="item" key={r.id}>
            <div className="nm">
              <b>{r.name}</b>
              <span>{fmtDate(r.date)}</span>
            </div>
            <b>× {r.qty}</b>
            {onDelete && (
              <button className="ghost no-print" onClick={() => onDelete(r.id)} aria-label="מחק">
                🗑
              </button>
            )}
          </div>
        ))}
      </section>
    );
  });
}
