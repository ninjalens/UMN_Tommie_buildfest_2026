import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "foodhub.json");

export type Provider = { id: string; name: string; address: string | null };
export type FoodItem = { id: string; name: string; unit: string };
export type ProviderInventoryRow = {
  id: number;
  provider_id: string;
  food_id: string;
  quantity: number;
  threshold_low: number;
  threshold_medium: number;
};
export type Order = {
  id: string;
  provider_id: string;
  status: "pending" | "prepared" | "picked_up";
  qr_data: string | null;
  created_at: string;
  picked_at: string | null;
};
export type OrderItem = { order_id: string; food_id: string; quantity: number };

type Store = {
  providers: Provider[];
  food_items: FoodItem[];
  provider_inventory: (ProviderInventoryRow & { food_name?: string; unit?: string })[];
  orders: Order[];
  order_items: { order_id: string; food_id: string; quantity: number; food_name?: string }[];
};

function load(): Store {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    const seed = getSeedStore();
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
  const raw = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(raw) as Store;
}

function save(store: Store) {
  const toWrite = {
    providers: store.providers,
    food_items: store.food_items,
    provider_inventory: store.provider_inventory.map(({ food_name, unit, ...r }) => r),
    orders: store.orders,
    order_items: store.order_items.map(({ food_name, ...r }) => r),
  };
  fs.writeFileSync(dbPath, JSON.stringify(toWrite, null, 2), "utf-8");
}

function getSeedStore(): Store {
  const providers: Provider[] = [
    { id: "hub-downtown", name: "Downtown Food Hub", address: "123 Main St, Saint Paul" },
    { id: "hub-midway", name: "Midway Community Kitchen", address: "456 University Ave, Saint Paul" },
    { id: "hub-north", name: "North Side Pantry", address: "789 Payne Ave, Saint Paul" },
  ];
  const food_items: FoodItem[] = [
    { id: "bread", name: "Bread", unit: "loaf" },
    { id: "milk", name: "Milk", unit: "gallon" },
    { id: "eggs", name: "Eggs", unit: "dozen" },
    { id: "rice", name: "Rice", unit: "bag" },
    { id: "canned-beans", name: "Canned Beans", unit: "can" },
    { id: "vegetables", name: "Fresh Vegetables", unit: "bag" },
  ];
  const provider_inventory: ProviderInventoryRow[] = [];
  let id = 1;
  for (const p of providers) {
    for (const f of food_items) {
      provider_inventory.push({
        id: id++,
        provider_id: p.id,
        food_id: f.id,
        quantity: Math.floor(Math.random() * 25) + 2,
        threshold_low: 5,
        threshold_medium: 15,
      });
    }
  }
  return {
    providers,
    food_items,
    provider_inventory,
    orders: [],
    order_items: [],
  };
}

export function initDb() {
  load();
}

export function listProviders(): Provider[] {
  return load().providers;
}

export function getProvider(id: string): Provider | null {
  return load().providers.find((p) => p.id === id) ?? null;
}

export function listFoodItems(): FoodItem[] {
  return load().food_items;
}

export function getProviderInventory(providerId: string) {
  const store = load();
  const foodMap = new Map(store.food_items.map((f) => [f.id, f]));
  return store.provider_inventory
    .filter((i) => i.provider_id === providerId)
    .map((i) => ({
      ...i,
      food_name: foodMap.get(i.food_id)!.name,
      unit: foodMap.get(i.food_id)!.unit,
    }));
}

export function getInventoryStatus(
  quantity: number,
  thresholdLow: number,
  thresholdMedium: number
): "green" | "yellow" | "red" {
  if (quantity >= thresholdMedium) return "green";
  if (quantity >= thresholdLow) return "yellow";
  return "red";
}

export function createOrder(providerId: string, items: { food_id: string; quantity: number }[]) {
  const store = load();
  const inv = store.provider_inventory.filter((i) => i.provider_id === providerId);
  for (const item of items) {
    const row = inv.find((i) => i.food_id === item.food_id);
    if (!row || row.quantity < item.quantity) throw new Error("Insufficient stock or invalid item. Please refresh and try again.");
  }
  const id = "ord_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const qrData = JSON.stringify({ orderId: id, providerId, createdAt: new Date().toISOString() });
  store.orders.push({
    id,
    provider_id: providerId,
    status: "pending",
    qr_data: qrData,
    created_at: new Date().toISOString(),
    picked_at: null,
  });
  for (const item of items) {
    store.order_items.push({ order_id: id, food_id: item.food_id, quantity: item.quantity });
  }
  save(store);
  return { id, qr_data: qrData };
}

export function listOrdersByProvider(providerId: string) {
  const store = load();
  const foodMap = new Map(store.food_items.map((f) => [f.id, f]));
  return store.orders
    .filter((o) => o.provider_id === providerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((o) => ({
      ...o,
      items: store.order_items
        .filter((oi) => oi.order_id === o.id)
        .map((oi) => ({
          food_id: oi.food_id,
          quantity: oi.quantity,
          food_name: foodMap.get(oi.food_id)!.name,
        })),
    }));
}

export function confirmPickup(orderId: string, providerId?: string) {
  const store = load();
  const order = store.orders.find((o) => o.id === orderId && o.status !== "picked_up");
  if (!order) return { ok: false, error: "Order not found or already picked up" };
  if (providerId != null && order.provider_id !== providerId)
    return { ok: false, error: "This order does not belong to the current hub" };
  const items = store.order_items.filter((oi) => oi.order_id === orderId);
  for (const item of items) {
    const inv = store.provider_inventory.find(
      (i) => i.provider_id === order.provider_id && i.food_id === item.food_id
    );
    if (inv) inv.quantity -= item.quantity;
  }
  order.status = "picked_up";
  order.picked_at = new Date().toISOString();
  save(store);
  return { ok: true };
}

export function getAllProvidersInventoryForSupplier() {
  const store = load();
  const foodMap = new Map(store.food_items.map((f) => [f.id, f]));
  const result = store.providers.map((p) => {
    const items = store.provider_inventory
      .filter((i) => i.provider_id === p.id)
      .map((i) => ({
        ...i,
        food_name: foodMap.get(i.food_id)!.name,
        status: getInventoryStatus(i.quantity, i.threshold_low, i.threshold_medium),
      }));
    const redCount = items.filter((i) => i.status === "red").length;
    const yellowCount = items.filter((i) => i.status === "yellow").length;
    const overall: "green" | "yellow" | "red" =
      redCount > 0 ? "red" : yellowCount > 0 ? "yellow" : "green";
    return { provider: p, items, overall, redCount, yellowCount };
  });
  return result.sort((a, b) => {
    if (a.overall === "red" && b.overall !== "red") return -1;
    if (a.overall !== "red" && b.overall === "red") return 1;
    if (a.overall === "yellow" && b.overall === "green") return -1;
    if (a.overall === "green" && b.overall === "yellow") return 1;
    return (b.redCount * 2 + b.yellowCount) - (a.redCount * 2 + a.yellowCount);
  });
}
