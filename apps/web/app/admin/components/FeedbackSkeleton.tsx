import { Search, MessageSquare } from "lucide-react";

export function FeedbackSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          User Feedback
        </h3>
        <span className="text-sm text-gray-400"></span>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
        <div className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg" />
      </div>

      {/* Loading Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          >
            {/* Header with stars + category */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-gray-600 rounded" /> {/* stars */}
                <div className="h-4 w-8 bg-gray-600 rounded" /> {/* rating */}
              </div>
              <div className="h-5 w-20 bg-gray-600 rounded-full" /> {/* category */}
            </div>

            {/* Message */}
            <div className="space-y-2 mb-2">
              <div className="h-3 w-full bg-gray-600 rounded" />
              <div className="h-3 w-4/5 bg-gray-600 rounded" />
            </div>

            {/* Date */}
            <div className="h-3 w-28 bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
