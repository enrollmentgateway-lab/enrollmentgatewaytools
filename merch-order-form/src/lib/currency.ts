export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function dollarsToCents(dollars: string | number): number {
  const value = typeof dollars === "number" ? dollars : Number.parseFloat(dollars);
  return Math.round(value * 100);
}

export function centsToDollarString(cents: number): string {
  return (cents / 100).toFixed(2);
}
