export default function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-700"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
      </div>
      <p className="mt-4 text-sm text-gray-400">{text}</p>
    </div>
  );
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-gray-700 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}
