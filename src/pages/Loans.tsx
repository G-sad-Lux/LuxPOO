import React, { useState } from 'react';
import { Search, UserCheck, BookOpen, Calendar, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryStore';
import confetti from 'canvas-confetti';

export const Loans: React.FC = () => {
  const { users, books, loans, createLoan, returnLoan } = useLibrary();

  // Wizard States (New Loan)
  const [loanStep, setLoanStep] = useState(1);
  const [userQuery, setUserQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  
  const [loanDays, setLoanDays] = useState(7);
  const [wizardError, setWizardError] = useState('');
  const [wizardSuccess, setWizardSuccess] = useState('');

  // Return Panel States
  const [returnQuery, setReturnQuery] = useState('');
  const [foundLoan, setFoundLoan] = useState<any>(null);
  const [returnSuccess, setReturnSuccess] = useState('');
  const [returnError, setReturnError] = useState('');

  // Step 1: Verify User matrícula
  const handleVerifyUser = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError('');
    
    const user = users.find(u => u.matricula.toLowerCase() === userQuery.trim().toLowerCase());
    if (!user) {
      setWizardError('Alumno no registrado en el sistema. Registre al alumno primero.');
      setSelectedUser(null);
      return;
    }

    if (user.status === 'overdue') {
      setWizardError('El usuario tiene adeudos de multas o libros vencidos. Préstamo BLOQUEADO.');
      setSelectedUser(null);
      return;
    }

    setSelectedUser(user);
    setLoanStep(2); // Go to step 2
  };

  // Step 2: Verify Book availability
  const handleVerifyBook = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError('');

    const book = books.find(b => 
      b.id.toLowerCase() === bookQuery.trim().toLowerCase() ||
      b.title.toLowerCase().includes(bookQuery.trim().toLowerCase())
    );

    if (!book) {
      setWizardError('Libro o Tesis no encontrado en el acervo.');
      setSelectedBook(null);
      return;
    }

    if (book.status === 'loaned') {
      setWizardError(`El material "${book.title}" se encuentra prestado actualmente.`);
      setSelectedBook(null);
      return;
    }

    setSelectedBook(book);
    setLoanStep(3); // Go to step 3
  };

  // Step 3: Confirm loan
  const handleConfirmLoan = () => {
    setWizardError('');
    if (!selectedUser || !selectedBook) return;

    const res = createLoan(selectedUser.matricula, selectedBook.id, loanDays);
    if (res.success) {
      setWizardSuccess(res.message);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      // Reset wizard
      setTimeout(() => {
        setLoanStep(1);
        setUserQuery('');
        setBookQuery('');
        setSelectedUser(null);
        setSelectedBook(null);
        setWizardSuccess('');
      }, 4000);
    } else {
      setWizardError(res.message);
    }
  };

  // Search loan for return
  const handleSearchReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnError('');
    setReturnSuccess('');
    setFoundLoan(null);

    const query = returnQuery.trim().toUpperCase();
    if (!query) return;

    // Search by loan ID, book ID, or user matrícula
    const loan = loans.find(l => 
      (l.id === query || l.bookId === query || l.userMatricula === query) &&
      l.status !== 'returned'
    );

    if (!loan) {
      setReturnError('No se encontró ningún préstamo activo con este código.');
      return;
    }

    // Calculate dynamic fine on the fly if overdue
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      loan.fineAmount = diffDays * 45; // 45 MXN per day
      loan.status = 'overdue';
    }

    setFoundLoan(loan);
  };

  // Register Return
  const handleRegisterReturn = () => {
    if (!foundLoan) return;
    setReturnError('');
    
    const res = returnLoan(foundLoan.id);
    if (res.success) {
      setReturnSuccess(res.message);
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#10B981', '#34D399', '#6EE7B7']
      });
      setFoundLoan(null);
      setReturnQuery('');
      
      setTimeout(() => setReturnSuccess(''), 3000);
    } else {
      setReturnError(res.message);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div>
        <h2 className="font-heading font-bold text-3xl text-gray-800">Préstamos y Devoluciones</h2>
        <p className="text-gray-500 text-sm mt-1">
          Registra salidas de materiales y gestiona retornos físicos con cálculo de multas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wizard for New Loan - Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-gray-800">Nuevo Préstamo</h3>
              
              {/* Wizard Steps indicator */}
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 select-none">
                <span className={`px-2 py-0.5 rounded-full ${loanStep >= 1 ? 'bg-primary text-white' : 'bg-gray-100'}`}>1. Usuario</span>
                <span className="text-gray-300">→</span>
                <span className={`px-2 py-0.5 rounded-full ${loanStep >= 2 ? 'bg-primary text-white' : 'bg-gray-100'}`}>2. Libro</span>
                <span className="text-gray-300">→</span>
                <span className={`px-2 py-0.5 rounded-full ${loanStep >= 3 ? 'bg-primary text-white' : 'bg-gray-100'}`}>3. Plazo</span>
              </div>
            </div>

            {wizardError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{wizardError}</span>
              </div>
            )}

            {wizardSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="shrink-0 animate-bounce" />
                <span>{wizardSuccess}</span>
              </div>
            )}

            {/* STEP 1: Search and select User */}
            {loanStep === 1 && (
              <form onSubmit={handleVerifyUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paso 1: Matrícula del Alumno</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="Ingresa matrícula (ej. 017497, 017495...)"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
                    >
                      Verificar Alumno
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">
                  El sistema validará que el alumno no tenga reportes de retrasos ni multas pendientes antes de continuar.
                </p>
              </form>
            )}

            {/* STEP 2: Search and select Book */}
            {loanStep === 2 && selectedUser && (
              <div className="space-y-6 animate-in slide-in-from-right duration-150">
                {/* User validation badge */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} />
                    <span>Alumno verificado: <span className="font-bold">{selectedUser.name}</span> ({selectedUser.matricula})</span>
                  </div>
                  <button 
                    onClick={() => { setLoanStep(1); setSelectedUser(null); }}
                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600 underline cursor-pointer"
                  >
                    Cambiar Alumno
                  </button>
                </div>

                <form onSubmit={handleVerifyBook} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paso 2: Título o Código de Barras / ISBN del Libro</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <BookOpen size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="Ingresa título o ISBN del libro (ej: Cálculo, James Stewart...)"
                          value={bookQuery}
                          onChange={(e) => setBookQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                          required
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
                      >
                        Buscar Material
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: Dates and Confirmation */}
            {loanStep === 3 && selectedUser && selectedBook && (
              <div className="space-y-6 animate-in slide-in-from-right duration-150">
                {/* Summary badges */}
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
                    <UserCheck size={14} className="shrink-0" />
                    <span>Alumno: <span className="font-bold">{selectedUser.name}</span></span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                    <BookOpen size={14} className="shrink-0" />
                    <span>Libro: <span className="font-bold italic">{selectedBook.title}</span> ({selectedBook.author})</span>
                  </div>
                </div>

                {/* Term Slider */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      <span>Plazo del préstamo</span>
                    </label>
                    <span className="font-bold text-secondary text-sm">{loanDays} días corridos</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={21}
                    value={loanDays}
                    onChange={(e) => setLoanDays(Number(e.target.value))}
                    className="w-full accent-secondary"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-gray-400 select-none">
                    <span>3 días (Exprés)</span>
                    <span>7 días (Estándar)</span>
                    <span>14 días</span>
                    <span>21 días (Máximo)</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setLoanStep(2);
                      setSelectedBook(null);
                    }}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleConfirmLoan}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-md"
                  >
                    Confirmar Préstamo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Returns Panel) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <RefreshCw className="text-secondary" size={20} />
            <h3 className="font-heading font-bold text-lg text-gray-800">Devoluciones</h3>
          </div>

          {returnError && (
            <p className="text-xs text-red-500 font-medium bg-red-50 p-3 border border-red-100 rounded-xl">{returnError}</p>
          )}

          {returnSuccess && (
            <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-3 border border-emerald-100 rounded-xl">{returnSuccess}</p>
          )}

          <form onSubmit={handleSearchReturn} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Folio / Matrícula / Libro ID</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: L-1003 o 017402"
                  value={returnQuery}
                  onChange={(e) => setReturnQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary bg-gray-50/50"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-secondary hover:bg-secondary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Buscar Préstamo Activo
            </button>
          </form>

          {/* Found Loan details */}
          {foundLoan && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-4 text-xs animate-in slide-in-from-bottom duration-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary font-mono uppercase">Folio: {foundLoan.id}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase
                  ${foundLoan.status === 'overdue' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'}
                `}>
                  {foundLoan.status === 'overdue' ? 'Atrasado' : 'En Curso'}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-200/60 pt-3 text-gray-600">
                <p>Libro: <span className="font-semibold text-gray-800 italic">{foundLoan.bookTitle}</span></p>
                <p>Alumno: <span className="font-semibold text-gray-800">{foundLoan.userName}</span></p>
                <p>Matrícula: <span className="font-bold text-gray-800 font-mono">{foundLoan.userMatricula}</span></p>
                <p>Fecha Límite: <span className="font-semibold text-gray-800">{foundLoan.dueDate}</span></p>
                <p>Ubicación física: <span className="font-bold text-secondary font-mono">{foundLoan.bookLocation}</span></p>
              </div>

              {/* Penalty Alert for Overdue loans */}
              {foundLoan.status === 'overdue' && (
                <div className="p-3 bg-red-100 text-red-800 rounded-xl border border-red-200 space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertTriangle size={14} />
                    <span>Multa Generada</span>
                  </div>
                  <p className="text-[10px] leading-normal font-medium">
                    El alumno excede la fecha de entrega. Cobrar <span className="font-extrabold text-red-600 text-sm font-mono">${foundLoan.fineAmount}.00 MXN</span> antes de liberar el material.
                  </p>
                </div>
              )}

              <button
                onClick={handleRegisterReturn}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Registrar Devolución
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Loans;
