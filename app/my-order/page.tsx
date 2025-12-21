import { getOrderByToken } from "@/app/actions";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, Package, XCircle } from "lucide-react";

export default async function MyOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Link</h1>
          <p className="text-gray-600 mt-2">No access token provided.</p>
          <Link href="/shop" className="text-purple-600 mt-4 inline-block hover:underline">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const result = await getOrderByToken(token);

  if (!result.success || !result.order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">{result.message || "This link has expired or is invalid."}</p>
          <Link href="/shop" className="text-purple-600 mt-4 inline-block hover:underline">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const { order } = result;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Order Status</h1>
          <p className="opacity-90">ID: {order.id}</p>
        </div>
        
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {order.status === "cancelled" ? (
              <XCircle className="w-8 h-8 text-red-500" />
            ) : order.status === "complete" ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <Clock className="w-8 h-8 text-blue-500" />
            )}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Current Status</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{order.status === 'awaiting payment confirmation' ? 'Awaiting Payment' : order.status}</p>
            </div>
          </div>

          {order.status === 'cancelled' && order.cancellationReason && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <p className="font-bold mb-1">Reason for Cancellation:</p>
              <p>{order.cancellationReason}</p>
            </div>
          )}

          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" /> Order Items
          </h3>
          <ul className="space-y-3 mb-8">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-700">
                  <span className="font-bold">{item.quantity}x</span> {item.product.name}
                </span>
                <span className="font-medium">₦{Number(item.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-purple-600">₦{Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
