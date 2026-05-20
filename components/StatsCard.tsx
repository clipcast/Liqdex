interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
}: StatsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {trend && trendValue && (
          <div
            className={`flex items-center px-2 py-1 rounded text-sm font-medium ${
              trend === "up"
                ? "bg-green-900/30 text-green-400"
                : trend === "down"
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}
