import { parseCsv, toCsv } from "@/lib/csv";
import { centsToDollarString } from "@/lib/currency";
import type { Product } from "@/generated/prisma/client";

export const CSV_COLUMNS = [
  "sku",
  "name",
  "price",
  "category",
  "description",
  "active",
  "sortOrder",
] as const;

/** Header aliases so a spreadsheet doesn't have to match our column names exactly. */
const HEADER_ALIASES: Record<string, (typeof CSV_COLUMNS)[number]> = {
  sku: "sku",
  "item number": "sku",
  itemnumber: "sku",
  name: "name",
  product: "name",
  "product name": "name",
  title: "name",
  price: "price",
  "price usd": "price",
  "unit price": "price",
  cost: "price",
  category: "category",
  group: "category",
  description: "description",
  details: "description",
  active: "active",
  isactive: "active",
  visible: "active",
  status: "active",
  sortorder: "sortOrder",
  "sort order": "sortOrder",
  order: "sortOrder",
  position: "sortOrder",
};

export type CsvProductRow = {
  line: number;
  sku: string;
  name?: string;
  priceCents?: number;
  category?: string | null;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type CsvParseResult = {
  rows: CsvProductRow[];
  errors: { line: number; message: string }[];
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function parsePrice(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

function parseBoolean(raw: string): boolean | null {
  const value = raw.trim().toLowerCase();
  if (["true", "yes", "y", "1", "active", "visible", "shown"].includes(value)) return true;
  if (["false", "no", "n", "0", "inactive", "hidden", "draft"].includes(value)) return false;
  return null;
}

/**
 * Parses a product CSV. Blank cells mean "leave this field as it is" for products
 * that already exist, so a partially filled sheet can't wipe existing copy.
 */
export function parseProductCsv(text: string): CsvParseResult {
  const table = parseCsv(text);
  const errors: CsvParseResult["errors"] = [];

  if (table.length === 0) {
    return { rows: [], errors: [{ line: 0, message: "The file is empty." }] };
  }

  const headerRow = table[0].map(normalizeHeader);
  const columnFor = new Map<number, (typeof CSV_COLUMNS)[number]>();
  headerRow.forEach((header, index) => {
    const mapped = HEADER_ALIASES[header];
    if (mapped && ![...columnFor.values()].includes(mapped)) {
      columnFor.set(index, mapped);
    }
  });

  if (![...columnFor.values()].includes("sku")) {
    return {
      rows: [],
      errors: [
        {
          line: 1,
          message: `No "sku" column found. Expected a header row containing: ${CSV_COLUMNS.join(", ")}.`,
        },
      ],
    };
  }

  const rows: CsvProductRow[] = [];
  const seenSkus = new Set<string>();

  for (let rowIndex = 1; rowIndex < table.length; rowIndex += 1) {
    const line = rowIndex + 1;
    const cells = table[rowIndex];
    const get = (column: (typeof CSV_COLUMNS)[number]): string => {
      for (const [index, mapped] of columnFor) {
        if (mapped === column) return (cells[index] ?? "").trim();
      }
      return "";
    };

    const sku = get("sku");
    if (sku === "") {
      errors.push({ line, message: "Missing SKU." });
      continue;
    }
    if (seenSkus.has(sku.toLowerCase())) {
      errors.push({ line, message: `Duplicate SKU "${sku}" in this file.` });
      continue;
    }
    seenSkus.add(sku.toLowerCase());

    const row: CsvProductRow = { line, sku };

    const name = get("name");
    if (name !== "") row.name = name;

    const priceRaw = get("price");
    if (priceRaw !== "") {
      const priceCents = parsePrice(priceRaw);
      if (priceCents === null) {
        errors.push({ line, message: `Could not read the price "${priceRaw}".` });
        continue;
      }
      row.priceCents = priceCents;
    }

    const category = get("category");
    if (category !== "") row.category = category;

    const description = get("description");
    if (description !== "") row.description = description;

    const activeRaw = get("active");
    if (activeRaw !== "") {
      const isActive = parseBoolean(activeRaw);
      if (isActive === null) {
        errors.push({ line, message: `Could not read "${activeRaw}" as yes/no.` });
        continue;
      }
      row.isActive = isActive;
    }

    const sortRaw = get("sortOrder");
    if (sortRaw !== "") {
      const sortOrder = Number.parseInt(sortRaw, 10);
      if (!Number.isFinite(sortOrder)) {
        errors.push({ line, message: `Could not read the sort order "${sortRaw}".` });
        continue;
      }
      row.sortOrder = sortOrder;
    }

    rows.push(row);
  }

  return { rows, errors };
}

export function buildProductCsv(products: Product[]): string {
  return toCsv([
    [...CSV_COLUMNS],
    ...products.map((product) => [
      product.sku,
      product.name,
      centsToDollarString(product.priceCents),
      product.category ?? "",
      product.description ?? "",
      product.isActive ? "yes" : "no",
      product.sortOrder,
    ]),
  ]);
}
