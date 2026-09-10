"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { centsToDollarString, dollarsToCents } from "@/lib/currency";
import type { Product } from "@/generated/prisma/client";

const labelClass =
  "font-subheading text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-darkgray";
const inputClass =
  "mt-2 w-full rounded-brand border border-brand-darkgray/25 bg-brand-white px-3 py-2 font-body text-sm text-brand-black outline-none focus:border-brand-teal";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [price, setPrice] = useState(
    product ? centsToDollarString(product.priceCents) : "",
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imagePath, setImagePath] = useState(product?.imagePath ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      setImagePath(data.path);
    } else {
      setError(data.error ?? "Upload failed.");
    }
    setUploading(false);
    event.target.value = "";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const payload = {
      name,
      sku,
      priceCents: dollarsToCents(price || "0"),
      category: category.trim() || null,
      description: description.trim() || null,
      imagePath: imagePath || null,
      isActive,
    };

    const response = await fetch(
      product ? `/api/admin/products/${product.id}` : "/api/admin/products",
      {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (response.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }

    const data = await response.json().catch(() => ({}));
    const fieldIssue = data.issues
      ? Object.values(data.issues as Record<string, string[]>)[0]?.[0]
      : null;
    setError(fieldIssue ?? data.error ?? "Could not save this product.");
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClass}>Product name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={200}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>SKU</span>
          <input
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            required
            maxLength={64}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Price (USD)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Category</span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            maxLength={100}
            placeholder="Apparel, Drinkware, Office…"
            className={inputClass}
          />
        </label>

        <div className="block">
          <span className={labelClass}>Visibility</span>
          <label className="mt-2 flex items-center gap-3 rounded-brand border border-brand-darkgray/25 px-3 py-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-[#234048]"
            />
            <span className="font-body text-sm text-brand-darkgray">
              Show on the order form and in the catalog
            </span>
          </label>
        </div>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            maxLength={2000}
            className={`${inputClass} resize-y`}
          />
        </label>
      </div>

      <div>
        <span className={labelClass}>Product image</span>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <div className="relative h-24 w-24 flex-none overflow-hidden rounded-brand border border-brand-darkgray/20 bg-brand-darkgray/5">
            {imagePath ? (
              <Image src={imagePath} alt="" fill sizes="96px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center font-body text-[0.625rem] uppercase tracking-widest text-brand-darkgray/50">
                None
              </span>
            )}
          </div>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={uploading}
              className="block font-body text-sm text-brand-darkgray file:mr-3 file:rounded-brand file:border file:border-brand-darkgray/25 file:bg-brand-white file:px-3 file:py-1.5 file:font-subheading file:text-[0.625rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-brand-darkgray"
            />
            <p className="font-body text-xs text-brand-darkgray/60">
              JPEG, PNG, or WebP up to 5 MB. Square images look best in the catalog.
            </p>
            {imagePath ? (
              <button
                type="button"
                onClick={() => setImagePath("")}
                className="font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-rust"
              >
                Remove image
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-brand border border-brand-rust px-3 py-2 font-body text-sm text-brand-rust">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-brand bg-brand-gold px-5 py-2.5 font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white disabled:opacity-60"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        <Link
          href="/admin"
          className="rounded-brand border border-brand-darkgray/25 px-5 py-2.5 font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-brand-darkgray transition-colors hover:border-brand-black hover:text-brand-black"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
