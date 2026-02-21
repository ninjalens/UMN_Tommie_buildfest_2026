import { getAllProvidersInventoryForSupplier, initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    initDb();
    const data = getAllProvidersInventoryForSupplier();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get supplier view" }, { status: 500 });
  }
}
