
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { cookies } from "next/headers";
import { z } from "zod";

type UpdateProductInput = {
  name: string;
  price: number;
  costPrice: number;
  quantity: number;
  categoryId: string;
};

export async function updateProduct(id: string, data: UpdateProductInput): Promise<{ success: boolean; message?: string }> {
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

const ADJECTIVES = ["bubble", "shiny", "happy", "noisy", "calm", "swift", "brave", "gentle", "cosmic", "dusty"];
const COLORS = ["cobalt", "red", "blue", "green", "yellow", "purple", "orange", "silver", "azure", "crimson"];

function generateOrderId() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const num = Math.floor(Math.random() * 900) + 100; // 100-999
  return `${adj}_${color}_${num}`;
}

export async function createOrder(cartItems: { productId: string; quantity: number }[]) {
  if (cartItems.length === 0) {
    return { success: false, message: "Cart is empty" };
  }

  try {
    // 1. Fetch products to get current prices and validate
    const productIds = cartItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const price = Number(product.price);
      totalAmount += price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const orderId = generateOrderId();
    // Generate a simple random token
    const accessToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await prisma.order.create({
      data: {
        id: orderId,
        totalAmount: totalAmount,
        accessToken,
        tokenExpiresAt,
        items: {
          create: orderItemsData,
        },
      },
    });

    const cookieStore = await cookies();
    const existingTokens = cookieStore.get("orderTokens")?.value || "";
    const newTokens = existingTokens ? `${existingTokens},${accessToken}` : accessToken;
    cookieStore.set("orderTokens", newTokens, { expires: tokenExpiresAt });

    revalidatePath("/admin/orders");
    return { success: true, orderId, accessToken };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, message: "Failed to create order" };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Order not found");

      // If transitioning TO complete (and wasn't already), decrement stock
      if (newStatus === "complete" && order.status !== "complete") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }

      await tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order:", error);
    return { success: false, message: "Failed to update order" };
  }
}

export async function getOrderByToken(token: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { accessToken: token },
      include: { items: { include: { product: true } } },
    });

    if (!order) return { success: false, message: "Order not found" };

    if (order.tokenExpiresAt && order.tokenExpiresAt < new Date()) {
      return { success: false, message: "Access token expired" };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Failed to get order by token:", error);
    return { success: false, message: "Failed to fetch order" };
  }
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const name = formData.get("name") as string;
  const price = formData.get("price");
  const costPrice = formData.get("costPrice");
  const quantity = formData.get("quantity");
  const categoryId = formData.get("categoryId") as string;
  const userId = session.user.id;

  const ProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().positive("Selling price must be positive"),
    costPrice: z.coerce.number().nonnegative("Cost price must be non-negative"),
    quantity: z.coerce.number().int().nonnegative("Quantity must be a whole number"),
  });

  const parsed = ProductSchema.safeParse({ name, price, costPrice, quantity });

  if (!parsed.success) {
    return { success: false, message: "Validation failed. Please check your inputs." };
  }

  try {
    await prisma.product.create({
      data: {
        ...parsed.data,
        categoryId: categoryId || null,
        userId,
      },
    });
    revalidatePath("/admin/inventory");
    revalidatePath("/shop");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to create product" };
  }
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/inventory");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, message: "Failed to delete product" };
  }
}

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  const name = formData.get("name") as string;
  try {
    await prisma.category.create({ data: { name } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/add-product");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, message: "Failed to create category" };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/add-product");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, message: "Failed to delete category" };
  }
}

export async function deleteOrder(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e) {
    console.error("Failed to delete order:", e);
    return { success: false, message: "Failed to delete order" };
  }
}

export async function cancelOrder(orderId: string, reason: string) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Only return stock if the order was not already completed or cancelled
      if (order.status !== "complete" && order.status !== "cancelled") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      // Update the order status and add cancellation reason
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "cancelled",
          cancellationReason: reason,
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath("/my-orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return { success: false, message: "Failed to cancel order" };
  }
}

export async function handleSignOut() {
  await signOut();
}

export async function createQuickShop(name: string, items: { productId: string; quantity: number }[]) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      const quickShop = await tx.quickShop.create({
        data: { name },
      });

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.quickShopItem.create({
          data: {
            quickShopId: quickShop.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
            costPrice: product.costPrice,
          },
        });
      }
    });

    revalidatePath("/admin/quick-shops");
    return { success: true };
  } catch (error) {
    console.error("Failed to create quick shop:", error);
    return { success: false, message: "Failed to create quick shop" };
  }
}

export async function finalizeQuickShop(quickShopId: string, returnedItems: Record<string, number>) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      const quickShop = await tx.quickShop.findUnique({
        where: { id: quickShopId },
        include: { items: true },
      });

      if (!quickShop) throw new Error("Quick shop not found");

      const orderItemsData = [];
      let totalAmount = 0;

      for (const item of quickShop.items) {
        const returnedQty = returnedItems[item.productId] || 0;
        const soldQty = item.quantity - returnedQty;

        // Return stock
        if (returnedQty > 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: returnedQty } },
          });
        }

        // Record sale
        if (soldQty > 0) {
          totalAmount += Number(item.price) * soldQty;
          orderItemsData.push({
            productId: item.productId,
            quantity: soldQty,
            price: item.price,
          });
        }
      }

      // Create order for sold items
      if (orderItemsData.length > 0) {
        const orderId = generateOrderId();
        await tx.order.create({
          data: {
            id: orderId,
            status: "complete", // Automatically complete
            totalAmount: totalAmount,
            items: { create: orderItemsData },
          },
        });
      }

      // Calculate final sales and profit
      const finalSales = totalAmount;
      const profit = quickShop.items.reduce((sum, item) => {
        const returnedQty = returnedItems[item.productId] || 0;
        const soldQty = item.quantity - returnedQty;
        return sum + (Number(item.price) - Number(item.costPrice)) * soldQty;
      }, 0);

      await tx.quickShop.update({
        where: { id: quickShopId },
        data: {
          closedAt: new Date(),
          finalSales,
          profit,
          status: "closed",
        },
      });
    });

    revalidatePath("/admin/quick-shops");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to finalize quick shop:", error);
    return { success: false, message: "Failed to finalize quick shop" };
  }
}