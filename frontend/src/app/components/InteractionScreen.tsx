import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Camera, Upload, History } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useHistory } from "../contexts/HistoryContext";

export function InteractionScreen() {
  const navigate = useNavigate();
  const { addHistoryEntry } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modelType, setModelType] = useState<"local" | "online">("local");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Simulate camera capture with a placeholder image
    setSelectedImage(
      "https://images.unsplash.com/photo-1605768816557-ceee9f8b127f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXNoJTIwdW5kZXJ3YXRlciUyMHNjaG9vbHxlbnwxfHx8fDE3NzI5NTk0NjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
    );
  };

  const handleStartCounting = () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const fishCount = Math.floor(Math.random() * 30) + 5; // Random count between 5-35
      
      addHistoryEntry({
        imageUrl: selectedImage,
        fishCount,
        modelType,
      });

      setIsProcessing(false);
      navigate("/results", { 
        state: { 
          imageUrl: selectedImage, 
          fishCount, 
          modelType 
        } 
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Fish Fry Counting</h1>
        <button
          onClick={() => navigate("/history")}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="View History"
        >
          <History className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Image Preview */}
        <div className="w-full max-w-md mb-8">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected fish"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">No image selected</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Capture or upload an image
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleCameraCapture}
              variant="outline"
              className="h-14 flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span>Capture</span>
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-14 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Model Selection */}
        <div className="w-full max-w-md mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="model-toggle" className="text-base font-medium">
                  {modelType === "local" ? "Local Model" : "Online Model"}
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  {modelType === "local"
                    ? "Fast, offline processing"
                    : "Higher accuracy, requires internet"}
                </p>
              </div>
              <Switch
                id="model-toggle"
                checked={modelType === "online"}
                onCheckedChange={(checked) =>
                  setModelType(checked ? "online" : "local")
                }
              />
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="w-full max-w-md">
          <Button
            onClick={handleStartCounting}
            disabled={!selectedImage || isProcessing}
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isProcessing ? "Processing..." : "Start Counting"}
          </Button>
        </div>
      </div>
    </div>
  );
}