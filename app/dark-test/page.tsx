export default function DarkTest() {
  return (
    <div className="min-h-screen p-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Dark Mode Test</h1>

        <div className="p-4 bg-white dark:bg-gray-800 border">
          <p className="text-black dark:text-white">This should be: BLACK text on WHITE bg in light mode, WHITE text on DARK bg in dark mode</p>
        </div>

        <div className="p-4 bg-blue-500 dark:bg-blue-900">
          <p className="text-white">Blue background (light blue-500 → dark blue-900)</p>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-700">
          <p className="text-gray-900 dark:text-gray-100">Gray background test</p>
        </div>
      </div>
    </div>
  );
}
