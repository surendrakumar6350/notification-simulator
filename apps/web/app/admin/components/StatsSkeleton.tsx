
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-gray-800 rounded-xl p-5 border border-gray-700 animate-pulse"
        >
          {/* Top row: Icon + Right Badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg" />
            <div className="w-6 h-4 bg-gray-700 rounded-full" />
          </div>

          {/* Stat Number */}
          <div className="h-7 w-20 bg-gray-700 rounded-md mb-2" />

          {/* Stat Label */}
          <div className="h-3 w-24 bg-gray-700 rounded-md" />
        </div>
      ))}
    </div>
  );
}
