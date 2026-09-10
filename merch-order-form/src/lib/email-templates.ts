import { formatCents } from "@/lib/currency";

const BLACK = "#0c0f14";
const GOLD = "#d3a422";
const DARKGRAY = "#2c343a";
const RUST = "#c44329";

export type OrderEmailData = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  organization?: string | null;
  notes?: string | null;
  items: { productName: string; sku: string; unitPrice: number; quantity: number }[];
};

function itemRows(items: OrderEmailData["items"]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7e8;font:14px Arial,sans-serif;color:${DARKGRAY}">
            ${escapeHtml(item.productName)}<br>
            <span style="font-size:12px;color:#708aa2">${escapeHtml(item.sku)}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7e8;font:14px Arial,sans-serif;color:${DARKGRAY};text-align:center">
            ${item.quantity}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7e8;font:14px Arial,sans-serif;color:${DARKGRAY};text-align:right">
            ${formatCents(item.unitPrice * item.quantity)}
          </td>
        </tr>`,
    )
    .join("");
}

function shell(heading: string, intro: string, body: string): string {
  return `
<div style="background:#f4f5f6;padding:32px 16px">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7e8">
    <div style="background:${BLACK};padding:24px">
      <p style="margin:0;font:600 11px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${GOLD}">
        Gateway Seminary Merchandise
      </p>
      <h1 style="margin:12px 0 0;font:400 26px Georgia,serif;color:#ffffff">${escapeHtml(heading)}</h1>
      <div style="width:40px;height:3px;background:${GOLD};margin-top:12px"></div>
    </div>
    <div style="padding:24px">
      <p style="margin:0 0 20px;font:14px Arial,sans-serif;line-height:1.6;color:${DARKGRAY}">${intro}</p>
      ${body}
    </div>
  </div>
</div>`;
}

function orderTable(order: OrderEmailData): string {
  const total = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const details = [
    ["Name", order.customerName],
    ["Email", order.customerEmail],
    ["Phone", order.customerPhone],
    ["Organization", order.organization],
    ["Notes", order.notes],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return `
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr>
        <th style="padding:0 0 8px;border-bottom:2px solid ${RUST};font:600 11px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${DARKGRAY};text-align:left">Item</th>
        <th style="padding:0 0 8px;border-bottom:2px solid ${RUST};font:600 11px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${DARKGRAY};text-align:center">Qty</th>
        <th style="padding:0 0 8px;border-bottom:2px solid ${RUST};font:600 11px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${DARKGRAY};text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows(order.items)}</tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="padding:12px 0 0;font:600 13px Arial,sans-serif;color:${BLACK}">Order total</td>
        <td style="padding:12px 0 0;font:600 15px Arial,sans-serif;color:${BLACK};text-align:right">${formatCents(total)}</td>
      </tr>
    </tfoot>
  </table>

  <table style="width:100%;border-collapse:collapse;margin-top:28px">
    ${details
      .map(
        ([label, value]) => `
      <tr>
        <td style="padding:6px 12px 6px 0;font:600 11px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#708aa2;vertical-align:top;white-space:nowrap">${label}</td>
        <td style="padding:6px 0;font:14px Arial,sans-serif;color:${DARKGRAY}">${escapeHtml(value)}</td>
      </tr>`,
      )
      .join("")}
  </table>

  <p style="margin:24px 0 0;font:12px Arial,sans-serif;color:#708aa2">Order reference: ${escapeHtml(order.id)}</p>`;
}

export function staffOrderEmail(order: OrderEmailData): string {
  return shell(
    "New order received",
    `${escapeHtml(order.customerName)} submitted a merchandise order.`,
    orderTable(order),
  );
}

export function customerOrderEmail(order: OrderEmailData): string {
  return shell(
    "Thank you for your order",
    `We received your merchandise order and someone from our team will follow up to confirm availability, totals, and delivery.`,
    orderTable(order),
  );
}

export function catalogEmail(message: string): string {
  const body = message
    ? `<p style="margin:0;font:14px Arial,sans-serif;line-height:1.6;color:${DARKGRAY};white-space:pre-line">${escapeHtml(message)}</p>`
    : "";
  return shell(
    "Merchandise catalog",
    "Our current merchandise catalog is attached as a PDF.",
    body,
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
