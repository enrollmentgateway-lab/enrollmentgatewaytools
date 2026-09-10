import { BrandHeader } from "@/components/BrandHeader";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add product — Merchandise Admin" };

export default function NewProductPage() {
  return (
    <>
      <BrandHeader eyebrow="Merchandise Admin" title="Add product" actions={<AdminNav />} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <ProductForm />
      </main>
    </>
  );
}
