"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import QRCode from "qrcode";

type Provider = { id: string; name: string; address: string | null };
type InventoryItem = {
  food_id: string;
  food_name: string;
  unit: string;
  quantity: number;
  threshold_low: number;
  threshold_medium: number;
};
type CartItem = { food_id: string; food_name: string; unit: string; quantity: number };

export default function PatronProviderPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.providerId as string;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/providers").then((r) => r.json()),
      fetch(`/api/providers/${providerId}/inventory`).then((r) => r.json()),
    ])
      .then(([providers, inv]: [Provider[], InventoryItem[]]) => {
        const p = providers.find((x: Provider) => x.id === providerId);
        setProvider(p ?? null);
        setInventory(inv);
      })
      .catch(() => setProvider(null))
      .finally(() => setLoading(false));
  }, [providerId]);

  const addToCart = useCallback((item: InventoryItem, delta: number) => {
    if (delta <= 0 || item.quantity < 1) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.food_id === item.food_id);
      const newQty = (existing?.quantity ?? 0) + delta;
      const maxQty = Math.min(item.quantity, newQty);
      if (maxQty <= 0) return prev.filter((c) => c.food_id !== item.food_id);
      const next = prev.filter((c) => c.food_id !== item.food_id);
      if (maxQty > 0)
        next.push({
          food_id: item.food_id,
          food_name: item.food_name,
          unit: item.unit,
          quantity: maxQty,
        });
      return next;
    });
  }, []);

  const removeFromCart = useCallback((foodId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.food_id === foodId);
      if (!existing) return prev;
      const newQty = Math.max(0, existing.quantity - delta);
      if (newQty === 0) return prev.filter((c) => c.food_id !== foodId);
      return prev.map((c) =>
        c.food_id === foodId ? { ...c, quantity: newQty } : c
      );
    });
  }, []);

  const submitOrder = useCallback(async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: providerId,
          items: cart.map((c) => ({ food_id: c.food_id, quantity: c.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");
      setOrderId(data.orderId);
      const qrData = data.qr_data as string;
      const url = await QRCode.toDataURL(qrData, { width: 280, margin: 2 });
      setQrDataUrl(url);
      setCart([]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Submit failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [cart, providerId]);

  if (loading || !provider) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-8">
        {!provider && !loading && (
          <p className="text-red-600">Hub not found</p>
        )}
        {loading && <p className="text-stone-500">Loading...</p>}
        <Link href="/patron" className="mt-4 inline-flex items-center gap-2 text-patron">
          <ArrowLeft className="h-4 w-4" /> Back to hubs
        </Link>
      </main>
    );
  }

  if (orderId && qrDataUrl) {
    return (
      <main className="min-h-screen bg-stone-50">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
            <h1 className="text-xl font-semibold text-stone-800">Pickup code ready</h1>
          </div>
        </header>
        <div className="mx-auto max-w-md px-6 py-12 text-center">
          <p className="text-stone-600">Go to <strong>{provider.name}</strong> and show this QR code to pick up</p>
          <div className="mt-8 flex justify-center rounded-2xl border border-stone-200 bg-white p-6">
            <img src={qrDataUrl} alt="Pickup QR code" className="rounded-lg" />
          </div>
          <p className="mt-4 text-sm text-stone-500">Order ID: {orderId}</p>
          <Link
            href="/patron"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-patron px-6 py-3 text-white hover:bg-patron-dark"
          >
            <ArrowLeft className="h-4 w-4" /> Back to get more
          </Link>
        </div>
      </main>
    );
  }

  const cartTotal = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/patron" className="flex items-center gap-2 text-stone-600 hover:text-stone-900">
            <ArrowLeft className="h-5 w-5" /> Back
          </Link>
          <h1 className="text-xl font-semibold text-stone-800">{provider.name}</h1>
          <div className="flex items-center gap-2 text-stone-600">
            <ShoppingCart className="h-5 w-5" />
            <span>Cart ({cartTotal} items)</span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="mb-6 text-stone-600">Add items to your cart, then show your pickup code at the hub to collect.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {inventory.map((item) => (
            <div
              key={item.food_id}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4"
            >
              <div>
                <h3 className="font-medium text-stone-800">{item.food_name}</h3>
                <p className="text-sm text-stone-500">
                  Stock {item.quantity} {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => removeFromCart(item.food_id, 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center">
                  {cart.find((c) => c.food_id === item.food_id)?.quantity ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => addToCart(item, 1)}
                  disabled={item.quantity <= (cart.find((c) => c.food_id === item.food_id)?.quantity ?? 0)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-patron text-white hover:bg-patron-dark disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="mt-10 rounded-xl border border-stone-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-stone-800">Cart</h2>
            <ul className="space-y-2">
              {cart.map((c) => (
                <li key={c.food_id} className="flex justify-between text-stone-700">
                  <span>{c.food_name} × {c.quantity} {c.unit}</span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeFromCart(c.food_id, 1)}
                      className="rounded border border-stone-300 px-2 py-1 text-sm hover:bg-stone-100"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const item = inventory.find((i) => i.food_id === c.food_id);
                        if (item) addToCart(item, 1);
                      }}
                      className="rounded border border-stone-300 px-2 py-1 text-sm hover:bg-stone-100"
                    >
                      +
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={submitOrder}
              disabled={submitting}
              className="mt-4 w-full rounded-full bg-patron py-3 font-medium text-white hover:bg-patron-dark disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Generate pickup code (QR Code)"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
