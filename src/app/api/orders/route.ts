import { createOrder, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    initDb();
    const body = await req.json();
    const { provider_id, items } = body as { provider_id: string; items: { food_id: string; quantity: number }[] };
    if (!provider_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "provider_id and items required" }, { status: 400 });
    }
    const { id, qr_data } = createOrder(provider_id, items);
    return NextResponse.json({ orderId: id, qr_data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
