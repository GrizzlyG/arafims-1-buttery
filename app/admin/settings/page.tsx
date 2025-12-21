import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <p className="text-gray-700"><strong>Name:</strong> {session?.user?.name || "Not set"}</p>
        <p className="text-gray-700"><strong>Email:</strong> {session?.user?.email}</p>
      </div>
    </div>
  );
}
