import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Book, Loan, Activity } from '../types';
import { INITIAL_USERS, INITIAL_BOOKS, INITIAL_LOANS, INITIAL_ACTIVITIES } from '../utils/mockData';


interface LibraryContextType {
  users: User[];
  books: Book[];
  loans: Loan[];
  activities: Activity[];
  addUser: (user: Omit<User, 'loanCount' | 'status'>) => void;
  addBook: (book: Omit<Book, 'status'>) => void;
  createLoan: (matricula: string, bookId: string, days: number) => { success: boolean; message: string };
  returnLoan: (loanId: string) => { success: boolean; message: string };
  renewLoan: (loanId: string, days: number) => { success: boolean; message: string };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sgbu_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('sgbu_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('sgbu_loans');
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('sgbu_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Persist states
  useEffect(() => {
    localStorage.setItem('sgbu_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sgbu_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('sgbu_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('sgbu_activities', JSON.stringify(activities));
  }, [activities]);

  const addUser = (userData: Omit<User, 'loanCount' | 'status'>) => {
    const newUser: User = {
      ...userData,
      status: 'active',
      loanCount: 0
    };
    setUsers(prev => [newUser, ...prev]);

    // Add activity
    const newActivity: Activity = {
      id: `ACT-${Date.now()}`,
      type: 'user_register',
      userName: userData.name,
      userMatricula: userData.matricula,
      bookTitle: 'Registro de nuevo usuario',
      date: new Date().toISOString(),
      status: 'Completado'
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const addBook = (bookData: Omit<Book, 'status'>) => {
    const newBook: Book = {
      ...bookData,
      status: 'available'
    };
    setBooks(prev => [newBook, ...prev]);

    // Add activity
    const newActivity: Activity = {
      id: `ACT-${Date.now()}`,
      type: 'book_register',
      userName: 'Bibliotecaria Lux',
      userMatricula: 'ADMIN',
      bookTitle: bookData.title,
      date: new Date().toISOString(),
      status: 'Registrado'
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const createLoan = (matricula: string, bookId: string, days: number) => {
    const user = users.find(u => u.matricula === matricula);
    if (!user) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    if (user.status === 'overdue') {
      return { success: false, message: 'El usuario tiene préstamos vencidos y multas pendientes.' };
    }

    const book = books.find(b => b.id === bookId);
    if (!book) {
      return { success: false, message: 'Material no encontrado.' };
    }

    if (book.status === 'loaned') {
      return { success: false, message: 'El material ya se encuentra prestado actualmente.' };
    }

    // Process loan
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + days);

    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const newLoan: Loan = {
      id: `L-${Date.now().toString().slice(-4)}`,
      userMatricula: user.matricula,
      userName: user.name,
      userCarrera: user.carrera,
      bookId: book.id,
      bookTitle: book.title,
      bookLocation: book.locationCode,
      loanDate: formatLocalDate(today),
      dueDate: formatLocalDate(dueDate),
      status: 'in_progress',
      fineAmount: 0
    };

    // Update book status
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: 'loaned' } : b));
    
    // Update user loan count
    setUsers(prev => prev.map(u => u.matricula === matricula ? { ...u, loanCount: u.loanCount + 1 } : u));

    // Register loan
    setLoans(prev => [newLoan, ...prev]);

    // Add activity
    const newActivity: Activity = {
      id: `ACT-${Date.now()}`,
      type: 'loan',
      userName: user.name,
      userMatricula: user.matricula,
      bookTitle: book.title,
      date: new Date().toISOString(),
      status: 'En Curso'
    };
    setActivities(prev => [newActivity, ...prev]);

    return { success: true, message: `Préstamo registrado con éxito. Fecha de vencimiento: ${formatLocalDate(dueDate)}` };
  };

  const returnLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      return { success: false, message: 'Préstamo no encontrado.' };
    }

    if (loan.status === 'returned') {
      return { success: false, message: 'Este préstamo ya fue devuelto anteriormente.' };
    }

    // Update loan status
    const today = new Date();
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: 'returned', returnDate: formatLocalDate(today) } : l));

    // Update book status
    setBooks(prev => prev.map(b => b.id === loan.bookId ? { ...b, status: 'available' } : b));

    // Update user loan count & status if necessary
    setUsers(prev => prev.map(u => {
      if (u.matricula === loan.userMatricula) {
        const remainingLoans = loans.filter(l => l.userMatricula === u.matricula && l.id !== loanId && l.status === 'overdue');
        return {
          ...u,
          loanCount: Math.max(0, u.loanCount - 1),
          status: remainingLoans.length > 0 ? 'overdue' as const : 'active' as const
        };
      }
      return u;
    }));

    // Add activity
    const newActivity: Activity = {
      id: `ACT-${Date.now()}`,
      type: 'return',
      userName: loan.userName,
      userMatricula: loan.userMatricula,
      bookTitle: loan.bookTitle,
      date: new Date().toISOString(),
      status: 'Devuelto'
    };
    setActivities(prev => [newActivity, ...prev]);

    return { success: true, message: 'Devolución registrada con éxito. Material disponible de nuevo.' };
  };

  const renewLoan = (loanId: string, days: number) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) {
      return { success: false, message: 'Préstamo no encontrado.' };
    }

    if (loan.status === 'returned') {
      return { success: false, message: 'No se puede renovar un préstamo ya devuelto.' };
    }

    const currentDueDate = new Date(loan.dueDate);
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + days);

    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, dueDate: formatLocalDate(newDueDate), status: 'in_progress', fineAmount: 0 } : l));

    // Also verify if the user's status should clear from overdue if they have no other overdue loans
    setUsers(prev => prev.map(u => {
      if (u.matricula === loan.userMatricula) {
        const remainingOverdue = loans.filter(l => l.userMatricula === u.matricula && l.id !== loanId && l.status === 'overdue');
        return {
          ...u,
          status: remainingOverdue.length > 0 ? 'overdue' as const : 'active' as const
        };
      }
      return u;
    }));

    return { success: true, message: `Renovación exitosa. Nueva fecha de entrega: ${formatLocalDate(newDueDate)}` };
  };

  return (
    <LibraryContext.Provider value={{
      users,
      books,
      loans,
      activities,
      addUser,
      addBook,
      createLoan,
      returnLoan,
      renewLoan,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary debe usarse dentro de un LibraryProvider');
  }
  return context;
};
