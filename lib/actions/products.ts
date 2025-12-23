import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function updateProduct(id: string, data: any) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  const ProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().positive("Selling price must be positive"),
    costPrice: z.coerce.number().nonnegative("Cost price must be non-negative"),
    quantity: z.coerce.number().int().nonnegative("Quantity must be a whole number"),
    categoryId: z.string().optional().nullable(),
  });

  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: "Validation failed. Please check your inputs." };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        categoryId: parsed.data.categoryId || null,
      },
    });
    revalidatePath("/admin/inventory");
    revalidatePath("/shop");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to update product" };
  }
}
