import { initDb, listProviders } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    initDb();
    const providers = listProviders();
    return NextResponse.json(providers);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list providers" }, { status: 500 });
  }
}
