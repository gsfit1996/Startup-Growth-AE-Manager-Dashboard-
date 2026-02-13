import { NextResponse } from "next/server";

import { getFilterOptions } from "@/lib/dashboard-data";

export async function GET() {
  const filters = await getFilterOptions();
  return NextResponse.json(filters);
}
