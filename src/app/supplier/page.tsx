"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle, Truck } from "lucide-react";

type Provider = { id: string; name: string; address: string | null };
type ItemStatus = "green" | "yellow" | "red";
type InventoryItem = {
  food_id: string;
  food_name: string;
  quantity: number;
  threshold_low: number;
  threshold_medium: number;
  status: ItemStatus;
};
type ProviderSummary = {
  provider: Provider;
  items: InventoryItem[];
  overall: ItemStatus;
  redCount: number;
  yellowCount: number;
};

function StatusBadge({ status }: { status: ItemStatus }) {
  if (status === "green")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-sm text-emerald-800">
        <CheckCircle className="h-3.5 w-3.5" /> Good
      </span>
    );
  if (status === "yellow")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-800">
        <AlertCircle className="h-3.5 w-3.5" /> Low
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-sm text-red-800">
      <AlertCircle className="h-3.5 w-3.5" /> Critical
    </span>
  );
}

export default function SupplierPage() {
  const [data, setData] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/supplier/inventory")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      fetch("/api/supplier/inventory")
        .then((r) => r.json())
        .then(setData);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-stone-600 hover:text-stone-900">
            <ArrowLeft className="h-5 w-5" /> Back
          </Link>
          <h1 className="text-xl font-semibold text-stone-800">Supplier · Hub inventory & restock priority</h1>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <p className="mb-6 text-stone-600">
          Sorted by need: red = restock first, yellow = low, green = good. Data refreshes periodically.
        </p>
        {loading ? (
          <p className="text-stone-500">Loading...</p>
        ) : (
          <ul className="space-y-6">
            {data.map(({ provider, items, overall, redCount, yellowCount }) => (
              <li
                key={provider.id}
                className="rounded-xl border-2 bg-white p-6 shadow-sm"
                style={{
                  borderColor:
                    overall === "red"
                      ? "rgb(254 202 202)"
                      : overall === "yellow"
                        ? "rgb(254 243 199)"
                        : "rgb(209 250 229)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-supplier/10 text-supplier">
                      <Truck className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-stone-800">{provider.name}</h2>
                      {provider.address && (
                        <p className="text-sm text-stone-500">{provider.address}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={overall} />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {items.map((item) => (
                    <div
                      key={item.food_id}
                      className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50/50 px-4 py-2"
                    >
                      <span className="text-stone-700">{item.food_name}</span>
                      <span className="text-sm text-stone-500">
                        {item.quantity} / low {item.threshold_low} · mid {item.threshold_medium}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
                {(redCount > 0 || yellowCount > 0) && (
                  <p className="mt-3 text-sm text-stone-600">
                    {redCount > 0 && <span className="text-red-600">{redCount} critical</span>}
                    {redCount > 0 && yellowCount > 0 && " · "}
                    {yellowCount > 0 && <span className="text-amber-600">{yellowCount} low</span>}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
