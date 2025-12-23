"use client";

import { useState } from "react";
import { createQuickShop } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2 } from "lucide-react";

type Product = { id: string; name: string; quantity: number };

export default function CreateQuickShopForm({ products }: { products: Product[] }) {
  const [name, setName] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = (productId: string) => {
    if (selectedItems.find((i) => i.productId === productId)) return;
    setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
  };

  const updateQty = (productId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const product = products.find((p) => p.id === productId);
          const max = product?.quantity || 0;
          const newQty = Math.max(1, Math.min(item.quantity + delta, max));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleSubmit = async () => {
    if (!name || selectedItems.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await createQuickShop(name, selectedItems);
      if (res.success) router.push("/admin/quick-shops");
      else alert(res.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Create Quick Shop</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name / Event</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-2"
          placeholder="e.g. Weekend Pop-up"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow h-96 overflow-y-auto">
          <h2 className="font-semibold mb-4">Available Products</h2>
          {products.map((p) => (
            <div key={p.id} className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">Stock: {p.quantity}</p>
              </div>
              <button
                onClick={() => addItem(p.id)}
                disabled={p.quantity === 0}
                className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm hover:bg-purple-200 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow h-96 overflow-y-auto">
          <h2 className="font-semibold mb-4">Selected Items</h2>
          {selectedItems.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <div key={item.productId} className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">{product?.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.productId, -1)} className="p-1 bg-gray-100 rounded"><Minus className="w-3 h-3" /></button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, 1)} className="p-1 bg-gray-100 rounded"><Plus className="w-3 h-3" /></button>
                  <button onClick={() => removeItem(item.productId)} className="text-red-500 ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!name || selectedItems.length === 0 || isSubmitting}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Quick Shop"}
        </button>
      </div>
    </div>
  );
}