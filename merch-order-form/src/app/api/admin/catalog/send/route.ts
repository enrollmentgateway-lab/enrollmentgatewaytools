import { NextResponse } from "next/server";
import { generateCatalogPdf } from "@/lib/catalog/template";
import { catalogEmail } from "@/lib/email-templates";
import { isEmailConfigured, sendMail } from "@/lib/mailer";
import { listProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/require-admin";
import { catalogSendSchema } from "@/lib/validation";

export const maxDuration = 60;

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured. Set SMTP_HOST and related variables." },
      { status: 400 },
    );
  }

  const parsed = catalogSendSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const products = await listProducts({ activeOnly: true });
  if (products.length === 0) {
    return NextResponse.json(
      { error: "Add at least one active product before sending a catalog." },
      { status: 400 },
    );
  }

  const pdf = await generateCatalogPdf(products);

  try {
    await sendMail({
      to: parsed.data.to,
      subject: parsed.data.subject || "Gateway Seminary merchandise catalog",
      html: catalogEmail(parsed.data.message ?? ""),
      attachments: [
        {
          filename: `gateway-merchandise-catalog-${new Date().toISOString().slice(0, 10)}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error) {
    console.error("Catalog send failed:", error);
    return NextResponse.json(
      { error: "The catalog could not be sent. Check the SMTP settings." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
