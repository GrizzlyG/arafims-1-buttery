import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QuickShopsPage() {
  const quickShops = await prisma.quickShop.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quick Shops</h1>
        <Link
          href="/admin/quick-shops/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Create Quick Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickShops.map((shop) => (
          <Link
            key={shop.id}
            href={`/admin/quick-shops/${shop.id}`}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow block"
          >
            <h2 className="text-xl font-bold mb-2">{shop.name}</h2>
            <p className="text-gray-500 text-sm mb-1">
              Created: {shop.createdAt.toLocaleDateString()}
            </p>
            {shop.closedAt && (
              <p className="text-gray-500 text-sm mb-1">Closed: {new Date(shop.closedAt).toLocaleDateString()}</p>
            )}
            <p className="text-gray-500 text-sm mb-1">Status: {shop.status}</p>
            {shop.finalSales !== null && (
              <p className="text-green-700 text-sm mb-1 font-bold">Final Sales: ₦{Number(shop.finalSales).toFixed(2)}</p>
            )}
            {shop.profit !== null && (
              <p className="text-blue-700 text-sm mb-4 font-bold">Profit: ₦{Number(shop.profit).toFixed(2)}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {shop._count.items} Items
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
        {quickShops.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-12">No active quick shops found.</p>
        )}
      </div>
    </div>
  );
}
