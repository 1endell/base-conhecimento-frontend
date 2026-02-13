
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  StickyNote, 
  Tags, 
  Share2, 
  Search, 
  FileUp, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('kd_access_token');
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/notes', icon: StickyNote, label: 'Notes' },
    { to: '/tags', icon: Tags, label: 'Tags' },
    { to: '/graph', icon: Share2, label: 'Graph' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/import', icon: FileUp, label: 'Import' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 lg:relative`}
      >
        <div className="flex items-center justify-between p-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
            {isSidebarOpen && <span className="font-bold text-lg">K-Base</span>}
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="px-4 mb-4">
          <button 
            onClick={() => navigate('/notes/new')}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium ${!isSidebarOpen && 'px-0'}`}
          >
            <PlusCircle size={20} />
            {isSidebarOpen && <span>New Note</span>}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`
              }
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button 
            onClick={() => setDarkMode(!isDarkMode)}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors rounded-lg"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
