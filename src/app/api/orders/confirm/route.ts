import { confirmPickup, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    initDb();
    const body = await req.json();
    const { order_id, provider_id } = body as { order_id: string; provider_id?: string };
    if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 });
    const result = confirmPickup(order_id, provider_id);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to confirm pickup" }, { status: 500 });
  }
}
