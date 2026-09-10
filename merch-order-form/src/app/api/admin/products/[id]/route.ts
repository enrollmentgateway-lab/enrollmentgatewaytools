import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isNotFoundError, isUniqueConstraintError } from "@/lib/prisma-errors";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";
import { productUpdateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const product = await getProduct((await params).id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = productUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { id } = await params;
  const previous = await getProduct(id);

  try {
    const updated = await updateProduct(id, parsed.data);

    // Drop the old file when the image was replaced or cleared.
    if (previous?.imagePath && previous.imagePath !== updated.imagePath) {
      await removeUpload(previous.imagePath);
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "That SKU is already in use." }, { status: 409 });
    }
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const deleted = await deleteProduct((await params).id);
    if (deleted.imagePath) {
      await removeUpload(deleted.imagePath);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    throw error;
  }
}

/** Best-effort cleanup — a missing or locked file must not fail the request. */
async function removeUpload(imagePath: string) {
  if (!imagePath.startsWith("/uploads/products/")) return;
  const absolute = path.join(process.cwd(), "public", imagePath);
  await unlink(absolute).catch(() => undefined);
}
