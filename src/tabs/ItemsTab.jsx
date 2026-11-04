import { useState } from "react";
import QtyStepper from "../components/QtyStepper";
import { fmt } from "../utils";

function AddItemForm({ onAdd }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const submit = () => {
    const p = parseFloat(price);
    if (!name.trim() || isNaN(p) || p < 0) return;
    onAdd(name.trim(), p);
    setName("");
    setPrice("");
  };

  return (
    <section className="card">
      <label>הוספת פריט</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם הפריט" />
      <div className="row gap">
        <input type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="מחיר ₪" />
        <button className="btn" onClick={submit}>
          הוסף +
        </button>
      </div>
    </section>
  );
}

function ItemRow({ i, onUpdate, onDelete }) {
  return (
    <div className="item col">
      <div className="top">
        <b className="nm">{i.name}</b>
        <button className="ghost" onClick={onDelete} aria-label="מחק">
          🗑
        </button>
      </div>
      <div className="bot">
        <span className="mut">{fmt(i.price)}</span>
        <span className="sp" />
        <button className={"tog " + (i.need ? "on" : "")} onClick={() => onUpdate({ need: !i.need })} aria-label="צריך עכשיו">
          🛒
        </button>
        <button className={"tog star " + (i.star ? "on" : "")} onClick={() => onUpdate({ star: !i.star })} aria-label="חשוב">
          ★
        </button>
        <QtyStepper value={i.qty} onChange={(qty) => onUpdate({ qty })} />
      </div>
    </div>
  );
}

export default function ItemsTab({ items, onAdd, onUpdate, onDelete }) {
  return (
    <>
      <AddItemForm onAdd={onAdd} />
      <section className="card">
        {items.length === 0 && <div className="empty">אין פריטים עדיין</div>}
        {items.map((i) => (
          <ItemRow key={i.id} i={i} onUpdate={(ch) => onUpdate(i.id, ch)} onDelete={() => onDelete(i.id)} />
        ))}
      </section>
      <div className="mut small">
        🛒 = צריך עכשיו, ★ = חשוב. הכמות שליד כל פריט היא כמה יחידות לקנות ממנו (ברירת מחדל 1). פריטי כוכב מקבלים בנוסף את שאר התקציב.
      </div>
    </>
  );
}
