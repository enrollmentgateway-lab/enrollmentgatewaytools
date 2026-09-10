import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { AdminNav } from "@/components/admin/AdminNav";
import { CsvUpdate } from "@/components/admin/CsvUpdate";
import { ProductTable } from "@/components/admin/ProductTable";
import { CSV_COLUMNS } from "@/lib/products-csv";
import { listProducts } from "@/lib/products";

// Reads the database on every request, so it must not be prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata = { title: "Merchandise Admin — Gateway Seminary" };

export default async function AdminDashboardPage() {
  const products = await listProducts();
  const activeCount = products.filter((product) => product.isActive).length;

  return (
    <>
      <BrandHeader
        eyebrow="Merchandise Admin"
        title="Catalog"
        subtitle={`${products.length} products, ${activeCount} shown on the order form and in the catalog PDF.`}
        actions={<AdminNav />}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="rule-rust font-heading text-2xl text-brand-black">Products</h2>
          <div className="flex flex-wrap items-center gap-3">
            <CsvUpdate columns={[...CSV_COLUMNS]} />
            <Link
              href="/admin/products/new"
              className="rounded-brand bg-brand-gold px-4 py-2.5 font-subheading text-xs font-semibold uppercase tracking-[0.14em] text-brand-black transition-colors hover:bg-brand-black hover:text-brand-white"
            >
              Add product
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <ProductTable products={products} />
        </div>
      </main>
    </>
  );
}
