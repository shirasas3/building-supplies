import { fmt } from "../utils";

// שורת פריט: שם, כמות × מחיר, וסה"כ
export default function Line({ i, dim }) {
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
