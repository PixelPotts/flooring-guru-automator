import React from 'react';

interface StepIndicatorProps {
  currentStep: 'client' | 'rooms' | 'items' | 'review';
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 'client', label: 'Client' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'items', label: 'Items' },
    { id: 'review', label: 'Review' }
  ];
  
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, i) => (
        <div 
          key={step.id}
          className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}
        >
          <div className={`
            relative w-8 h-8 rounded-full flex items-center justify-center font-medium
            transition-colors duration-200
            ${currentStep === step.id 
              ? 'bg-blue-600 text-white' 
              : currentIndex > i
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {i + 1}
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 transition-colors duration-200 ${
              currentIndex > i
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;