import { prisma } from "@/lib/prisma";
import ProductChart from "@/components/products-chart";
import { Package, AlertTriangle, TrendingUp, DollarSign, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalProducts, lowStockProducts, activeOrders, completedOrderItems] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { quantity: { lte: 5 } } }),
    prisma.order.count({ where: { status: { not: "complete" } } }),
    prisma.orderItem.findMany({
      where: { order: { status: "complete" } },
      include: { product: true },
    }),
  ]);

  const totalProfit = completedOrderItems.reduce((acc, item) => {
    const costPrice = Number(item.product.costPrice);
    const sellingPrice = Number(item.price);
    return acc + (sellingPrice - costPrice) * item.quantity;
  }, 0);

  const totalRevenue = completedOrderItems.reduce((acc, item) => {
    return acc + Number(item.price) * item.quantity;
  }, 0);

  // Mock data for the chart
  const chartData = [
    { week: "Week 1", products: 10 },
    { week: "Week 2", products: 15 },
    { week: "Week 3", products: totalProducts },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold">{totalProducts}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <h3 className="text-2xl font-bold">{lowStockProducts}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Orders</p>
              <h3 className="text-2xl font-bold">{activeOrders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <h3 className="text-2xl font-bold">₦{totalProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold">₦{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Product Growth</h2>
        <ProductChart data={chartData} />
      </div>
    </div>
  );
}