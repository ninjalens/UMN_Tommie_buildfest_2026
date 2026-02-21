"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, QrCode } from "lucide-react";

type Provider = { id: string; name: string; address: string | null };
type OrderItem = { food_id: string; quantity: number; food_name: string };
type Order = {
  id: string;
  provider_id: string;
  status: string;
  created_at: string;
  items: OrderItem[];
};

export default function ProviderHubPage() {
  const params = useParams();
  const providerId = params.providerId as string;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOrderId, setConfirmOrderId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/providers").then((r) => r.json()),
      fetch(`/api/providers/${providerId}/orders`).then((r) => r.json()),
    ])
      .then(([providers, ords]: [Provider[], Order[]]) => {
        const p = providers.find((x: Provider) => x.id === providerId);
        setProvider(p ?? null);
        setOrders(ords);
      })
      .catch(() => setProvider(null))
      .finally(() => setLoading(false));
  }, [providerId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  const confirmPickup = useCallback(async () => {
    const orderId = confirmOrderId.trim();
    if (!orderId) {
      setMessage({ type: "err", text: "Enter order ID" });
      return;
    }
    setConfirming(true);
    setMessage(null);
    try {
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, provider_id: providerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Confirm failed" });
        return;
      }
      setMessage({ type: "ok", text: "Pickup confirmed. Inventory updated." });
      setConfirmOrderId("");
      load();
    } catch {
      setMessage({ type: "err", text: "Network error. Please try again." });
    } finally {
      setConfirming(false);
    }
  }, [confirmOrderId, load]);

  if (loading || !provider) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-8">
        {!provider && !loading && <p className="text-red-600">Hub not found</p>}
        {loading && <p className="text-stone-500">Loading...</p>}
        <Link href="/provider" className="mt-4 inline-flex items-center gap-2 text-provider">
          <ArrowLeft className="h-4 w-4" /> Back to hubs
        </Link>
      </main>
    );
  }

  const pendingOrders = orders.filter((o) => o.status !== "picked_up");

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link href="/provider" className="flex items-center gap-2 text-stone-600 hover:text-stone-900">
            <ArrowLeft className="h-5 w-5" /> Back
          </Link>
          <h1 className="text-xl font-semibold text-stone-800">{provider.name}</h1>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <section className="mb-8 rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-stone-800">
            <QrCode className="h-5 w-5 text-provider" /> Confirm pickup (scan or enter order ID)
          </h2>
          <p className="mb-3 text-sm text-stone-600">
            After the patron shows their pickup code, enter the order ID here and confirm. Inventory will update automatically.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Order ID (e.g. ord_xxx)"
              value={confirmOrderId}
              onChange={(e) => setConfirmOrderId(e.target.value)}
              className="rounded-lg border border-stone-300 px-4 py-2 focus:border-provider focus:outline-none focus:ring-1 focus:ring-provider"
            />
            <button
              type="button"
              onClick={confirmPickup}
              disabled={confirming}
              className="flex items-center gap-2 rounded-lg bg-provider px-4 py-2 text-white hover:bg-provider-dark disabled:opacity-60"
            >
              <Check className="h-4 w-4" /> {confirming ? "Confirming..." : "Confirm pickup"}
            </button>
          </div>
          {message && (
            <p className={`mt-3 text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-stone-800">Pending orders ({pendingOrders.length})</h2>
          {pendingOrders.length === 0 ? (
            <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-500">No pending pickups</p>
          ) : (
            <ul className="space-y-4">
              {pendingOrders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl border border-stone-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm text-stone-600">{order.id}</span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                      {order.status === "pending" ? "Preparing" : "Ready for pickup"}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-stone-700">
                    {order.items.map((item) => (
                      <li key={item.food_id}>
                        {item.food_name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-stone-500">Created {new Date(order.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
