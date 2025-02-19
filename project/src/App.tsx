import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Calculator, Users, Calendar, PieChart, Package2, FileText, Settings, ScanLine, DollarSign } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ClientProvider } from './context/ClientContext';
import { EstimateProvider } from './context/EstimateContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import MobileMenu from './components/MobileMenu';
import TutorialPopup from './components/tutorial/TutorialPopup';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import PrivateRoute from './components/auth/PrivateRoute';
import GHLCallback from './components/integrations/GHLCallback';
import IntegrationsManager from './components/settings/IntegrationsManager';
import ErrorBoundary from './components/ErrorBoundary';
import EstimateView from './pages/EstimateView';

// Import components directly instead of using lazy loading for critical components
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import Estimates from './pages/Estimates';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Analytics from './components/Analytics';
import Inventory from './components/inventory/Inventory';
import Invoices from './components/invoices/Invoices';
import MarketingAnalytics from './components/marketing/MarketingAnalytics';
import DamageAssessment from './components/damage-assessment/DamageAssessment';
import Payments from './pages/Payments';

const navItems = [
  { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
  { icon: <Calculator size={20} />, label: 'Estimates', path: '/estimates' },
  { icon: <DollarSign size={20} />, label: 'Payments', path: '/payments' },
  { icon: <FileText size={20} />, label: 'Invoices', path: '/invoices' },
  { icon: <Users size={20} />, label: 'Clients', path: '/clients' },
  { icon: <Calendar size={20} />, label: 'Projects', path: '/projects' },
  { icon: <Package2 size={20} />, label: 'Inventory', path: '/inventory' },
  { icon: <PieChart size={20} />, label: 'Marketing', path: '/marketing' },
  { icon: <ScanLine size={20} />, label: 'Damage Assessment', path: '/damage-assessment' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/settings' }
];

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ClientProvider>
          <EstimateProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/llc/callback" element={<GHLCallback />} />
              <Route path="/estimates/share/:token" element={<EstimateView />} />
              <Route path="/*" element={
                <PrivateRoute>
                  <AppLayout navItems={navItems} />
                </PrivateRoute>
              } />
            </Routes>
          </EstimateProvider>
        </ClientProvider>
      </Router>
    </ErrorBoundary>
  );
};

interface AppLayoutProps {
  navItems: typeof navItems;
}

const AppLayout: React.FC<AppLayoutProps> = ({ navItems }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {!isMobile && (
          <Sidebar isOpen={isSidebarOpen} navItems={navItems} />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            toggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
            toggleAIAssistant={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
            showSidebarToggle={!isMobile}
          />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 pb-20">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/estimates/*" element={<Estimates />} />
                <Route path="/payments/*" element={<Payments />} />
                <Route path="/invoices/*" element={<Invoices />} />
                <Route path="/clients/*" element={<Clients />} />
                <Route path="/projects/*" element={<Projects />} />
                <Route path="/inventory/*" element={<Inventory />} />
                <Route path="/marketing/*" element={<MarketingAnalytics />} />
                <Route path="/damage-assessment/*" element={<DamageAssessment />} />
                <Route path="/settings/*" element={<IntegrationsManager />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

          {isAIAssistantOpen && (
            <AIAssistant 
              isOpen={isAIAssistantOpen} 
              onClose={() => setIsAIAssistantOpen(false)} 
            />
          )}

          {isMobile && <MobileMenu navItems={navItems} />}
        </div>
      </div>
      <TutorialPopup />
    </div>
  );
};

export default App;