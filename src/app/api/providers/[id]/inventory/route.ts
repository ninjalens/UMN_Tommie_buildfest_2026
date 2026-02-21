import { getProviderInventory, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initDb();
    const { id } = await params;
    const inventory = getProviderInventory(id);
    return NextResponse.json(inventory);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get inventory" }, { status: 500 });
  }
}
