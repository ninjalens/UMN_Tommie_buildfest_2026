"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

type Provider = { id: string; name: string; address: string | null };

export default function PatronPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/providers")
      .then((r) => r.json())
      .then(setProviders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="h-5 w-5" /> Back
          </Link>
          <h1 className="text-xl font-semibold text-stone-800">Patron · Choose a hub to pick up</h1>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {loading ? (
          <p className="text-stone-500">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {providers.map((p) => (
              <Link
                key={p.id}
                href={`/patron/${p.id}`}
                className="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-patron hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-patron/10 text-patron">
                  <Store className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-semibold text-stone-800">{p.name}</h2>
                  {p.address && (
                    <p className="mt-1 text-sm text-stone-500">{p.address}</p>
                  )}
                  <span className="mt-2 inline-block text-sm text-patron">Pick up at this hub →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
