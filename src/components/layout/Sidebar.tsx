import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  RefreshCw,
  MapPin,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import logo from "../../assets/logo oficial.png";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.setItem('sgbu_authenticated', 'false');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/usuarios', label: 'Usuarios', icon: Users },
    { to: '/libros', label: 'Libros y Tesis', icon: BookOpen },
    { to: '/prestamos', label: 'Préstamos', icon: RefreshCw },
    { to: '/ubicaciones', label: 'Ubicaciones', icon: MapPin },
    { to: '/reportes', label: 'Reportes', icon: BarChart3 },
    { to: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-primary text-white flex flex-col h-screen sticky top-0 shadow-lg select-none z-10">
      {/* Brand Header */}
      <div className="p-6 border-b border-primary-hover flex flex-col items-center justify-center gap-2 bg-primary-hover/50">
        <img
          src={logo}
          alt="Universidad Lux"
          className="h-16 w-auto object-contain drop-shadow-md"
          onError={(e) => {
            // Fallback inside standard image if image1.png fails
            (e.target as HTMLImageElement).src = 'https://placehold.co/150x50/0b3c70/ffffff?text=LUX';
          }}
        />
        <div className="text-center mt-1">
          <h1 className="font-heading font-bold text-xl tracking-wider text-white">SGBU</h1>
          <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Biblioteca Universitaria</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                ${isActive
                  ? 'bg-white/10 text-white border-l-4 border-white shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User profile and logout */}
      <div className="p-4 border-t border-primary-hover bg-primary-hover/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-heading font-semibold text-white shadow-inner">
            BL
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold truncate">Bibliotecaria Lux</h4>
            <p className="text-[10px] text-gray-400 font-medium truncate">Administrador</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200"
        >
          <LogOut size={14} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
