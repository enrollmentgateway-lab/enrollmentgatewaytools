/** Prisma P2002 = unique constraint violation (here, a duplicate SKU). */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002"
  );
}

/** Prisma P2025 = record not found. */
export function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && (error as { code?: string }).code === "P2025"
  );
}
