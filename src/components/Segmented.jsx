// קבוצת כפתורים לבחירה אחת (קומה / צד / צד חדר)
export default function Segmented({ options, value, onChange }) {
  return (
    <div className="chips seg">
      {options.map((o) => (
        <button key={o.v} type="button" className={"chip " + (value === o.v ? "on" : "")} onClick={() => onChange(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
