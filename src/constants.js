export const STORAGE_KEY = "bldg-supplies-v1";

export const SAMPLE_ITEMS = [
  { id: 1, name: "נייר טואלט", price: 26, star: true, need: false, qty: 1 },
  { id: 2, name: "קליר דיש", price: 6.2, star: false, need: false, qty: 1 },
  { id: 3, name: "שקיות אשפה", price: 13, star: false, need: false, qty: 1 },
  { id: 4, name: "מטליות", price: 10, star: false, need: false, qty: 1 },
  { id: 5, name: "אקונומיקה", price: 14, star: false, need: false, qty: 1 },
  { id: 6, name: "קליר ספריי", price: 8, star: false, need: false, qty: 1 },
  { id: 7, name: "סל אשפה", price: 9, star: false, need: false, qty: 1 },
  { id: 8, name: "סקוצ'ים", price: 6.2, star: false, need: false, qty: 1 },
];

export const FLOORS = [
  { v: 1, label: "1" },
  { v: 2, label: "2" },
  { v: 3, label: "3" },
];

export const SIDES = [
  { v: "right", label: "ימין" },
  { v: "left", label: "שמאל" },
];

export const TABS = {
  plan: { title: "🏢 תקציב הבניין", nav: "🛍 קניות" },
  items: { title: "📦 הפריטים שלי", nav: "📦 פריטים" },
  orders: { title: "🧾 הזמנות", nav: "🧾 הזמנות" },
  report: { title: "📋 דוח חדרים", nav: "📋 דוח" },
};
