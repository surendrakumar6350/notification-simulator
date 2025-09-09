import { Search } from "lucide-react";
import { TbGitPullRequestDraft } from "react-icons/tb";

export function ProtectionRequestsSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white"><TbGitPullRequestDraft className="inline-block align-middle mr-1 mb-1" /> Protection Requests</h3>
        <span className="text-sm text-gray-400"></span>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
        <div className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg" />
      </div>

      {/* Loading Items */}
      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-gray-700 rounded-lg border border-gray-600"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-32 bg-gray-600 rounded" />
              <div className="h-5 w-14 bg-gray-600 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-28 bg-gray-600 rounded" />
              <div className="h-3 w-40 bg-gray-600 rounded" />
            </div>
            <div className="mt-2 h-3 w-20 bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
