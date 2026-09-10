import { NextResponse } from "next/server";
import { reorderProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";
import { reorderSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = reorderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  await reorderProducts(parsed.data.orderedIds);
  return NextResponse.json({ ok: true });
}
