import { useLocation, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";

interface LocationState {
  imageUrl: string;
  fishCount: number;
  modelType: "local" | "online";
}

export function ResultsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasValidState, setHasValidState] = useState(false);
  
  const state = location.state as LocationState;

  console.log("ResultsScreen rendered");
  console.log("location:", location);
  console.log("location.state:", location.state);
  console.log("state:", state);

  // Check if we have valid state
  useEffect(() => {
    console.log("Checking state validity...");
    if (state && state.imageUrl && state.fishCount !== undefined) {
      console.log("State is valid!");
      setHasValidState(true);
    } else {
      console.log("State is invalid, will redirect");
      const timer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!hasValidState || !state?.imageUrl || !canvasRef.current) {
      console.log("Canvas effect - not ready", { hasValidState, imageUrl: state?.imageUrl, canvas: !!canvasRef.current });
      return;
    }

    console.log("Drawing on canvas...");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      console.log("Image loaded, drawing...");
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Draw random bounding boxes for demonstration
      const fishCount = state.fishCount || 0;
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#3b82f6";

      for (let i = 0; i < fishCount; i++) {
        const x = Math.random() * (img.width - 100);
        const y = Math.random() * (img.height - 100);
        const width = 60 + Math.random() * 80;
        const height = 40 + Math.random() * 60;

        // Draw bounding box
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        const label = `Fish ${i + 1}`;
        const textMetrics = ctx.measureText(label);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(x, y - 24, textMetrics.width + 12, 24);

        // Draw label text
        ctx.fillStyle = "white";
        ctx.fillText(label, x + 6, y - 6);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image");
    };
    img.src = state.imageUrl;
  }, [hasValidState, state]);

  // Show loading while checking state
  if (!hasValidState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-2">Loading...</p>
        <p className="text-gray-400 text-sm">Checking data...</p>
        <p className="text-gray-300 text-xs mt-4">Has state: {state ? 'yes' : 'no'}</p>
        <p className="text-gray-300 text-xs">Has imageUrl: {state?.imageUrl ? 'yes' : 'no'}</p>
        <p className="text-gray-300 text-xs">Fish count: {state?.fishCount ?? 'undefined'}</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-semibold text-gray-900">Results</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-6 overflow-y-auto">
        {/* Fish Count Display */}
        <div className="w-full max-w-md mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-center shadow-lg">
            <p className="text-white/90 text-sm font-medium mb-2">Total Fish Detected</p>
            <p className="text-6xl font-bold text-white mb-2">{state?.fishCount ?? 0}</p>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mt-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">
                {state?.modelType === "local" ? "Local Model" : "Online Model"}
              </span>
            </div>
          </div>
        </div>

        {/* Processed Image with Bounding Boxes */}
        <div className="w-full max-w-md mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Detected Fish</p>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3 pb-6">
          <Button
            onClick={() => navigate("/")}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
          >
            Count New Image
          </Button>
          <Button
            onClick={() => navigate("/history")}
            variant="outline"
            className="w-full h-12"
          >
            View History
          </Button>
        </div>
      </div>
    </div>
  );
}