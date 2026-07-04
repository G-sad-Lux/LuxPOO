import React, { useState } from 'react';
import { Download, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryStore';

export const Reports: React.FC = () => {
  const { loans } = useLibrary();
  const [activeTab, setActiveTab] = useState<'todos' | 'activos' | 'vencidos'>('todos');
  const [showExportModal, setShowExportModal] = useState<string | null>(null);

  // Tabs filtering
  const filteredLoans = loans.filter((loan) => {
    if (activeTab === 'activos') return loan.status === 'in_progress';
    if (activeTab === 'vencidos') return loan.status === 'overdue';
    return true; // 'todos'
  });

  const triggerExport = (format: 'PDF' | 'Excel') => {
    setShowExportModal(format);
    setTimeout(() => setShowExportModal(null), 3000);
  };

  // Dynamic analytical data derived from Supabase loans
  const facultyCounts: Record<string, number> = {};
  loans.forEach(loan => {
    const key = loan.userCarrera || 'Otros';
    facultyCounts[key] = (facultyCounts[key] || 0) + 1;
  });
  
  const totalLoansCount = loans.length || 1;
  const facultyUsage = Object.entries(facultyCounts).map(([faculty, count]) => {
    const percentage = Math.round((count / totalLoansCount) * 100);
    return {
      faculty,
      percentage,
      color: faculty.includes('Sistemas') ? 'bg-primary' : faculty.includes('Administración') ? 'bg-secondary' : 'bg-indigo-500'
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const bookCounts: Record<string, number> = {};
  loans.forEach(loan => {
    bookCounts[loan.bookTitle] = (bookCounts[loan.bookTitle] || 0) + 1;
  });
  const topBooks = Object.entries(bookCounts)
    .map(([title, requests]) => ({
      title,
      requests,
      color: '#0B3C70'
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 4);

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthlyCounts: Record<string, number> = {};
  loans.forEach(loan => {
    const date = new Date(loan.loanDate);
    if (!isNaN(date.getTime())) {
      const monthLabel = monthNames[date.getMonth()];
      monthlyCounts[monthLabel] = (monthlyCounts[monthLabel] || 0) + 1;
    }
  });

  const last6Months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthLabel = monthNames[d.getMonth()];
    last6Months.push({
      month: monthLabel,
      count: monthlyCounts[monthLabel] || 0
    });
  }
  const monthlyLoans = monthlyLoansCountCheck(monthlyCounts, last6Months);

  function monthlyLoansCountCheck(counts: Record<string, number>, defaultMonths: any[]) {
    if (Object.keys(counts).length === 0) {
      return defaultMonths;
    }
    return defaultMonths;
  }

  const userCounts: Record<string, { name: string; count: number }> = {};
  loans.forEach(loan => {
    if (!userCounts[loan.userMatricula]) {
      userCounts[loan.userMatricula] = { name: loan.userName, count: 0 };
    }
    userCounts[loan.userMatricula].count += 1;
  });
  const activeUsers = Object.entries(userCounts)
    .map(([matricula, data]) => ({
      name: data.name,
      matricula,
      count: data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Generate dynamic insights
  const generateInsight = () => {
    if (loans.length === 0) {
      return {
        title: "Sin actividad suficiente",
        text: "El sistema no registra movimientos de circulación suficientes en Supabase para generar sugerencias analíticas de inventario todavía.",
        iconColor: "text-blue-300"
      };
    }

    const overdueCount = loans.filter(l => l.status === 'overdue').length;
    if (overdueCount > 0) {
      return {
        title: "Boletas con retraso detectadas",
        text: `Se detectan ${overdueCount} préstamos vencidos en el sistema actualmente. Recomendamos enviar correos recordatorios automáticos y verificar las multas pendientes en el panel de devoluciones antes de liberar nuevos préstamos.`,
        iconColor: "text-red-300"
      };
    }

    // Find major with most loans
    const majorLoans: Record<string, number> = {};
    loans.forEach(l => {
      const key = l.userCarrera || 'Otros';
      majorLoans[key] = (majorLoans[key] || 0) + 1;
    });

    const sortedMajors = Object.entries(majorLoans).sort((a, b) => b[1] - a[1]);
    if (sortedMajors.length > 0) {
      const [topMajor, count] = sortedMajors[0];
      const percentage = Math.round((count / loans.length) * 100);
      
      const majorBook = loans.find(l => l.userCarrera === topMajor);
      const bookSuggestion = majorBook ? `"${majorBook.bookTitle}"` : "los títulos de esta área";

      return {
        title: `Alta demanda en ${topMajor}`,
        text: `La carrera con mayor demanda este periodo es ${topMajor} con el ${percentage}% de las salidas totales. Sugerimos colocar duplicados de ${bookSuggestion} en posiciones de fácil acceso rápido (Nivel 1 del estante correspondiente).`,
        iconColor: "text-blue-300"
      };
    }

    return {
      title: "Funcionamiento del acervo estable",
      text: "La circulación del inventario físico se mantiene dentro de los límites operativos estándar. No hay picos de demanda anormales detectados hoy.",
      iconColor: "text-emerald-300"
    };
  };

  const insight = generateInsight();

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-3xl text-gray-800">Reportes y Estadísticas</h2>
          <p className="text-gray-500 text-sm mt-1">
            Análisis de uso del acervo, circulación del inventario y conclusiones automáticas.
          </p>
        </div>
        
        {/* Export buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => triggerExport('PDF')}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-red-500" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={() => triggerExport('Excel')}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-emerald-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Grid: Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Usage by Faculty */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-heading font-bold text-sm text-gray-700 uppercase tracking-wider">Uso por Facultad / Licenciatura</h3>
          <div className="space-y-3.5 pt-2">
            {facultyUsage.map((item) => (
              <div key={item.faculty} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium text-gray-700">
                  <span>{item.faculty}</span>
                  <span className="font-bold text-gray-800">{item.percentage}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Top Borrowed Books */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-heading font-bold text-sm text-gray-700 uppercase tracking-wider">Libros Más Prestados</h3>
          <div className="space-y-4 pt-2">
            {topBooks.map((book, index) => (
              <div key={book.title} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-700 italic">{book.title}</span>
                </div>
                <span className="font-bold text-gray-800 shrink-0">{book.requests} préstamos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Loans Per Month (Inline SVG representation) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-heading font-bold text-sm text-gray-700 uppercase tracking-wider">Préstamos por Mes</h3>
          <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {monthlyLoans.map((item) => {
              const maxVal = Math.max(...monthlyLoans.map(m => m.count));
              const heightPercent = (item.count / maxVal) * 100;
              
              return (
                <div key={item.month} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="text-[10px] font-bold text-secondary mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </div>
                  <div 
                    className="w-full bg-secondary hover:bg-secondary-hover rounded-t-lg transition-all duration-300"
                    style={{ height: `${heightPercent * 0.7}%` }}
                  />
                  <span className="text-[10px] font-bold text-gray-400 mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Most Active Users */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-heading font-bold text-sm text-gray-700 uppercase tracking-wider">Usuarios Más Activos</h3>
          <div className="space-y-3.5 pt-2">
            {activeUsers.map((user) => (
              <div key={user.matricula} className="flex items-center justify-between text-xs p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">MATRÍCULA: {user.matricula}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-secondary">{user.count}</span>
                  <span className="text-[10px] text-gray-400 block">consultas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Insights Panel */}
      <div className="bg-primary text-white rounded-3xl p-6 shadow-md border border-primary-hover flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className={insight.iconColor} />
            <h3 className="font-heading font-bold text-lg">Conclusiones del Sistema ({insight.title})</h3>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed max-w-3xl">
            {insight.text}
          </p>
        </div>
        <div className="shrink-0 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold flex items-center gap-1">
          <span>Ver Planificación</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* Circulation table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <h3 className="font-heading font-bold text-lg text-gray-800">Registro Detallado de Circulación</h3>
          
          {/* Tab buttons */}
          <div className="flex border-b border-gray-100 select-none">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer
                ${activeTab === 'todos' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}
              `}
            >
              Todos ({loans.length})
            </button>
            <button
              onClick={() => setActiveTab('activos')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer
                ${activeTab === 'activos' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}
              `}
            >
              Activos ({loans.filter(l => l.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setActiveTab('vencidos')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer
                ${activeTab === 'vencidos' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}
              `}
            >
              Vencidos ({loans.filter(l => l.status === 'overdue').length})
            </button>
          </div>
        </div>

        {filteredLoans.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Ningún registro de circulación coincide con este filtro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="px-6 py-4">Libro</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4">Fecha Préstamo</th>
                  <th className="px-6 py-4">Fecha Límite</th>
                  <th className="px-6 py-4 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div>
                        <p className="italic font-medium">{loan.bookTitle}</p>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">ID: {loan.bookId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{loan.userName}</p>
                        <p className="text-[9px] text-gray-400 font-mono">MAT: {loan.userMatricula}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold font-mono text-secondary">{loan.bookLocation}</td>
                    <td className="px-6 py-4 text-gray-500">{loan.loanDate}</td>
                    <td className="px-6 py-4 text-gray-500">{loan.dueDate}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase
                        ${loan.status === 'returned' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${loan.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : ''}
                        ${loan.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {loan.status === 'returned' ? 'Devuelto' : loan.status === 'in_progress' ? 'En Curso' : 'Vencido'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Status Modal Simulation */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-gray-100">
            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100">
              <CheckCircle2 size={24} className="animate-pulse" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-gray-800 text-sm">Exportación en Proceso</h4>
              <p className="text-xs text-gray-500 mt-1">
                Simulando la generación y descarga de los datos en formato <span className="font-extrabold text-secondary">{showExportModal}</span>.
              </p>
            </div>
            <p className="text-[10px] text-gray-400 animate-pulse font-medium">El archivo se descargará en unos instantes...</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default Reports;
