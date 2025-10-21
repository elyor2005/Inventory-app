import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-16">
        <div className="text-center px-4">
          {/* 404 Illustration */}
          <div className="mb-8">
            <svg className="mx-auto h-64 w-64 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Text */}
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Go Home
            </Link>
            <Link href="/explore" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Explore Inventories
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
