import Link from "next/link";
import { UtensilsCrossed, Store, Truck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl">
          Food Hub One-Stop
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          Share food data, reduce back-and-forth — Choose your role to continue
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          <Link
            href="/patron"
            className="group flex flex-col items-center rounded-2xl border-2 border-patron/30 bg-white p-8 shadow-sm transition hover:border-patron hover:shadow-md"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-patron/10 text-patron group-hover:bg-patron/20">
              <UtensilsCrossed className="h-8 w-8" />
            </span>
            <span className="mt-4 text-xl font-semibold text-stone-800">Patron</span>
            <span className="mt-2 text-sm text-stone-500">Get free food · Pick hub, add to cart, get pickup code</span>
          </Link>
          <Link
            href="/provider"
            className="group flex flex-col items-center rounded-2xl border-2 border-provider/30 bg-white p-8 shadow-sm transition hover:border-provider hover:shadow-md"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-provider/10 text-provider group-hover:bg-provider/20">
              <Store className="h-8 w-8" />
            </span>
            <span className="mt-4 text-xl font-semibold text-stone-800">Provider</span>
            <span className="mt-2 text-sm text-stone-500">Hub staff · View orders, scan to confirm pickup</span>
          </Link>
          <Link
            href="/supplier"
            className="group flex flex-col items-center rounded-2xl border-2 border-supplier/30 bg-white p-8 shadow-sm transition hover:border-supplier hover:shadow-md"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-supplier/10 text-supplier group-hover:bg-supplier/20">
              <Truck className="h-8 w-8" />
            </span>
            <span className="mt-4 text-xl font-semibold text-stone-800">Supplier</span>
            <span className="mt-2 text-sm text-stone-500">Suppliers · See hub inventory status and restock priority</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
