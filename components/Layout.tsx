
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  History, 
  LogOut, 
  PlusCircle 
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Panel', icon: LayoutDashboard },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/visitas', label: 'Visitas', icon: History },
    { path: '/agenda', label: 'Agenda', icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-full bg-slate-900 text-white p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">G</div>
          <h1 className="text-xl font-bold tracking-tight">GietCRM</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 p-3 text-slate-400 hover:text-red-400 mt-auto transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 safe-bottom flex justify-around items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname === item.path ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-semibold uppercase">{item.label}</span>
          </Link>
        ))}
        <button 
          onClick={onLogout}
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <LogOut size={22} />
          <span className="text-[10px] font-semibold uppercase">Salir</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
