import { prisma } from "@/lib/db";
import type { Prisma, Product } from "@/generated/prisma/client";

export type ProductInput = {
  name: string;
  sku: string;
  priceCents: number;
  category?: string | null;
  description?: string | null;
  imagePath?: string | null;
  isActive?: boolean;
};

export function listProducts(options: { activeOnly?: boolean } = {}): Promise<Product[]> {
  return prisma.product.findMany({
    where: options.activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function getProduct(id: string): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const last = await prisma.product.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return prisma.product.create({
    data: { ...input, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
}

export function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  return prisma.product.update({ where: { id }, data: input });
}

export function deleteProduct(id: string): Promise<Product> {
  return prisma.product.delete({ where: { id } });
}

export function reorderProducts(orderedIds: string[]): Promise<Prisma.BatchPayload[]> {
  return prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.product.updateMany({ where: { id }, data: { sortOrder: index } }),
    ),
  );
}

export type CsvUpsertRow = {
  line: number;
  sku: string;
  name?: string;
  priceCents?: number;
  category?: string | null;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type CsvUpsertResult = {
  created: number;
  updated: number;
  errors: { line: number; message: string }[];
};

/**
 * Applies CSV rows by SKU: known SKUs are updated, unknown ones created.
 * Products absent from the file are left alone — an import never deletes.
 * With `dryRun`, classifies and validates the rows without writing.
 */
export async function upsertProductsBySku(
  rows: CsvUpsertRow[],
  options: { dryRun?: boolean } = {},
): Promise<CsvUpsertResult> {
  const existing = await prisma.product.findMany({
    where: { sku: { in: rows.map((row) => row.sku) } },
  });
  const bySku = new Map(existing.map((product) => [product.sku, product]));

  const last = await prisma.product.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  let nextSortOrder = (last?.sortOrder ?? -1) + 1;

  const errors: CsvUpsertResult["errors"] = [];
  const creates: Prisma.ProductCreateManyInput[] = [];
  const updates: { id: string; data: Prisma.ProductUpdateInput }[] = [];

  for (const row of rows) {
    const match = bySku.get(row.sku);

    if (match) {
      const data: Prisma.ProductUpdateInput = {};
      if (row.name !== undefined) data.name = row.name;
      if (row.priceCents !== undefined) data.priceCents = row.priceCents;
      if (row.category !== undefined) data.category = row.category;
      if (row.description !== undefined) data.description = row.description;
      if (row.isActive !== undefined) data.isActive = row.isActive;
      if (row.sortOrder !== undefined) data.sortOrder = row.sortOrder;

      if (Object.keys(data).length > 0) {
        updates.push({ id: match.id, data });
      }
      continue;
    }

    if (!row.name || row.priceCents === undefined) {
      errors.push({
        line: row.line,
        message: `"${row.sku}" is new, so it needs both a name and a price.`,
      });
      continue;
    }

    creates.push({
      sku: row.sku,
      name: row.name,
      priceCents: row.priceCents,
      category: row.category ?? null,
      description: row.description ?? null,
      isActive: row.isActive ?? true,
      sortOrder: row.sortOrder ?? nextSortOrder,
    });
    if (row.sortOrder === undefined) nextSortOrder += 1;
  }

  if (!options.dryRun) {
    await prisma.$transaction([
      ...updates.map(({ id, data }) => prisma.product.update({ where: { id }, data })),
      ...(creates.length > 0 ? [prisma.product.createMany({ data: creates })] : []),
    ]);
  }

  return { created: creates.length, updated: updates.length, errors };
}

/** Groups products by category, preserving sortOrder within each group. */
export function groupByCategory(products: Product[]): { category: string; products: Product[] }[] {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = product.category?.trim() || "Other";
    const existing = groups.get(key);
    if (existing) {
      existing.push(product);
    } else {
      groups.set(key, [product]);
    }
  }
  return [...groups.entries()].map(([category, items]) => ({ category, products: items }));
}
