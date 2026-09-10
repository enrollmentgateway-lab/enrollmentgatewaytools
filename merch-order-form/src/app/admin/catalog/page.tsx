import { BrandHeader } from "@/components/BrandHeader";
import { AdminNav } from "@/components/admin/AdminNav";
import { CatalogActions } from "@/components/admin/CatalogActions";
import { isEmailConfigured } from "@/lib/mailer";
import { listProducts } from "@/lib/products";

// Reads the database on every request, so it must not be prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata = { title: "Catalog PDF — Merchandise Admin" };

export default async function CatalogPage() {
  const products = await listProducts({ activeOnly: true });

  return (
    <>
      <BrandHeader
        eyebrow="Merchandise Admin"
        title="Catalog PDF"
        subtitle={`The catalog includes the ${products.length} active product${
          products.length === 1 ? "" : "s"
        } in their current order. Hidden products are left out.`}
        actions={<AdminNav />}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <CatalogActions
          productCount={products.length}
          emailConfigured={isEmailConfigured()}
        />
      </main>
    </>
  );
}
