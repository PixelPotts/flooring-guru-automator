import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to FloorCRM",
    description: "Let's take a quick tour of your new flooring management platform.",
    highlight: "dashboard"
  },
  {
    title: "Create Estimates",
    description: "Quickly create professional estimates with our AI-powered suggestion system.",
    highlight: "estimates"
  },
  {
    title: "Manage Clients",
    description: "Keep track of all your clients and their projects in one place.",
    highlight: "clients"
  },
  {
    title: "Track Projects",
    description: "Monitor project progress, schedule tasks, and manage timelines efficiently.",
    highlight: "projects"
  },
  {
    title: "AI Assistant",
    description: "Get intelligent suggestions for materials, labor, and pricing with our AI assistant.",
    highlight: "ai-assistant"
  }
];

const TutorialPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('hasSeenTutorial') === 'true';
  });

  useEffect(() => {
    // Show tutorial after a short delay for first-time users
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
        >
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg">
            <div
              className="h-full bg-blue-600 rounded-t-lg transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tutorialSteps[currentStep].title}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {tutorialSteps[currentStep].description}
            </p>

            {tutorialSteps[currentStep].image && (
              <img
                src={tutorialSteps[currentStep].image}
                alt={tutorialSteps[currentStep].title}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
            )}

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {Array.from({ length: tutorialSteps.length }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    'Get Started'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TutorialPopup;