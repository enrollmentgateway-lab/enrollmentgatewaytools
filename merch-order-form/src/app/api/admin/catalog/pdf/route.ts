import { NextResponse } from "next/server";
import { generateCatalogPdf } from "@/lib/catalog/template";
import { listProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";

export const maxDuration = 60;

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const products = await listProducts({ activeOnly: true });
  if (products.length === 0) {
    return NextResponse.json(
      { error: "Add at least one active product before generating a catalog." },
      { status: 400 },
    );
  }

  const pdf = await generateCatalogPdf(products);
  const inline = new URL(request.url).searchParams.get("inline") === "1";
  const filename = `gateway-merchandise-catalog-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
