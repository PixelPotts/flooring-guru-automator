import React, { useState } from 'react';
import { Sun, Moon, Menu, MessageSquare, Bell, Search, Mic } from 'lucide-react';
import VoiceAssistant from './voice/VoiceAssistant';

interface NavbarProps {
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  toggleAIAssistant: () => void;
  showSidebarToggle?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  toggleSidebar,
  toggleDarkMode,
  isDarkMode,
  toggleAIAssistant,
  showSidebarToggle = true
}) => {
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showSidebarToggle && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            )}
            
            <div className="ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              title="Voice Assistant"
            >
              <Mic className="h-6 w-6 text-blue-500" />
              <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Voice Assistant
              </span>
            </button>

            <button
              onClick={toggleAIAssistant}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              title="AI Chat Assistant"
            >
              <MessageSquare className="h-6 w-6 text-blue-500" />
              <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat Assistant
              </span>
            </button>

            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              title="Notifications"
            >
              <Bell className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              )}
            </button>

            <button className="flex items-center space-x-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
            </button>
          </div>
        </div>
      </div>

      {isVoiceAssistantOpen && (
        <VoiceAssistant 
          isOpen={isVoiceAssistantOpen}
          onClose={() => setIsVoiceAssistantOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;