import { NextResponse } from "next/server";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import { parseProductCsv } from "@/lib/products-csv";
import { upsertProductsBySku } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const dryRun = formData?.get("dryRun") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "CSV files must be 2 MB or smaller." }, { status: 400 });
  }

  const { rows, errors: parseErrors } = parseProductCsv(await file.text());

  if (rows.length === 0) {
    return NextResponse.json(
      { error: parseErrors[0]?.message ?? "No product rows found.", errors: parseErrors },
      { status: 400 },
    );
  }

  try {
    const result = await upsertProductsBySku(rows, { dryRun });
    return NextResponse.json({
      dryRun,
      created: result.created,
      updated: result.updated,
      errors: [...parseErrors, ...result.errors],
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "A SKU in this file collides with an existing product. Nothing was changed." },
        { status: 409 },
      );
    }
    throw error;
  }
}
