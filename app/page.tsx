import LoginButton from "@/components/auth/LoginButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-lg text-gray-600">Manage your inventory with custom fields and access control</p>
        </div>

        <div className="flex justify-center py-8">
          <LoginButton />
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">✅ Phase 3: Authentication</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Better-auth configured</li>
            <li>✅ Google OAuth ready</li>
            <li>✅ Session management</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
