"use client";

import { useState } from "react";
import { Trash2, Printer } from "lucide-react";
import { deleteProduct } from "@/app/actions";

type ProductWithProfit = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  costPrice: number;
  totalProfit: number;
  totalSales: number;
  categoryName: string;
};

export default function InventoryList({ products }: { products: ProductWithProfit[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedProducts = products.filter((p) => selectedIds.has(p.id));
  const groupedProducts = selectedProducts.reduce((acc, product) => {
    const category = product.categoryName;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, ProductWithProfit[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="text-sm text-gray-500">
          {selectedIds.size} selected
        </div>
        <button
          onClick={handlePrint}
          disabled={selectedIds.size === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" /> Print Selected
        </button>
      </div>

      {/* Screen Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden print:hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Profit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className={selectedIds.has(product.id) ? "bg-purple-50" : ""}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-gray-900">₦{product.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    product.quantity <= 5 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}>
                    {product.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">
                  ₦{product.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">
                  ₦{product.totalProfit.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={async () => {
                        if(confirm('Are you sure you want to delete this product?')) {
                            await deleteProduct(product.id);
                        }
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print Table (Hidden on screen, visible on print) */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold mb-4">Inventory List</h1>
        {Object.entries(groupedProducts).map(([category, items]) => (
          <div key={category} className="mb-8 break-inside-avoid">
            <h2 className="text-xl font-bold mb-2 text-gray-800 border-b pb-1">{category}</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Name</th>
                  <th className="border border-gray-300 p-2 text-right">Selling Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => (
                  <tr key={product.id}>
                    <td className="border border-gray-300 p-2">{product.name}</td>
                    <td className="border border-gray-300 p-2 text-right">₦{product.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
