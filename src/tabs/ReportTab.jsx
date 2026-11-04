import { useMemo, useState } from "react";
import RoomGroups from "../components/RoomGroups";
import { compareRooms, downloadCSV, fmt, fmtDate, sideLabel } from "../utils";

export default function ReportTab({ orders }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(
    () =>
      orders
        .flatMap((o) => o.allocations)
        .filter((a) => (!from || a.date >= from) && (!to || a.date <= to)),
    [orders, from, to]
  );

  const units = rows.reduce((s, r) => s + r.qty, 0);
  const cost = rows.reduce((s, r) => s + r.qty * r.price, 0);

  const exportCSV = () => {
    const sorted = [...rows].sort((a, b) => compareRooms(a, b) || a.date.localeCompare(b.date));
    downloadCSV(
      `דוח-חדרים-${from || "התחלה"}-עד-${to || "היום"}.csv`,
      ["תאריך", "קומה", "צד", "צד חדר", "מוצר", "כמות", "מחיר יחידה", "סה״כ"],
      sorted.map((r) => [fmtDate(r.date), r.floor, sideLabel(r.side), sideLabel(r.roomSide), r.name, r.qty, r.price, r.qty * r.price])
    );
  };

  const range = from || to ? `${from ? fmtDate(from) : "ההתחלה"} – ${to ? fmtDate(to) : "היום"}` : "כל התאריכים";

  return (
    <>
      <section className="card no-print">
        <label>טווח תאריכים</label>
        <div className="row gap">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="מתאריך" />
          <span>עד</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="עד תאריך" />
        </div>
        {(from || to) && (
          <button
            className="ghost"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            נקה סינון
          </button>
        )}
      </section>

      <section className="card">
        <div className="room-title">
          <b>📋 דוח חלוקה לחדרים</b>
          <span className="mut">{range}</span>
        </div>
        <div className="mut">
          {units} יחידות · {fmt(cost)}
        </div>
        {rows.length > 0 && (
          <div className="row gap no-print">
            <button className="btn" onClick={() => window.print()}>
              🖨 הדפסה / PDF
            </button>
            <button className="btn secondary" onClick={exportCSV}>
              ⬇ אקסל (CSV)
            </button>
          </div>
        )}
      </section>

      <RoomGroups allocations={rows} showCost />
    </>
  );
}
