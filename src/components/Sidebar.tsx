import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  BarChart,
  Menu,
  Clock,
  X
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (!user) return null;

  const navItems = [
    {
      name: t('dashboard.title'),
      icon: <Home size={20} />,
      path: '/',
      visible: true
    },
    {
      name: t('dashboard.adminPortal'),
      icon: <BarChart size={20} />,
      path: '/admin',
      visible: user.role === 'admin'
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-blue-500 text-white"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Sidebar for mobile */}
      <div 
        className={`lg:hidden fixed inset-0 z-20 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="bg-white dark:bg-gray-800 h-full w-64 shadow-lg">
          <SidebarContent 
            user={user} 
            navItems={navItems} 
            location={location} 
            onItemClick={() => setIsMobileMenuOpen(false)} 
          />
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-10 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Sidebar for desktop */}
      <div className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <SidebarContent 
          user={user} 
          navItems={navItems} 
          location={location} 
        />
      </div>
    </>
  );
};

// Extracted sidebar content to avoid duplication
const SidebarContent = ({ user, navItems, location, onItemClick }) => {
  const { t } = useTranslation();
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-blue-500" />
          <div className="ml-3">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Task Tracker</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.title')}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-4">
          <ul className="space-y-1">
            {navItems.filter(item => item.visible).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={onItemClick}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center">
          {user.avatarUrl === 'SAFAD' ? (
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              SA
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user.avatarUrl}
            </div>
          )}
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.role === 'admin' ? t('dashboard.adminPortal') : user.department ? `${user.department.charAt(0).toUpperCase() + user.department.slice(1)} ${t('common.department')}` : t('common.employee')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;