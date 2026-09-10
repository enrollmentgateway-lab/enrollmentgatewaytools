import { NextResponse } from "next/server";
import { buildProductCsv } from "@/lib/products-csv";
import { listProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const csv = buildProductCsv(await listProducts());
  const filename = `gateway-products-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
