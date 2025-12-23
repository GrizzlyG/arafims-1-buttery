import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import QuickShopActions from "@/components/quick-shop-actions";

export const dynamic = "force-dynamic";

export default async function QuickShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quickShop = await prisma.quickShop.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!quickShop) notFound();

  const totalCost = quickShop.items.reduce((sum, item) => sum + Number(item.costPrice) * item.quantity, 0);
  const totalRevenue = quickShop.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const totalProfit = totalRevenue - totalCost;

  const formattedItems = quickShop.items.map((item) => ({
    ...item,
    price: Number(item.price),
    costPrice: Number(item.costPrice),
    product: {
      ...item.product,
      price: Number(item.product.price),
      costPrice: Number(item.product.costPrice),
    },
  }));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{quickShop.name}</h1>
          <p className="text-gray-500">Created on {quickShop.createdAt.toLocaleDateString()}</p>
        </div>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 print-btn"
          >
            <Printer className="w-4 h-4" /> Print Manifest
          </button>
          <QuickShopActions quickShopId={quickShop.id} items={formattedItems} />
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-0">
        <div className="text-center mb-8 hidden print:block">
          <h1 className="text-4xl font-bold mb-2">{quickShop.name}</h1>
          <p className="text-gray-600">Inventory Manifest</p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="py-3 font-semibold text-gray-700">Item</th>
              <th className="py-3 font-semibold text-gray-700 text-right">Price</th>
              <th className="py-3 font-semibold text-gray-700 text-center">Qty</th>
              <th className="py-3 font-semibold text-gray-700 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {quickShop.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3">{item.product.name}</td>
                <td className="py-3 text-right">₦{Number(item.price).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right font-medium">₦{(Number(item.price) * item.quantity).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td colSpan={3} className="py-4 text-right font-bold text-lg">Total Revenue Potential:</td>
              <td className="py-4 text-right font-bold text-lg">₦{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            </tr>
          </tfoot>
        </table>

        {/* Admin Only Info - Hidden on Print */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 print:hidden">
          <h3 className="font-bold text-gray-900 mb-2">Admin Insights</h3>
          <div className="flex gap-8">
            <div>
              <span className="text-sm text-gray-500 block">Total Price</span>
              <span className="font-mono font-medium">₦{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Projected Profit</span>
              <span className="font-mono font-bold text-green-600">₦{totalProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print Trigger Script */}
      <script dangerouslySetInnerHTML={{__html: `
        document.querySelector('.print-btn').onclick = () => window.print();
      `}} />
    </div>
  );
}
