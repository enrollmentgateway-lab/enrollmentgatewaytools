"use client";

import Image from "next/image";
import { formatCents } from "@/lib/currency";
import type { Product } from "@/generated/prisma/client";

type Props = {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

export function ProductCard({ product, quantity, onQuantityChange }: Props) {
  const isSelected = quantity > 0;

  return (
    <article
      className={`flex flex-col rounded-brand border transition-colors ${
        isSelected ? "border-brand-teal" : "border-brand-darkgray/20"
      }`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-t-brand bg-brand-darkgray/5">
        {product.imagePath ? (
          <Image
            src={product.imagePath}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-brand-darkgray/40">
            No image
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-xl leading-snug text-brand-black">{product.name}</h3>
        <p className="mt-1 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-brand-grayblue">
          {product.sku}
        </p>

        {product.description ? (
          <p className="mt-3 font-body text-sm leading-relaxed text-brand-darkgray/80">
            {product.description}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-brand-darkgray/15 pt-4">
          <span className="font-body text-base font-semibold text-brand-black">
            {formatCents(product.priceCents)}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity === 0}
              aria-label={`Decrease quantity of ${product.name}`}
              className="h-8 w-8 rounded-brand border border-brand-darkgray/25 font-body text-brand-darkgray transition-colors hover:border-brand-teal hover:text-brand-teal disabled:opacity-30"
            >
              −
            </button>
            <input
              type="number"
              min="0"
              max="9999"
              value={quantity === 0 ? "" : quantity}
              placeholder="0"
              onChange={(event) => onQuantityChange(Number(event.target.value) || 0)}
              aria-label={`Quantity of ${product.name}`}
              className="h-8 w-14 rounded-brand border border-brand-darkgray/25 text-center font-body text-sm text-brand-black outline-none focus:border-brand-teal"
            />
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              aria-label={`Increase quantity of ${product.name}`}
              className="h-8 w-8 rounded-brand border border-brand-darkgray/25 font-body text-brand-darkgray transition-colors hover:border-brand-teal hover:text-brand-teal"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
