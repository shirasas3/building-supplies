import { useMemo } from "react";

// מחשב את רשימת הקניות לפי התקציב, הפריטים הנדרשים ופריטי הכוכב
// fillMode: "star" = משלים רק מוצרי חובה (כוכב), "all" = משלים בכל המוצרים הנבחרים (כוכב + צריך עכשיו)
export default function useBudgetPlan(items, budget, fill, fillMode = "star") {
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
      // "star": רק פריטי כוכב מקבלים יחידות נוספות
      // "all": גם הפריטים שסומנו "צריך עכשיו" מקבלים יחידות נוספות
      const canFill = fillMode === "all" ? isReq : (i) => i.star;
      const valid = items.filter((i) => canFill(i) && i.price > 0);
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
  }, [items, budget, fill, fillMode]);
}
