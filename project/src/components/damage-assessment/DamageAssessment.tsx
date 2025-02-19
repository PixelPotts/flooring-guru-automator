import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, FileText, BarChart3, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DamageReport from './DamageReport';
import { analyzeImage } from '../../services/damageAnalysis';
import type { DamageAnalysis } from '../../types/damage';

const DamageAssessment: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DamageAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Use rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setShowCamera(true);
      setError(null);
    } catch (err) {
      setError('Failed to access camera. Please try file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleImageCapture = async (imageData: string) => {
    try {
      setImage(imageData);
      setIsAnalyzing(true);
      setError(null);
      stopCamera();

      try {
        const result = await analyzeImage(imageData);
        setAnalysis(result);
      } catch (err) {
        console.error('Error analyzing image:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze image');
      } finally {
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context && videoRef.current) {
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      handleImageCapture(imageData);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      handleImageCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Floor Damage Assessment
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload or capture photos of damaged flooring for AI-powered analysis
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-center"
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </motion.div>
      )}

      {showCamera ? (
        <div className="relative mb-8 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-[60vh] object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center space-x-4 bg-gradient-to-t from-black/50 to-transparent">
            <button
              onClick={capturePhoto}
              className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Camera className="h-6 w-6 text-gray-900" />
            </button>
            <button
              onClick={stopCamera}
              className="p-4 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      ) : !image && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center"
          >
            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-gray-600 dark:text-gray-400">Upload Photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </button>

          <button
            onClick={startCamera}
            className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center"
          >
            <Camera className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-gray-600 dark:text-gray-400">Take Photo</span>
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Analyzing floor damage...</p>
          </motion.div>
        ) : analysis && image ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Uploaded Image
                </h3>
                <img
                  src={image}
                  alt="Damaged floor"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Analysis Results
                </h3>
                <DamageReport analysis={analysis} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30"
              >
                <FileText className="h-5 w-5 mr-2" />
                Export Report
              </button>
              <button
                onClick={() => {
                  setImage(null);
                  setAnalysis(null);
                }}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Camera className="h-5 w-5 mr-2" />
                New Assessment
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default DamageAssessment;