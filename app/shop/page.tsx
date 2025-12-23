import { prisma } from "@/lib/prisma";
import ShopInterface from "@/components/shop-interface";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { quantity: { gt: 0 } },
      orderBy: { name: "asc" },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    quantity: p.quantity,
    categoryId: p.categoryId ?? undefined,
    categoryName: p.category?.name || "Uncategorized",
  }));

  return <ShopInterface products={formattedProducts} categories={categories} />;
}
