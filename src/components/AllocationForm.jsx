import { useState } from "react";
import Segmented from "./Segmented";
import QtyStepper from "./QtyStepper";
import { FLOORS, SIDES } from "../constants";
import { todayISO } from "../utils";

// טופס שיוך מוצר מההזמנה לחדר
// lines: [{ itemId, name, price, qty, remaining }]
export default function AllocationForm({ lines, onAdd }) {
  const [itemId, setItemId] = useState(null);
  const [qty, setQty] = useState(1);
  const [floor, setFloor] = useState(null);
  const [side, setSide] = useState(null);
  const [roomSide, setRoomSide] = useState(null);
  const [date, setDate] = useState(todayISO());

  const available = lines.filter((l) => l.remaining > 0);
  const selected = available.find((l) => l.itemId === itemId);
  const ready = selected && floor && side && roomSide && date;

  const pickItem = (id) => {
    setItemId(id);
    setQty(1);
  };

  const submit = () => {
    if (!ready) return;
    onAdd({
      id: Date.now() + Math.random(),
      itemId: selected.itemId,
      name: selected.name,
      price: selected.price,
      qty: Math.min(qty, selected.remaining),
      floor,
      side,
      roomSide,
      date,
    });
    // החדר והתאריך נשארים – נוח להוסיף עוד מוצרים לאותו חדר
    setItemId(null);
    setQty(1);
  };

  if (available.length === 0) {
    return (
      <section className="card">
        <div className="empty">✓ כל המוצרים בהזמנה שויכו לחדרים</div>
      </section>
    );
  }

  return (
    <section className="card">
      <label>מוצר</label>
      <div className="chips">
        {available.map((l) => (
          <button key={l.itemId} className={"chip " + (itemId === l.itemId ? "on" : "")} onClick={() => pickItem(l.itemId)}>
            {l.name} <span className="mut">({l.remaining})</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="row gap field">
          <span>כמות</span>
          <span className="sp" />
          <QtyStepper value={qty} onChange={setQty} max={selected.remaining} />
        </div>
      )}

      <label>קומה</label>
      <Segmented options={FLOORS} value={floor} onChange={setFloor} />

      <label>צד</label>
      <Segmented options={SIDES} value={side} onChange={setSide} />

      <label>צד חדר</label>
      <Segmented options={SIDES} value={roomSide} onChange={setRoomSide} />

      <label>תאריך</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <button className="btn full" onClick={submit} disabled={!ready}>
        שייך לחדר +
      </button>
    </section>
  );
}
