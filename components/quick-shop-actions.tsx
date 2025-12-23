"use client";

import { useState } from "react";
import { finalizeQuickShop } from "@/app/actions";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function QuickShopActions({ quickShopId, items }: { quickShopId: string, items: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [returns, setReturns] = useState<Record<string, number>>({});
  const router = useRouter();

  const handleFinalize = async () => {
    if (!confirm("This will close the shop, record sales, and return unsold items to inventory. Continue?")) return;
    
    const res = await finalizeQuickShop(quickShopId, returns);
    if (res.success) {
      router.push("/admin/quick-shops");
    } else {
      alert("Error: " + res.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        <CheckCircle2 className="w-4 h-4" /> Close & Settle
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Settle Quick Shop</h2>
            <div className="bg-yellow-50 p-4 rounded-lg mb-6 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Enter the quantity of items <strong>returned</strong> (unsold). 
                These will be added back to your main inventory. 
                Items not returned are considered <strong>sold</strong>.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">{item.product.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Taken: {item.quantity}</span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-gray-700">Returned:</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        className="border rounded w-20 p-1 text-center"
                        value={returns[item.productId] || 0}
                        onChange={(e) => setReturns({ ...returns, [item.productId]: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleFinalize} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">Confirm Sales</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}