"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { cookies } from "next/headers";

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
    return { success: false, message: "Failed to fetch order" };
  }
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Unauthorized" };

  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const costPrice = formData.get("costPrice") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const categoryId = formData.get("categoryId") as string;

  try {
    await prisma.product.create({
      data: {
        name,
        price,
        costPrice,
        quantity,
        categoryId: categoryId || null,
        userId: session.user.id || "unknown",
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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