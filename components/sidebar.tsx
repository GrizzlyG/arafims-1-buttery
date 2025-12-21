"use client";

import { BarChart3, Package, Plus, Settings, ShoppingCart, Store, Calculator, Tags, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleSignOut } from "@/app/actions";

type UserSession = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function Sidebar({ user }: { user: UserSession }) {
  const currentPath = usePathname();
  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Shop", href: "/shop", icon: Store },
    { name: "Inventory", href: "/admin/inventory", icon: Package },
    { name: "Add Product", href: "/admin/add-product", icon: Plus },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Calculator", href: "/admin/calculator", icon: Calculator },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];
  return (
    <div className="fixed left-0 top-0 bg-gray-900 text-white w-64 min-h-screen p-6 z-10 print:hidden">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-7 h-7" />
          <span className="text-lg font-semibold">Arafims One Buttery</span>
        </div>
      </div>

      <nav className="space-y-1">
        <div className="text-sm font-semibold text-gray-400 uppercase">
          Iventory
        </div>
        {navigation.map((item, key) => {
          const IconComponent = item.icon;
          const isActive = currentPath === item.href;
          return (
            <Link
              href={item.href}
              key={key}
              className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${
                isActive
                  ? "bg-purple-100 text-gray-800"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 borter-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.image ? <img src={user.image} alt="User" className="w-8 h-8 rounded-full" /> : <User className="w-4 h-4" />}
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate max-w-[100px]">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => handleSignOut()} className="text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
