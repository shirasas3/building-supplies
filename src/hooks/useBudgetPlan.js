import { useMemo } from "react";

// מחשב את רשימת הקניות לפי התקציב, הפריטים הנדרשים ופריטי הכוכב
export default function useBudgetPlan(items, budget, fill) {
  return useMemo(() => {
    const B = parseFloat(budget) || 0;
    const isReq = (i) => i.star || i.need;
    const q = {};
    items.forEach((i) => {
      q[i.id] = isReq(i) ? i.qty : 0;
    });
    const reqCost = items.filter(isReq).reduce((s, i) => s + i.price * q[i.id], 0);
    let left = B - reqCost;

    if (fill) {
      // רק פריטי כוכב מקבלים יחידות נוספות; כל השאר נשארים בכמות המינימלית
      const valid = items.filter((i) => i.star && i.price > 0);
      while (true) {
        const c = valid
          .filter((i) => i.price <= left + 1e-9)
          .sort((a, b) => q[a.id] - q[b.id] || a.price - b.price)[0];
        if (!c) break;
        q[c.id]++;
        left -= c.price;
      }
    }

    const withQ = (i) => ({ ...i, qty: q[i.id] });
    return {
      B,
      reqCost,
      left,
      total: B - left,
      need: items.filter((i) => i.need && !i.star).map(withQ),
      star: items.filter((i) => i.star).map(withQ),
      extra: fill ? items.filter((i) => !isReq(i) && q[i.id] > 0).map(withQ) : [],
    };
  }, [items, budget, fill]);
}
