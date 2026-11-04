import { STORAGE_KEY } from "./constants";

// ---------- שמירה מקומית ----------
export const load = () => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
};

export const save = (d) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch (e) {}
};

// ---------- פורמטים ----------
export const fmt = (n) => "₪" + (Math.round(n * 100) / 100).toLocaleString("he-IL");

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const fmtDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

// ---------- חדרים ----------
export const sideLabel = (v) => (v === "right" ? "ימין" : "שמאל");

export const roomKey = (a) => `${a.floor}-${a.side}-${a.roomSide}`;

export const roomLabel = (a) => `קומה ${a.floor} · צד ${sideLabel(a.side)} · חדר ${sideLabel(a.roomSide)}`;

// מיון: קומה, ואז צד (ימין לפני שמאל), ואז צד חדר
const sideOrder = (v) => (v === "right" ? 0 : 1);
export const compareRooms = (a, b) =>
  a.floor - b.floor || sideOrder(a.side) - sideOrder(b.side) || sideOrder(a.roomSide) - sideOrder(b.roomSide);

// מקבץ רשימת שיוכים לפי חדר, ממוין
export const groupByRoom = (allocations) => {
  const map = new Map();
  allocations.forEach((a) => {
    const k = roomKey(a);
    if (!map.has(k)) map.set(k, { key: k, floor: a.floor, side: a.side, roomSide: a.roomSide, rows: [] });
    map.get(k).rows.push(a);
  });
  return [...map.values()].sort(compareRooms);
};

// ---------- ייצוא ----------
export const downloadCSV = (filename, header, rows) => {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  // BOM כדי שאקסל יציג עברית נכון
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
