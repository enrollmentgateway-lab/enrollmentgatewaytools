import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  sku: z.string().trim().min(1, "SKU is required").max(64),
  priceCents: z.number().int().min(0, "Price cannot be negative"),
  category: z.string().trim().max(100).nullish(),
  description: z.string().trim().max(2000).nullish(),
  imagePath: z.string().trim().max(500).nullish(),
  isActive: z.boolean().optional(),
});

export const productUpdateSchema = productSchema.partial();

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const orderSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(200),
  customerEmail: z.string().trim().email("Enter a valid email address").max(200),
  customerPhone: z.string().trim().max(50).optional().or(z.literal("")),
  organization: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(9999),
      }),
    )
    .min(1, "Add at least one item to your order"),
});

export const catalogSendSchema = z.object({
  to: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type OrderPayload = z.infer<typeof orderSchema>;
export type ProductPayload = z.infer<typeof productSchema>;
