import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ShieldCheck, ShieldAlert, Award, Mail, BookOpen, Clock } from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryStore';
import confetti from 'canvas-confetti';

export const Users: React.FC = () => {
  const navigate = useNavigate();
  const { users, loans, renewLoan } = useLibrary();
  const [matriculaQuery, setMatriculaQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matriculaQuery.trim()) return;

    const foundUser = users.find(
      u => u.matricula.toLowerCase() === matriculaQuery.trim().toLowerCase()
    );

    setSelectedUser(foundUser || null);
    setHasSearched(true);
    setAlertMsg({ type: '', text: '' });
  };

  // Get active and past loans for the selected user
  const userLoans = selectedUser 
    ? loans.filter(l => l.userMatricula === selectedUser.matricula)
    : [];

  const handleRenew = (loanId: string) => {
    const res = renewLoan(loanId, 7); // Renew for 7 days
    if (res.success) {
      setAlertMsg({ type: 'success', text: res.message });
      // Trigger canvas-confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
      // Re-trigger search to update state in view
      const updatedUser = users.find(u => u.matricula === selectedUser.matricula);
      setSelectedUser(updatedUser);
    } else {
      setAlertMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-3xl text-gray-800">Gestión de Usuarios</h2>
          <p className="text-gray-500 text-sm mt-1">
            Busca fichas de estudiantes por matrícula, renueva préstamos o revisa historiales.
          </p>
        </div>
        <button
          onClick={() => navigate('/usuarios/nuevo')}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm"
        >
          <UserPlus size={16} />
          <span>Registrar Alumno</span>
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-heading font-bold text-sm text-gray-800 mb-3">Buscar Alumno o Docente</h3>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Ingresa la matrícula del usuario (ej: 017497, 017402...)"
              value={matriculaQuery}
              onChange={(e) => setMatriculaQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-secondary hover:bg-secondary-hover text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-center"
          >
            Buscar Usuario
          </button>
        </form>
      </div>

      {/* Alert Notifications */}
      {alertMsg.text && (
        <div className={`p-4 rounded-2xl text-xs font-medium border flex items-center gap-2
          ${alertMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}>
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {selectedUser ? (
            <>
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6 flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={selectedUser.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"}
                    alt={selectedUser.name}
                    className="h-24 w-24 rounded-full border-4 border-gray-100 object-cover shadow-sm"
                  />
                  <span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center
                    ${selectedUser.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}
                  `}>
                    {selectedUser.status === 'active' ? (
                      <ShieldCheck size={12} className="text-white" />
                    ) : (
                      <ShieldAlert size={12} className="text-white" />
                    )}
                  </span>
                </div>

                <div className="space-y-1 w-full">
                  <h3 className="font-heading font-extrabold text-lg text-gray-800 leading-tight">
                    {selectedUser.name}
                  </h3>
                  <p className="text-xs text-secondary font-bold font-mono tracking-wider">
                    MATRÍCULA: {selectedUser.matricula}
                  </p>
                </div>

                <div className="w-full border-t border-gray-100 pt-6 space-y-3.5 text-left text-xs">
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Award size={16} className="text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Carrera / Licenciatura</p>
                      <p className="font-semibold text-gray-700">{selectedUser.carrera}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Mail size={16} className="text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Correo Institucional</p>
                      <p className="font-semibold text-gray-700">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-gray-600">
                    <BookOpen size={16} className="text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Préstamos Activos</p>
                      <p className="font-semibold text-gray-700">{selectedUser.loanCount} libros en posesión</p>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-4">
                  <span className={`w-full block py-2.5 rounded-xl font-bold text-xs uppercase
                    ${selectedUser.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-red-50 text-red-700'
                    }
                  `}>
                    {selectedUser.status === 'active' ? 'Estatus: Alumno Regular' : 'Estatus: Con Multas / Retraso'}
                  </span>
                </div>
              </div>

              {/* Loans History Table */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-heading font-bold text-lg text-gray-800">Historial de Préstamos del Alumno</h3>
                </div>
                
                {userLoans.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                    <Clock size={36} className="stroke-[1.5] mb-2" />
                    <p className="text-xs">El alumno no registra ningún préstamo activo ni histórico en el sistema.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
                          <th className="px-6 py-4">Libro / Tesis</th>
                          <th className="px-6 py-4">Fecha Préstamo</th>
                          <th className="px-6 py-4">Fecha Límite</th>
                          <th className="px-6 py-4">Estado</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {userLoans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-900">
                              <div>
                                <p className="italic font-medium">{loan.bookTitle}</p>
                                <p className="text-[9px] text-gray-400 font-mono mt-0.5">ID: {loan.bookId}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{loan.loanDate}</td>
                            <td className="px-6 py-4 text-gray-500">{loan.dueDate}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase
                                ${loan.status === 'returned' ? 'bg-emerald-100 text-emerald-800' : ''}
                                ${loan.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : ''}
                                ${loan.status === 'overdue' ? 'bg-red-100 text-red-800 animate-pulse' : ''}
                              `}>
                                {loan.status === 'returned' ? 'Devuelto' : loan.status === 'in_progress' ? 'En Curso' : 'Vencido'}
                              </span>
                              {loan.fineAmount > 0 && (
                                <p className="text-[10px] text-red-600 font-bold mt-1">Multa: ${loan.fineAmount} MXN</p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {loan.status !== 'returned' && (
                                <button
                                  onClick={() => handleRenew(loan.id)}
                                  className="px-3 py-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                                >
                                  Renovar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="col-span-3 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center space-y-4 py-12">
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <ShieldAlert size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-lg text-gray-800">Matrícula No Registrada</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  La matrícula <span className="font-mono font-bold text-red-600">"{matriculaQuery}"</span> no coincide con ningún estudiante o docente en la base de datos de Universidad Lux.
                </p>
              </div>
              <button
                onClick={() => navigate('/usuarios/nuevo', { state: { matricula: matriculaQuery } })}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm"
              >
                <UserPlus size={16} />
                <span>Registrar como Nuevo Usuario</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
export default Users;
