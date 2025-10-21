import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, actionLabel, actionHref, icon }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
      {icon && <div className="mb-6 flex justify-center text-gray-400 dark:text-gray-600">{icon}</div>}

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>

      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{description}</p>

      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
