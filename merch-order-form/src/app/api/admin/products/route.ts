import { NextResponse } from "next/server";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import { createProduct, listProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";
import { productSchema } from "@/lib/validation";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return NextResponse.json(await listProducts());
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await createProduct(parsed.data), { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "That SKU is already in use." }, { status: 409 });
    }
    throw error;
  }
}
