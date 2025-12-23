"use client";

import { useState } from "react";

export default function EditProductModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    name: product.name,
    price: product.price,
    costPrice: product.costPrice,
    quantity: product.quantity,
    categoryId: product.categoryId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await onSave(form);
    if (!res.success) setError(res.message || "Failed to update product");
    setLoading(false);
    if (res.success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold mb-2">Edit Product</h2>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded-lg p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white">
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cost Price</label>
            <input name="costPrice" type="number" step="0.01" value={form.costPrice} onChange={handleChange} required className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required className="w-full border rounded-lg p-2" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
