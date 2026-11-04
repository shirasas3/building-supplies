// כפתורי + / − לכמות
export default function QtyStepper({ value, onChange, min = 1, max = Infinity }) {
  return (
    <div className="qty">
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        +
      </button>
      <b>{value}</b>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        −
      </button>
    </div>
  );
}
