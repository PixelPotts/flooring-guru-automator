import React, { useRef, useState } from 'react';
import { Camera, X, Loader, Upload, Image as ImageIcon } from 'lucide-react';
import { analyzeImage } from '../../services/imageAnalysis';

interface CameraCaptureProps {
  onCapture: (imageData: string, description?: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState<'camera' | 'upload'>('upload');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setMode('camera');
      }
    } catch (err) {
      console.log('Camera not available, defaulting to upload mode');
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        try {
          const description = await analyzeImage(imageData);
          onCapture(imageData, description);
        } catch (error) {
          console.error('Error analyzing image:', error);
          onCapture(imageData);
        }
        setIsAnalyzing(false);
        onClose();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsAnalyzing(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0);

    // Convert to JPEG with quality 0.8
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    setIsAnalyzing(true);
    try {
      const description = await analyzeImage(imageData);
      onCapture(imageData, description);
    } catch (error) {
      console.error('Error analyzing image:', error);
      onCapture(imageData);
    }
    setIsAnalyzing(false);
    stopCamera();
    onClose();
  };

  React.useEffect(() => {
    // Try to start camera but don't block if it fails
    startCamera().catch(() => setMode('upload'));
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Image
          </h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => startCamera()}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md ${
                mode === 'camera'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Camera className="h-5 w-5 mr-2" />
              Camera
            </button>
            <button
              onClick={() => {
                stopCamera();
                setMode('upload');
              }}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md ${
                mode === 'upload'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload
            </button>
          </div>

          {/* Camera View / Upload Area */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {mode === 'camera' && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </>
            )}
            
            {mode === 'upload' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                  Drag and drop an image here or click to browse
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Browse Files
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Analyzing image...</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {mode === 'camera' && isStreaming && (
            <button
              onClick={captureImage}
              disabled={!isStreaming || isAnalyzing}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              <Camera className="h-5 w-5 mr-2" />
              Capture Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;