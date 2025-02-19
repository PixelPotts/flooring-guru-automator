import React from 'react';
import { motion } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';

interface QuickTipProps {
  title: string;
  content: string;
  onClose: () => void;
}

const QuickTip: React.FC<QuickTipProps> = ({ title, content, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full"
      >
        <X className="h-4 w-4 text-blue-500" />
      </button>
      
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
          <Lightbulb className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            {title}
          </h3>
          <div className="text-blue-700 dark:text-blue-300 text-sm whitespace-pre-line">
            {content}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickTip;