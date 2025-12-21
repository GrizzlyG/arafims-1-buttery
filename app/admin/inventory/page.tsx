import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import InventoryList from "@/components/inventory-list";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: { order: true },
      },
      category: true,
    },
  });

  const formattedProducts = products.map((product) => {
    const totalProfit = product.orderItems.reduce((acc, item) => {
      if (item.order.status === "complete") {
        return acc + (Number(item.price) - Number(product.costPrice)) * item.quantity;
      }
      return acc;
    }, 0);

    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: product.quantity,
      costPrice: Number(product.costPrice),
      totalProfit: totalProfit,
      categoryName: product.category?.name || "Uncategorized",
    };
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link
          href="/admin/add-product"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <InventoryList products={formattedProducts} />
    </div>
  );
}
