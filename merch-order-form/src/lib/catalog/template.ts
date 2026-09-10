import { readFile } from "node:fs/promises";
import path from "node:path";
import { formatCents } from "@/lib/currency";
import { escapeHtml } from "@/lib/email-templates";
import { groupByCategory } from "@/lib/products";
import type { Product } from "@/generated/prisma/client";

const BRAND = {
  black: "#0c0f14",
  white: "#ffffff",
  teal: "#234048",
  rust: "#c44329",
  gold: "#d3a422",
  grayblue: "#708aa2",
  darkgray: "#2c343a",
};

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

/** Reads a file under public/ and returns it as a data URI, or null when missing. */
async function dataUri(publicPath: string): Promise<string | null> {
  const relative = publicPath.replace(/^\//, "");
  const absolute = path.join(process.cwd(), "public", relative);
  const mime = MIME_BY_EXTENSION[path.extname(absolute).toLowerCase()];
  if (!mime) return null;
  try {
    const buffer = await readFile(absolute);
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function productCard(product: Product, image: string | null): string {
  return `
    <article class="card">
      <div class="card-image">
        ${
          image
            ? `<img src="${image}" alt="">`
            : `<span class="card-image-empty">Gateway Seminary</span>`
        }
      </div>
      <div class="card-body">
        <h3>${escapeHtml(product.name)}</h3>
        <p class="sku">${escapeHtml(product.sku)}</p>
        ${product.description ? `<p class="description">${escapeHtml(product.description)}</p>` : ""}
        <p class="price">${formatCents(product.priceCents)}</p>
      </div>
    </article>`;
}

export async function buildCatalogHtml(products: Product[]): Promise<string> {
  const [logo, tiemposRegular, tiemposSemibold, openSans, montserrat] = await Promise.all([
    dataUri("/brand/logo-horizontal-white.png"),
    dataUri("/brand/fonts/TiemposFine-Regular.woff2"),
    dataUri("/brand/fonts/TiemposFine-Semibold.woff2"),
    dataUri("/brand/fonts/OpenSans-Variable.woff2"),
    dataUri("/brand/fonts/Montserrat-Semibold.woff2"),
  ]);

  const fontFace = (family: string, uri: string | null, weight: string) =>
    uri ? `@font-face{font-family:"${family}";src:url("${uri}") format("woff2");font-weight:${weight};}` : "";

  const images = new Map<string, string | null>();
  await Promise.all(
    products.map(async (product) => {
      if (product.imagePath) {
        images.set(product.id, await dataUri(product.imagePath));
      }
    }),
  );

  const groups = groupByCategory(products);
  const printedOn = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const sections = groups
    .map(
      (group) => `
      <section class="group">
        <h2>${escapeHtml(group.category)}</h2>
        <div class="grid">
          ${group.products.map((product) => productCard(product, images.get(product.id) ?? null)).join("")}
        </div>
      </section>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Gateway Seminary Merchandise Catalog</title>
<style>
  ${fontFace("Tiempos Fine", tiemposRegular, "400")}
  ${fontFace("Tiempos Fine", tiemposSemibold, "600")}
  ${fontFace("Open Sans", openSans, "300 800")}
  ${fontFace("Montserrat", montserrat, "600")}

  @page { size: A4; margin: 14mm 14mm 16mm; }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: "Open Sans", Helvetica, Arial, sans-serif;
    color: ${BRAND.darkgray};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .cover {
    background: ${BRAND.black};
    color: ${BRAND.white};
    padding: 22mm 18mm;
    border-radius: 1mm;
    /* A dedicated title page: products then start with a full page of height,
       which keeps a card row from being pushed off a part-filled first page. */
    min-height: 246mm;
    display: flex;
    flex-direction: column;
    break-after: page;
    page-break-after: always;
  }
  .cover img { height: 13mm; width: auto; }
  .cover .title-block { margin-top: auto; }
  .cover .eyebrow {
    font-family: "Montserrat", Helvetica, Arial, sans-serif;
    margin: 0;
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${BRAND.gold};
  }
  .cover h1 {
    font-family: "Tiempos Fine", Georgia, serif;
    font-weight: 400;
    font-size: 34pt;
    line-height: 1.05;
    margin: 6mm 0 0;
  }
  .cover .rule { width: 18mm; height: 1mm; background: ${BRAND.gold}; margin-top: 6mm; }
  .cover .meta { margin: 8mm 0 0; font-size: 9pt; color: rgba(255,255,255,0.72); max-width: 105mm; line-height: 1.6; }

  .group { margin-bottom: 10mm; }
  .group h2 {
    font-family: "Tiempos Fine", Georgia, serif;
    font-weight: 400;
    font-size: 19pt;
    color: ${BRAND.black};
    margin: 0 0 2mm;
  }
  .group h2::after {
    content: "";
    display: block;
    width: 14mm;
    height: 0.8mm;
    background: ${BRAND.rust};
    margin-top: 2.5mm;
  }

  /* Inline-block rather than grid: Chromium fragments inline-block content
     across printed pages, whereas a grid container is pushed whole. */
  .grid { margin-top: 6mm; font-size: 0; }

  .card {
    display: inline-block;
    vertical-align: top;
    width: 48.4%;
    margin: 0 0 6mm;
    font-size: initial;
    border: 0.3mm solid rgba(44,52,58,0.25);
    border-radius: 1mm;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .card:nth-child(odd) { margin-right: 3%; }

  .card-image {
    height: 42mm;
    background: rgba(44,52,58,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .card-image img { width: 100%; height: 100%; object-fit: cover; }
  .card-image-empty {
    font-family: "Montserrat", Helvetica, Arial, sans-serif;
    font-size: 7pt;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(44,52,58,0.35);
  }

  .card-body { padding: 5mm; }
  .card-body h3 {
    font-family: "Tiempos Fine", Georgia, serif;
    font-weight: 400;
    font-size: 13pt;
    line-height: 1.2;
    color: ${BRAND.black};
    margin: 0;
  }
  .sku {
    font-family: "Montserrat", Helvetica, Arial, sans-serif;
    margin: 1.5mm 0 0;
    font-size: 7pt;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${BRAND.grayblue};
  }
  .description {
    margin: 3mm 0 0;
    font-size: 8.5pt;
    line-height: 1.5;
    color: rgba(44,52,58,0.85);
  }
  .price {
    margin: 4mm 0 0;
    padding-top: 3mm;
    border-top: 0.3mm solid rgba(44,52,58,0.18);
    font-size: 11pt;
    font-weight: 600;
    color: ${BRAND.black};
  }

  .footer {
    margin-top: 8mm;
    padding-top: 4mm;
    border-top: 0.3mm solid rgba(44,52,58,0.18);
    font-size: 7.5pt;
    color: ${BRAND.grayblue};
  }
</style>
</head>
<body>
  <div class="cover">
    ${logo ? `<img src="${logo}" alt="Gateway Seminary">` : ""}
    <div class="title-block">
      <p class="eyebrow">Merchandise</p>
      <h1>Catalog</h1>
      <div class="rule"></div>
      <p class="meta">Current pricing and availability as of ${escapeHtml(printedOn)}. To place an order, contact the Gateway Seminary merchandise team or use our online order form.</p>
    </div>
  </div>

  ${sections}

  <p class="footer">Gateway Seminary Merchandise Catalog · ${escapeHtml(printedOn)} · Prices subject to change.</p>
</body>
</html>`;
}

export async function generateCatalogPdf(products: Product[]): Promise<Buffer> {
  const puppeteer = (await import("puppeteer")).default;
  const html = await buildCatalogHtml(products);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    // Images and fonts are inlined as data URIs, so "load" is sufficient here.
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
