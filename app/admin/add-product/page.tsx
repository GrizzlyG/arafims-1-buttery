import { createProduct } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AddProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  async function action(formData: FormData) {
    "use server";
    const result = await createProduct(formData);
    if (result.success) {
      redirect("/admin/inventory");
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form action={action} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input name="name" required className="w-full border rounded-lg p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select name="categoryId" className="w-full border rounded-lg p-2 bg-white">
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
            <input name="costPrice" type="number" step="0.01" required className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
            <input name="price" type="number" step="0.01" required className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input name="quantity" type="number" required className="w-full border rounded-lg p-2" />
          </div>
        </div>
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
          Create Product
        </button>
      </form>
    </div>
  );
}
