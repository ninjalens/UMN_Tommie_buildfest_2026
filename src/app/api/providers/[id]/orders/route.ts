import { listOrdersByProvider, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initDb();
    const { id } = await params;
    const orders = listOrdersByProvider(id);
    return NextResponse.json(orders);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list orders" }, { status: 500 });
  }
}
