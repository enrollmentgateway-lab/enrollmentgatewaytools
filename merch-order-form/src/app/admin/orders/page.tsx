import { BrandHeader } from "@/components/BrandHeader";
import { AdminNav } from "@/components/admin/AdminNav";
import { formatCents } from "@/lib/currency";
import { prisma } from "@/lib/db";

// Reads the database on every request, so it must not be prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata = { title: "Orders — Merchandise Admin" };

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <>
      <BrandHeader
        eyebrow="Merchandise Admin"
        title="Orders"
        subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"} submitted through the order form.`}
        actions={<AdminNav />}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {orders.length === 0 ? (
          <div className="rounded-brand border border-brand-darkgray/20 px-6 py-16 text-center">
            <p className="font-heading text-xl text-brand-black">No orders yet</p>
            <p className="mt-2 font-body text-sm text-brand-darkgray/70">
              Submissions from the order form will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => {
              const total = order.items.reduce(
                (sum, item) => sum + item.unitPrice * item.quantity,
                0,
              );
              return (
                <li key={order.id} className="rounded-brand border border-brand-darkgray/20">
                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-brand-darkgray/15 px-6 py-4">
                    <div>
                      <h2 className="font-heading text-xl text-brand-black">
                        {order.customerName}
                      </h2>
                      <p className="mt-1 font-body text-sm text-brand-darkgray/70">
                        {order.customerEmail}
                        {order.organization ? ` · ${order.organization}` : ""}
                        {order.customerPhone ? ` · ${order.customerPhone}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body text-lg font-semibold text-brand-black">
                        {formatCents(total)}
                      </p>
                      <p className="mt-1 font-body text-xs text-brand-darkgray/60">
                        {order.createdAt.toLocaleString("en-US")}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr>
                          {["Item", "SKU", "Qty", "Unit", "Line total"].map((heading) => (
                            <th
                              key={heading}
                              className="pb-2 font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-darkgray"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-t border-brand-darkgray/10">
                            <td className="py-2 font-body text-sm text-brand-black">
                              {item.productName}
                            </td>
                            <td className="py-2 font-body text-sm text-brand-darkgray">
                              {item.sku}
                            </td>
                            <td className="py-2 font-body text-sm text-brand-darkgray">
                              {item.quantity}
                            </td>
                            <td className="py-2 font-body text-sm text-brand-darkgray">
                              {formatCents(item.unitPrice)}
                            </td>
                            <td className="py-2 font-body text-sm font-semibold text-brand-black">
                              {formatCents(item.unitPrice * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {order.notes ? (
                      <div className="mt-4 border-t border-brand-darkgray/10 pt-4">
                        <p className="font-subheading text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-brand-grayblue">
                          Notes
                        </p>
                        <p className="mt-2 whitespace-pre-line font-body text-sm text-brand-darkgray">
                          {order.notes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
