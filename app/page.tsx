import Link from "next/link";
import { Store, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Arafims One Buttery
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Premium inventory management and customer shopping experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Store className="w-5 h-5" />
            Visit Shop
          </Link>

          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center gap-2 bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <ShieldCheck className="w-5 h-5" />
            Admin Access
          </Link>
        </div>
      </div>
    </div>
  );
}