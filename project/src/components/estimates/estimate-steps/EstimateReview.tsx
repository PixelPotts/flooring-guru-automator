import React from 'react';
import { Loader } from 'lucide-react';

interface EstimateReviewProps {
  estimate: any;
  onBack: () => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const EstimateReview: React.FC<EstimateReviewProps> = ({
  estimate,
  onBack,
  isSubmitting,
  onSubmit
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Client</h4>
          <p className="text-gray-600 dark:text-gray-400">{estimate.clientName}</p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Total</h4>
          <p className="text-gray-600 dark:text-gray-400">
            ${estimate.total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
        {estimate.items.map((item: any) => (
          <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {item.description}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.quantity} × ${item.unitPrice.toFixed(2)}
                </p>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                ${item.total.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>${estimate.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Tax (8%)</span>
            <span>${estimate.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>${estimate.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            'Create Estimate'
          )}
        </button>
      </div>
    </div>
  );
};

export default EstimateReview;