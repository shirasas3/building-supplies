import { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import PlanTab from "./tabs/PlanTab";
import ItemsTab from "./tabs/ItemsTab";
import OrdersTab from "./tabs/OrdersTab";
import ReportTab from "./tabs/ReportTab";
import useBudgetPlan from "./hooks/useBudgetPlan";
import { SAMPLE_ITEMS, TABS } from "./constants";
import { load, save, todayISO } from "./utils";
import "./additions.css";

export default function App() {
  const [init] = useState(() => load() || {});
  const [tab, setTab] = useState("plan");
  const [budget, setBudget] = useState(init.budget ?? "");
  const [items, setItems] = useState(init.items ?? SAMPLE_ITEMS);
  const [fill, setFill] = useState(init.fill ?? true);
  const [orders, setOrders] = useState(init.orders ?? []);
  const [openOrderId, setOpenOrderId] = useState(null);

  useEffect(() => {
    save({ budget, items, fill, orders });
  }, [budget, items, fill, orders]);

  const plan = useBudgetPlan(items, budget, fill);

  // ---------- פריטים ----------
  const updateItem = (id, ch) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...ch } : i)));
  const deleteItem = (id) => setItems((list) => list.filter((i) => i.id !== id));
  const addItem = (name, price) =>
    setItems((list) => [...list, { id: Date.now(), name, price, star: false, need: false, qty: 1 }]);

  // ---------- הזמנות ----------
  const finishOrder = () => {
    const lines = [...plan.need, ...plan.star, ...plan.extra]
      .filter((i) => i.qty > 0)
      .map((i) => ({ itemId: i.id, name: i.name, price: i.price, qty: i.qty }));
    if (lines.length === 0) return;

    const order = {
      id: Date.now(),
      date: todayISO(),
      budget: plan.B,
      total: lines.reduce((s, l) => s + l.qty * l.price, 0),
      lines,
      allocations: [],
    };
    setOrders((list) => [order, ...list]);
    setItems((list) => list.map((i) => ({ ...i, need: false }))); // מנקה את "צריך עכשיו" להזמנה הבאה
    setOpenOrderId(order.id);
    setTab("orders");
  };

  const updateOrder = (id, ch) => setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...ch } : o)));
  const deleteOrder = (id) => setOrders((list) => list.filter((o) => o.id !== id));

  const changeTab = (t) => {
    if (t === "orders") setOpenOrderId(null);
    setTab(t);
  };

  return (
    <div className="app">
      <header>{TABS[tab].title}</header>

      <main>
        {tab === "plan" && (
          <PlanTab
            items={items}
            budget={budget}
            setBudget={setBudget}
            fill={fill}
            setFill={setFill}
            plan={plan}
            onUpdateItem={updateItem}
            onFinishOrder={finishOrder}
          />
        )}
        {tab === "items" && <ItemsTab items={items} onAdd={addItem} onUpdate={updateItem} onDelete={deleteItem} />}
        {tab === "orders" && (
          <OrdersTab
            orders={orders}
            openOrderId={openOrderId}
            setOpenOrderId={setOpenOrderId}
            onUpdateOrder={updateOrder}
            onDeleteOrder={deleteOrder}
          />
        )}
        {tab === "report" && <ReportTab orders={orders} />}
      </main>

      <NavBar tab={tab} onChange={changeTab} />
    </div>
  );
}
