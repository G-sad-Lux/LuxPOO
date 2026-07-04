import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  QrCode, 
  UserPlus, 
  Database, 
  BarChart3, 
  Calendar, 
  ArrowRight,
  BookMarked
} from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryStore';

// Helper component for KPI Cards
const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgIcon: string;
}> = ({ title, value, subtext, icon: Icon, color, bgIcon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <h3 className="font-heading font-extrabold text-3xl text-gray-800">{value}</h3>
      <p className="text-xs text-gray-400 font-medium">{subtext}</p>
    </div>
    <div className={`p-4 rounded-2xl ${bgIcon}`}>
      <Icon size={24} className={color} />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { users, books, loans, activities } = useLibrary();
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scannedBooks, setScannedBooks] = useState<any[]>([]);
  const [hasScanned, setHasScanned] = useState(false);

  // Dynamic counts based on our mock store
  const activeLoansCount = loans.filter(l => l.status === 'in_progress').length;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  // Actual counts directly from our Supabase store
  const totalBooks = books.length;
  const totalUsers = users.length;
  const loansDisplay = activeLoansCount;
  const overdueDisplay = overdueCount;

  // Handle Mock QR scanning
  const handleQRScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = qrCodeInput.toUpperCase().trim();
    if (!code) return;

    // Filter books by location code
    const found = books.filter(b => b.locationCode === code);
    setScannedBooks(found);
    setHasScanned(true);
  };

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  // Get upcoming return books (e.g. status in_progress and due soon)
  const upcomingReturns = loans
    .filter(l => l.status === 'in_progress')
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Page Header */}
      <div>
        <h2 className="font-heading font-bold text-3xl text-gray-800">Panel de Control</h2>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenido al Sistema de Gestión de Biblioteca Universitaria de Universidad Lux.
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total de Libros" 
          value={totalBooks.toLocaleString()} 
          subtext="Títulos físicos y tesis catalogadas" 
          icon={BookOpen}
          color="text-primary"
          bgIcon="bg-primary/10"
        />
        <KPICard 
          title="Préstamos Activos" 
          value={loansDisplay} 
          subtext="Material fuera de sala de lectura" 
          icon={RefreshCw}
          color="text-secondary"
          bgIcon="bg-secondary/10"
        />
        <KPICard 
          title="Libros Vencidos" 
          value={overdueDisplay} 
          subtext="Préstamos con retraso acumulado" 
          icon={AlertTriangle}
          color="text-red-600"
          bgIcon="bg-red-50"
        />
        <KPICard 
          title="Usuarios Registrados" 
          value={totalUsers.toLocaleString()} 
          subtext="Alumnos y docentes con acceso" 
          icon={Users}
          color="text-emerald-600"
          bgIcon="bg-emerald-50"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Table and Actions) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Access Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-heading font-bold text-lg text-gray-800 mb-4">Accesos Rápidos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => handleQuickAction('/usuarios/nuevo')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl border border-gray-100 hover:border-primary transition-all duration-200 group text-center cursor-pointer"
              >
                <div className="p-3 bg-white group-hover:bg-white/10 rounded-xl mb-3 shadow-sm transition-colors text-primary group-hover:text-white">
                  <UserPlus size={20} />
                </div>
                <span className="text-xs font-semibold">Nuevo Usuario</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('/libros')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl border border-gray-100 hover:border-primary transition-all duration-200 group text-center cursor-pointer"
              >
                <div className="p-3 bg-white group-hover:bg-white/10 rounded-xl mb-3 shadow-sm transition-colors text-primary group-hover:text-white">
                  <BookMarked size={20} />
                </div>
                <span className="text-xs font-semibold">Nuevo Libro</span>
              </button>

              <button 
                onClick={() => handleQuickAction('/prestamos')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl border border-gray-100 hover:border-primary transition-all duration-200 group text-center cursor-pointer"
              >
                <div className="p-3 bg-white group-hover:bg-white/10 rounded-xl mb-3 shadow-sm transition-colors text-primary group-hover:text-white">
                  <RefreshCw size={20} />
                </div>
                <span className="text-xs font-semibold">Nuevo Préstamo</span>
              </button>

              <button 
                onClick={() => setShowQRModal(true)}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl border border-gray-100 hover:border-primary transition-all duration-200 group text-center cursor-pointer"
              >
                <div className="p-3 bg-white group-hover:bg-white/10 rounded-xl mb-3 shadow-sm transition-colors text-primary group-hover:text-white">
                  <QrCode size={20} />
                </div>
                <span className="text-xs font-semibold">Escanear QR</span>
              </button>

              <button 
                onClick={() => handleQuickAction('/ubicaciones')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl border border-gray-100 hover:border-primary transition-all duration-200 group text-center cursor-pointer"
              >
                <div className="p-3 bg-white group-hover:bg-white/10 rounded-xl mb-3 shadow-sm transition-colors text-primary group-hover:text-white">
                  <Database size={20} />
                </div>
                <span className="text-xs font-semibold">Inventario</span>
              </button>

              <button 
                onClick={() => handleQuickAction('/reportes')}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl border border-gray-100 hover:border-primary transition-all duration-200 group text-center cursor-pointer"
              >
                <div className="p-3 bg-white group-hover:bg-white/10 rounded-xl mb-3 shadow-sm transition-colors text-primary group-hover:text-white">
                  <BarChart3 size={20} />
                </div>
                <span className="text-xs font-semibold">Reportes</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-heading font-bold text-lg text-gray-800">Actividad Reciente</h3>
              <button 
                onClick={() => handleQuickAction('/reportes')}
                className="text-xs font-bold text-secondary hover:text-secondary-hover flex items-center gap-1 group cursor-pointer"
              >
                <span>Ver todos</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Libro / Tesis</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {activities.slice(0, 5).map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div>
                          <p>{activity.userName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{activity.userMatricula}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 italic font-medium max-w-[200px] truncate">{activity.bookTitle}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(activity.date).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] uppercase
                          ${activity.type === 'loan' ? 'bg-amber-100 text-amber-800' : ''}
                          ${activity.type === 'return' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${activity.type === 'user_register' ? 'bg-blue-100 text-blue-800' : ''}
                          ${activity.type === 'book_register' ? 'bg-purple-100 text-purple-800' : ''}
                        `}>
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Upcoming returns sidebar calendar) */}
        <div className="space-y-8">
          
          {/* Upcoming Returns Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Calendar className="text-secondary" size={20} />
              <h3 className="font-heading font-bold text-lg text-gray-800">Próximas Devoluciones</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              {upcomingReturns.length === 0 ? (
                <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center gap-2">
                  <BookOpen size={32} className="stroke-[1.5]" />
                  <p className="text-xs">No hay devoluciones programadas en curso.</p>
                </div>
              ) : (
                upcomingReturns.map((loan) => {
                  const today = new Date();
                  const dueDate = new Date(loan.dueDate);
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={loan.id} 
                      className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-2 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-[10px] text-gray-400 uppercase">PRÉSTAMO {loan.id}</span>
                        <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] uppercase
                          ${diffDays <= 2 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-secondary/10 text-secondary'}
                        `}>
                          {diffDays <= 0 ? 'Vence hoy' : `En ${diffDays} días`}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-gray-800 line-clamp-1 italic">
                        {loan.bookTitle}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <div>
                          <p className="font-medium text-gray-700">{loan.userName}</p>
                          <p className="text-[10px]">{loan.userCarrera}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-700">{loan.dueDate}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-medium">Límite</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <button
              onClick={() => handleQuickAction('/prestamos')}
              className="w-full mt-6 py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-xl text-xs font-bold text-gray-700 transition-all duration-200 text-center cursor-pointer border border-gray-200/50"
            >
              Gestionar Préstamos
            </button>
          </div>
        </div>

      </div>

      {/* Mock QR Scanner Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 text-left border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="text-primary" size={20} />
                <h3 className="font-heading font-bold text-lg text-gray-800">Simulador de Lector QR</h3>
              </div>
              <button 
                onClick={() => {
                  setShowQRModal(false);
                  setQrCodeInput('');
                  setScannedBooks([]);
                  setHasScanned(false);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Escanea físicamente el código QR del estante para ver qué libros se encuentran ahí. 
              Para la simulación, introduce el código de ubicación del estante (ejemplo: <span className="font-mono font-bold text-secondary">E1N1</span>, <span className="font-mono font-bold text-secondary">E1N2</span>, <span className="font-mono font-bold text-secondary">E2N1</span>, <span className="font-mono font-bold text-secondary">E3N1</span>).
            </p>

            <form onSubmit={handleQRScanSubmit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Código de ubicación (ej. E1N1)"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                maxLength={4}
                required
              />
              <button 
                type="submit" 
                className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
              >
                Escanear
              </button>
            </form>

            {hasScanned && (
              <div className="space-y-3 pt-2">
                <h4 className="font-heading font-bold text-xs text-gray-500 uppercase tracking-wider">
                  Resultados en la ubicación {qrCodeInput.toUpperCase()}:
                </h4>
                
                {scannedBooks.length === 0 ? (
                  <p className="text-xs text-red-500 font-medium">Ningún libro registrado en esta ubicación física.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {scannedBooks.map((book) => (
                      <div key={book.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-semibold text-gray-800 truncate italic">{book.title}</p>
                          <p className="text-[10px] text-gray-400">{book.author} | {book.licenciatura}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase
                          ${book.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                        `}>
                          {book.status === 'available' ? 'Disponible' : 'Prestado'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
