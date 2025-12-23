
import { prisma } from "@/lib/prisma";
import CreateQuickShopForm from "./create-quick-shop-form";

export const dynamic = "force-dynamic";

export default async function NewQuickShopPage() {
  // Fetch all products with their id, name, and quantity
  const products = await prisma.product.findMany({
    select: { id: true, name: true, quantity: true },
    orderBy: { name: "asc" },
  });

  return (
    <CreateQuickShopForm products={products} />
  );
}