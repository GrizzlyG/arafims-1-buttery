import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export default async function MyOrdersPage() {
  const cookieStore = await cookies();
  const tokensString = cookieStore.get("orderTokens")?.value;
  const tokens = tokensString ? tokensString.split(",") : [];

  const orders = tokens.length > 0 ? await prisma.order.findMany({
    where: {
      accessToken: { in: tokens },
      tokenExpiresAt: { gt: new Date() },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Active Orders</h1>
            <Link href="/shop" className="text-purple-600 hover:underline">
                Back to Shop
            </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No active orders found.</p>
            <Link href="/shop" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <span className="text-sm text-gray-500">Order ID</span>
                        <p className="font-mono font-bold text-gray-900">{order.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {order.status === "cancelled" ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                        ) : order.status === "complete" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                            <Clock className="w-5 h-5 text-blue-500" />
                        )}
                        <span className="font-medium capitalize text-gray-700">{order.status === 'awaiting payment confirmation' ? 'Awaiting Payment' : order.status}</span>
                    </div>
                </div>
                <div className="p-6">
                    {order.status === 'cancelled' && order.cancellationReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                            <p><span className="font-bold">Reason for cancellation:</span> {order.cancellationReason}</p>
                        </div>
                    )}
                    <ul className="space-y-2 mb-4">
                        {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
                                <span className="font-medium">₦{Number(item.price).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-purple-600 text-lg">₦{Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="mt-4 text-right">
                         <Link href={`/my-order?token=${order.accessToken}`} className="text-sm text-purple-600 hover:underline">
                            View Details
                         </Link>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
