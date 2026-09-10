import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { customerOrderEmail, staffOrderEmail, type OrderEmailData } from "@/lib/email-templates";
import { trySendMail } from "@/lib/mailer";
import { orderSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { items, ...customer } = parsed.data;

  // Prices and names are snapshotted from the database, never from the client.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) }, isActive: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const orderItems = items.flatMap((item) => {
    const product = byId.get(item.productId);
    if (!product) return [];
    return [
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.priceCents,
        quantity: item.quantity,
      },
    ];
  });

  if (orderItems.length === 0) {
    return NextResponse.json(
      { error: "None of the selected items are still available." },
      { status: 400 },
    );
  }

  const order = await prisma.order.create({
    data: {
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      customerPhone: customer.customerPhone || null,
      organization: customer.organization || null,
      notes: customer.notes || null,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  const emailData: OrderEmailData = { ...order };
  const staffRecipient = process.env.STAFF_NOTIFICATION_EMAIL;

  await Promise.all([
    staffRecipient
      ? trySendMail({
          to: staffRecipient,
          subject: `New merchandise order — ${order.customerName}`,
          html: staffOrderEmail(emailData),
        })
      : Promise.resolve(false),
    trySendMail({
      to: order.customerEmail,
      subject: "We received your merchandise order",
      html: customerOrderEmail(emailData),
    }),
  ]);

  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
