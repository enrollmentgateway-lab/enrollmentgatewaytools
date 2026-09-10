import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

const products = [
  {
    sku: "GS-TEE-NAVY",
    name: "Gateway Logo T-Shirt",
    priceCents: 1800,
    category: "Apparel",
    description:
      "Soft-washed cotton tee with the Gateway Seminary horizontal wordmark printed across the chest. Unisex sizing, available S through 2XL.",
    sortOrder: 0,
  },
  {
    sku: "GS-HOOD-BLK",
    name: "Embroidered Hoodie",
    priceCents: 4800,
    category: "Apparel",
    description:
      "Heavyweight fleece pullover with an embroidered logomark on the left chest. Runs true to size.",
    sortOrder: 1,
  },
  {
    sku: "GS-MUG-16",
    name: "16 oz Ceramic Mug",
    priceCents: 1400,
    category: "Drinkware",
    description: "Stoneware mug with a matte exterior. Dishwasher and microwave safe.",
    sortOrder: 2,
  },
  {
    sku: "GS-TUMB-20",
    name: "20 oz Insulated Tumbler",
    priceCents: 2600,
    category: "Drinkware",
    description:
      "Double-wall vacuum-insulated stainless steel tumbler with a press-fit lid. Keeps drinks hot for six hours.",
    sortOrder: 3,
  },
  {
    sku: "GS-NOTE-A5",
    name: "Hardcover Notebook",
    priceCents: 1200,
    category: "Office",
    description: "A5 hardcover notebook, 160 ruled pages, with a debossed logomark on the cover.",
    sortOrder: 4,
  },
  {
    sku: "GS-PEN-GOLD",
    name: "Brass Rollerball Pen",
    priceCents: 900,
    category: "Office",
    description: "Weighted brass barrel with a black rollerball refill.",
    sortOrder: 5,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
