import { signIn } from "@/auth";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function SignInPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Sign In</h1>
          <p className="text-gray-500 mt-2">Welcome back to your shop</p>
        </div>

        {searchParams?.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            <p>Invalid email or password. Please try again.</p>
          </div>
        )}

        <div className="space-y-4">
          <form
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", {
                  email: formData.get("email"),
                  password: formData.get("password"),
                  redirectTo: "/admin/dashboard",
                });
              } catch (error) {
                if (error instanceof AuthError) {
                  redirect(`/sign-in?error=${error.type}`);
                }
                throw error;
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" required className="w-full border rounded-lg p-2" suppressHydrationWarning />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" required className="w-full border rounded-lg p-2" suppressHydrationWarning />
            </div>
            <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-all font-medium" suppressHydrationWarning>
              Sign in with Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}