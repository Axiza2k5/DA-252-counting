import { useNavigate } from "react-router";
import { ArrowLeft, Clock, Zap, Globe } from "lucide-react";
import { useHistory } from "../contexts/HistoryContext";
import { format } from "date-fns";

export function HistoryScreen() {
  const navigate = useNavigate();
  const { history } = useHistory();

  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">History</h1>
      </div>

      {/* History List */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <Clock className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No history yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Start counting fish to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {history.map((entry) => (
              <div
                key={entry.id}
                onClick={() =>
                  navigate("/results", {
                    state: {
                      imageUrl: entry.imageUrl,
                      fishCount: entry.fishCount,
                      modelType: entry.modelType,
                    },
                  })
                }
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={entry.imageUrl}
                        alt={`Counting session with ${entry.fishCount} fish`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {entry.fishCount} {entry.fishCount === 1 ? "Fish" : "Fish"}
                        </h3>
                        <div className="flex-shrink-0 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 text-xs font-medium">
                          {entry.modelType === "local" ? (
                            <>
                              <Zap className="w-3 h-3" />
                              <span>Local</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3" />
                              <span>Online</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(entry.timestamp)}</span>
                        <span className="text-gray-300">•</span>
                        <span>{formatTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      {history.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
          >
            Start New Count
          </button>
        </div>
      )}
    </div>
  );
}