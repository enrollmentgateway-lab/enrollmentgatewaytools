"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatCents } from "@/lib/currency";
import type { Product } from "@/generated/prisma/client";

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;

    const orderedIds = products.map((product) => product.id);
    [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];

    const response = await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });

    if (!response.ok) {
      setError("Could not save the new order.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete that product.");
      return;
    }
    startTransition(() => router.refresh());
  }

  if (products.length === 0) {
    return (
      <div className="rounded-brand border border-brand-darkgray/20 px-6 py-16 text-center">
        <p className="font-heading text-xl text-brand-black">No products yet</p>
        <p className="mt-2 font-body text-sm text-brand-darkgray/70">
          Add your first product to build the catalog.
        </p>
      </div>
    );
  }

  return (
    <div className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      {error ? (
        <p className="mb-4 rounded-brand border border-brand-rust px-3 py-2 font-body text-sm text-brand-rust">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-brand border border-brand-darkgray/20">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-brand-darkgray/20 bg-brand-darkgray/5">
              {["", "Product", "SKU", "Category", "Price", "Status", ""].map((heading, index) => (
                <th
                  key={index}
                  className="px-4 py-3 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-brand-darkgray"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id} className="border-b border-brand-darkgray/10 last:border-0">
                <td className="w-20 px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${product.name} up`}
                      className="rounded-brand border border-brand-darkgray/25 px-2 py-0.5 font-body text-xs text-brand-darkgray transition-colors hover:border-brand-teal hover:text-brand-teal disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === products.length - 1}
                      aria-label={`Move ${product.name} down`}
                      className="rounded-brand border border-brand-darkgray/25 px-2 py-0.5 font-body text-xs text-brand-darkgray transition-colors hover:border-brand-teal hover:text-brand-teal disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-none overflow-hidden rounded-brand border border-brand-darkgray/15 bg-brand-darkgray/5">
                      {product.imagePath ? (
                        <Image
                          src={product.imagePath}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-brand-black">
                        {product.name}
                      </p>
                      {product.description ? (
                        <p className="mt-0.5 max-w-sm truncate font-body text-xs text-brand-darkgray/70">
                          {product.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-body text-sm text-brand-darkgray">
                  {product.sku}
                </td>
                <td className="px-4 py-3 font-body text-sm text-brand-darkgray">
                  {product.category ?? "—"}
                </td>
                <td className="px-4 py-3 font-body text-sm font-semibold text-brand-black">
                  {formatCents(product.priceCents)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-brand border px-2 py-1 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] ${
                      product.isActive
                        ? "border-brand-teal text-brand-teal"
                        : "border-brand-grayblue text-brand-grayblue"
                    }`}
                  >
                    {product.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-brand border border-brand-darkgray/25 px-3 py-1.5 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-darkgray transition-colors hover:border-brand-teal hover:text-brand-teal"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(product)}
                      className="rounded-brand border border-brand-darkgray/25 px-3 py-1.5 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-darkgray transition-colors hover:border-brand-rust hover:text-brand-rust"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
