export function InventoryCardSkeleton() {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
        <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
        <div className="p-6 space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }
  
  export function ItemCardSkeleton() {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }