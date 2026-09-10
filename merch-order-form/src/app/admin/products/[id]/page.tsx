import { notFound } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProduct } from "@/lib/products";

export const metadata = { title: "Edit product — Merchandise Admin" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const product = await getProduct((await params).id);
  if (!product) {
    notFound();
  }

  return (
    <>
      <BrandHeader eyebrow="Merchandise Admin" title="Edit product" actions={<AdminNav />} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <ProductForm product={product} />
      </main>
    </>
  );
}
