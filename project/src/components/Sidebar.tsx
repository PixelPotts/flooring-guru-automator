import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, navItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <span className={`text-xl font-bold text-blue-600 dark:text-blue-400 ${!isOpen && 'hidden'}`}>
          FloorCRM
        </span>
        {!isOpen && <span className="text-xl font-bold text-blue-600 dark:text-blue-400">F</span>}
      </div>

      <nav className="mt-4">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
              location.pathname === item.path ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            <span className="inline-flex items-center justify-center h-6 w-6">
              {item.icon}
            </span>
            {isOpen && <span className="ml-3">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;