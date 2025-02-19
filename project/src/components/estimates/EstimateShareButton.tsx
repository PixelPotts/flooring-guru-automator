import React, { useState } from 'react';
import { Share2, Copy, Check, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Estimate } from '../../types/estimate';
import { estimateSharingService } from '../../services/estimateSharing';

interface EstimateShareButtonProps {
  estimate: Estimate;
  onShareGenerated?: (shareUrl: string) => void;
}

const EstimateShareButton: React.FC<EstimateShareButtonProps> = ({
  estimate,
  onShareGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    // If we already have a share URL, just copy it
    if (estimate.shareUrl) {
      await copyToClipboard(estimate.shareUrl);
      return;
    }

    // Validate estimate
    if (!estimate.id) {
      setError('Please save the estimate first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const share = await estimateSharingService.generateShareUrl(estimate);
      
      if (!share?.url) {
        throw new Error('No share URL generated');
      }

      // Update parent component
      onShareGenerated?.(share.url);

      // Copy to clipboard
      await copyToClipboard(share.url);
    } catch (err) {
      console.error('Error generating share URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError('Failed to copy link to clipboard');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isGenerating ? (
          <Loader className="h-5 w-5 mr-2 animate-spin" />
        ) : showCopied ? (
          <Check className="h-5 w-5 mr-2" />
        ) : (
          <Share2 className="h-5 w-5 mr-2" />
        )}
        {estimate.shareUrl ? 'Copy Share Link' : 'Share Estimate'}
      </button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-64 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm rounded-lg flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {showCopied && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-48 p-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded-lg flex items-center"
          >
            <Check className="h-4 w-4 mr-2 flex-shrink-0" />
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EstimateShareButton;