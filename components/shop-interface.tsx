"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { createOrder } from "@/app/actions";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({ weight: "400", subsets: ["latin"] });

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId?: string;
  categoryName?: string;
};

type Category = {
  id: string;
  name: string;
};

export default function ShopInterface({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; orderId?: string; accessToken?: string } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return item;
          if (newQuantity > item.product.quantity) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);

    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      
      const result = await createOrder(items);
      if (result.success) {
        setCart([]);
        setOrderResult({ success: true, orderId: result.orderId, accessToken: result.accessToken });
      } else {
        alert("Checkout failed");
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderResult?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">
            Your order ID is <br />
            <span className="text-purple-600 font-mono font-bold text-xl block mt-2">
              {orderResult.orderId}
            </span>
          </p>
          {orderResult.accessToken && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800">
              <p className="mb-2 font-semibold">Track your order (Valid for 1 hour):</p>
              <Link href={`/my-order?token=${orderResult.accessToken}`} className="text-purple-600 underline break-all">
                Click here to view status
              </Link>
            </div>
          )}
          <button
            onClick={() => setOrderResult(null)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur shadow-none sticky top-0 z-10 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/shop">
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight text-purple-700 ${pacifico.className}`}>Arafims <span className="text-purple-400">1</span> shop</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/my-orders" className="text-xs sm:text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors">My Orders</Link>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors shadow-sm"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6 text-purple-600" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex flex-col gap-8 relative">
        {/* Filter (responsive) */}
        <div className="w-full mb-6">
          <div className="bg-white/80 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h4 className="font-semibold text-gray-700 mb-1 sm:mb-0 text-sm">Category</h4>
            <select
              className="flex-1 border border-gray-200 rounded-lg p-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products
            .filter((product) => !selectedCategory || product.categoryId === selectedCategory)
            .map((product) => {
              const cartItem = cart.find((item) => item.product.id === product.id);
              const currentQty = cartItem ? cartItem.quantity : 0;
              const isMaxed = currentQty >= product.quantity;

              return (
                <div
                  key={product.id}
                  className="bg-white/90 border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow min-h-[180px]"
                >
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-gray-400 text-xs mb-2">Available: {product.quantity}</p>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-purple-700">₦{product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.quantity <= 0 || isMaxed}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium text-xs sm:text-sm shadow hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {isMaxed ? "Max Limit" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Cart Sidebar as Overlay */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-xs sm:max-w-sm bg-white shadow-2xl rounded-2xl p-6 h-[90vh] flex flex-col relative animate-fade-in">
              <button
                onClick={() => setIsCartOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold mb-6 text-center">Your Cart</h2>
              <div className="flex-1 overflow-y-auto space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-gray-500 mb-2">₦{item.product.price.toFixed(2)}</div>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 w-fit">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-white rounded-md shadow-sm transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 hover:bg-white rounded-md shadow-sm transition-colors disabled:opacity-50"
                          disabled={item.quantity >= item.product.quantity}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="font-medium">₦{(item.product.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && <p className="text-gray-500 text-center py-4">Cart is empty</p>}
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
                  <strong>Note:</strong> After placing your order, we will check availability of items in your cart. <br />
                  <span className="block mt-1">Do <strong>not</strong> make payment until your order status changes to <span className="font-bold">&quot;awaiting payment confirmation&quot;</span>.</span>
                </div>
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Total</span>
                  <span>₦{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isCheckingOut}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}