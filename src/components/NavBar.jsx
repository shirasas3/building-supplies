import { TABS } from "../constants";

export default function NavBar({ tab, onChange }) {
  return (
    <nav className="no-print">
      {Object.entries(TABS).map(([key, t]) => (
        <button key={key} className={tab === key ? "act" : ""} onClick={() => onChange(key)}>
          {t.nav}
        </button>
      ))}
    </nav>
  );
}
