import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Book, Loan, Activity } from '../types';
import { supabase } from '../utils/supabaseClient';

interface LibraryContextType {
  users: User[];
  books: Book[];
  loans: Loan[];
  activities: Activity[];
  addUser: (user: Omit<User, 'loanCount' | 'status'>) => void;
  addBook: (book: Omit<Book, 'status'>) => void;
  addBooks: (books: Omit<Book, 'status'>[]) => Promise<{ success: boolean; message: string }>;
  createLoan: (matricula: string, bookId: string, days: number) => { success: boolean; message: string };
  returnLoan: (loanId: string) => { success: boolean; message: string };
  renewLoan: (loanId: string, days: number) => { success: boolean; message: string };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Mappers to translate snake_case DB fields to camelCase TS interfaces
const mapUserFromDB = (dbUser: any): User => ({
  matricula: dbUser.matricula,
  name: dbUser.name,
  carrera: dbUser.carrera,
  email: dbUser.email,
  status: dbUser.status as 'active' | 'overdue',
  photoUrl: dbUser.photo_url || undefined,
  loanCount: dbUser.loan_count || 0,
});

const mapBookFromDB = (dbBook: any): Book => ({
  id: dbBook.id,
  title: dbBook.title,
  author: dbBook.author,
  year: Number(dbBook.year),
  licenciatura: dbBook.licenciatura,
  advisor: dbBook.advisor || undefined,
  locationCode: dbBook.location_code,
  status: dbBook.status as 'available' | 'loaned',
});

const mapLoanFromDB = (dbLoan: any): Loan => ({
  id: dbLoan.id,
  userMatricula: dbLoan.user_matricula,
  userName: dbLoan.users?.name || 'Usuario desconocido',
  userCarrera: dbLoan.users?.carrera || '',
  bookId: dbLoan.book_id,
  bookTitle: dbLoan.books?.title || 'Libro desconocido',
  bookLocation: dbLoan.books?.location_code || '',
  loanDate: dbLoan.loan_date,
  dueDate: dbLoan.due_date,
  returnDate: dbLoan.return_date || undefined,
  status: dbLoan.status as 'returned' | 'in_progress' | 'overdue',
  fineAmount: Number(dbLoan.fine_amount || 0),
});

const mapActivityFromDB = (dbAct: any): Activity => ({
  id: dbAct.id,
  type: dbAct.type as 'loan' | 'return' | 'user_register' | 'book_register',
  userName: dbAct.user_name,
  userMatricula: dbAct.user_matricula,
  bookTitle: dbAct.book_title,
  date: dbAct.date,
  status: dbAct.status,
});

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to load all data from Supabase
  const loadData = async () => {
    try {
      // 1. Fetch Users
      const { data: dbUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (usersError) throw usersError;

      // 2. Fetch Books
      const { data: dbBooks, error: booksError } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      if (booksError) throw booksError;

      // 3. Fetch Loans (with User and Book details joined)
      const { data: dbLoans, error: loansError } = await supabase
        .from('loans')
        .select(`
          *,
          users (name, carrera),
          books (title, location_code)
        `)
        .order('created_at', { ascending: false });
      if (loansError) throw loansError;

      // 4. Fetch Activities
      const { data: dbActivities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
      if (activitiesError) throw activitiesError;

      // Update state
      setUsers((dbUsers || []).map(mapUserFromDB));
      setBooks((dbBooks || []).map(mapBookFromDB));
      setLoans((dbLoans || []).map(mapLoanFromDB));
      setActivities((dbActivities || []).map(mapActivityFromDB));
    } catch (err) {
      console.error('Error loading library data from Supabase:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const addUser = async (userData: Omit<User, 'loanCount' | 'status'>) => {
    const newUserDB = {
      matricula: userData.matricula,
      name: userData.name,
      carrera: userData.carrera,
      email: userData.email,
      photo_url: userData.photoUrl || null,
      status: 'active',
      loan_count: 0
    };

    // Optimistic local state update
    const newUser: User = {
      ...userData,
      status: 'active',
      loanCount: 0
    };
    setUsers(prev => [newUser, ...prev]);

    try {
      const { error: userError } = await supabase.from('users').insert(newUserDB);
      if (userError) throw userError;

      // Register activity
      const newActivityDB = {
        type: 'user_register',
        user_name: userData.name,
        user_matricula: userData.matricula,
        book_title: 'Registro de nuevo usuario',
        status: 'Completado'
      };
      await supabase.from('activities').insert(newActivityDB);
    } catch (err) {
      console.error('Error saving user in Supabase:', err);
    } finally {
      loadData();
    }
  };

  const addBook = async (bookData: Omit<Book, 'status'>) => {
    const newBookDB = {
      id: bookData.id,
      title: bookData.title,
      author: bookData.author,
      year: bookData.year,
      licenciatura: bookData.licenciatura,
      advisor: bookData.advisor || null,
      location_code: bookData.locationCode,
      status: 'available'
    };

    // Optimistic local state update
    const newBook: Book = {
      ...bookData,
      status: 'available'
    };
    setBooks(prev => [newBook, ...prev]);

    try {
      const { error: bookError } = await supabase.from('books').insert(newBookDB);
      if (bookError) throw bookError;

      // Register activity
      const newActivityDB = {
        type: 'book_register',
        user_name: 'Bibliotecaria Lux',
        user_matricula: 'ADMIN',
        book_title: bookData.title,
        status: 'Registrado'
      };
      await supabase.from('activities').insert(newActivityDB);
    } catch (err) {
      console.error('Error saving book in Supabase:', err);
    } finally {
      loadData();
    }
  };

  const addBooks = async (booksData: Omit<Book, 'status'>[]) => {
    const newBooksDB = booksData.map(bookData => ({
      id: bookData.id,
      title: bookData.title,
      author: bookData.author,
      year: bookData.year,
      licenciatura: bookData.licenciatura,
      advisor: bookData.advisor || null,
      location_code: bookData.locationCode,
      status: 'available'
    }));

    // Optimistic local state update
    const newBooks: Book[] = booksData.map(bookData => ({
      ...bookData,
      status: 'available'
    }));
    setBooks(prev => [...newBooks, ...prev]);

    try {
      const { error: booksError } = await supabase.from('books').insert(newBooksDB);
      if (booksError) throw booksError;

      // Register activity
      const newActivityDB = {
        type: 'book_register',
        user_name: 'Bibliotecaria Lux',
        user_matricula: 'ADMIN',
        book_title: `Importación por lote de ${booksData.length} libros`,
        status: 'Registrado'
      };
      await supabase.from('activities').insert(newActivityDB);
      return { success: true, message: `¡${booksData.length} libros importados con éxito!` };
    } catch (err: any) {
      console.error('Error importing books in Supabase:', err);
      return { success: false, message: err.message || 'Error al importar los libros.' };
    } finally {
      loadData();
    }
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

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + days);

    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const loanId = `L-${Date.now().toString().slice(-4)}`;

    // Background Async DB update
    (async () => {
      try {
        const newLoanDB = {
          id: loanId,
          user_matricula: matricula,
          book_id: bookId,
          loan_date: formatLocalDate(today),
          due_date: formatLocalDate(dueDate),
          status: 'in_progress',
          fine_amount: 0
        };

        // 1. Insert loan
        const { error: loanErr } = await supabase.from('loans').insert(newLoanDB);
        if (loanErr) throw loanErr;

        // 2. Update book status to 'loaned'
        const { error: bookErr } = await supabase.from('books').update({ status: 'loaned' }).eq('id', bookId);
        if (bookErr) throw bookErr;

        // 3. Update user loan count
        const { error: userErr } = await supabase.from('users').update({ loan_count: user.loanCount + 1 }).eq('matricula', matricula);
        if (userErr) throw userErr;

        // 4. Register activity
        const newActivityDB = {
          type: 'loan',
          user_name: user.name,
          user_matricula: user.matricula,
          book_title: book.title,
          status: 'En Curso'
        };
        await supabase.from('activities').insert(newActivityDB);
      } catch (err) {
        console.error('Error creating loan in Supabase:', err);
      } finally {
        loadData();
      }
    })();

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

    const today = new Date();
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const returnDateStr = formatLocalDate(today);

    // Background Async DB update
    (async () => {
      try {
        // 1. Update loan status to returned
        const { error: loanErr } = await supabase
          .from('loans')
          .update({
            status: 'returned',
            return_date: returnDateStr
          })
          .eq('id', loanId);
        if (loanErr) throw loanErr;

        // 2. Update book status to available
        const { error: bookErr } = await supabase
          .from('books')
          .update({ status: 'available' })
          .eq('id', loan.bookId);
        if (bookErr) throw bookErr;

        // 3. Update user loan count and check status
        const user = users.find(u => u.matricula === loan.userMatricula);
        if (user) {
          const remainingOverdue = loans.filter(
            l => l.userMatricula === user.matricula && l.id !== loanId && l.status === 'overdue'
          );
          const newStatus = remainingOverdue.length > 0 ? 'overdue' : 'active';
          const newLoanCount = Math.max(0, user.loanCount - 1);

          const { error: userErr } = await supabase
            .from('users')
            .update({
              loan_count: newLoanCount,
              status: newStatus
            })
            .eq('matricula', user.matricula);
          if (userErr) throw userErr;
        }

        // 4. Register activity
        const newActivityDB = {
          type: 'return',
          user_name: loan.userName,
          user_matricula: loan.userMatricula,
          book_title: loan.bookTitle,
          status: 'Devuelto'
        };
        await supabase.from('activities').insert(newActivityDB);
      } catch (err) {
        console.error('Error returning loan in Supabase:', err);
      } finally {
        loadData();
      }
    })();

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

    const newDueDateStr = formatLocalDate(newDueDate);

    // Background Async DB update
    (async () => {
      try {
        // 1. Update loan in database
        const { error: loanErr } = await supabase
          .from('loans')
          .update({
            due_date: newDueDateStr,
            status: 'in_progress',
            fine_amount: 0
          })
          .eq('id', loanId);
        if (loanErr) throw loanErr;

        // 2. Clear user overdue status if they have no other overdue loans
        const user = users.find(u => u.matricula === loan.userMatricula);
        if (user) {
          const remainingOverdue = loans.filter(
            l => l.userMatricula === user.matricula && l.id !== loanId && l.status === 'overdue'
          );
          const newStatus = remainingOverdue.length > 0 ? 'overdue' : 'active';

          const { error: userErr } = await supabase
            .from('users')
            .update({ status: newStatus })
            .eq('matricula', user.matricula);
          if (userErr) throw userErr;
        }
      } catch (err) {
        console.error('Error renewing loan in Supabase:', err);
      } finally {
        loadData();
      }
    })();

    return { success: true, message: `Renovación exitosa. Nueva fecha de entrega: ${newDueDateStr}` };
  };

  return (
    <LibraryContext.Provider value={{
      users,
      books,
      loans,
      activities,
      addUser,
      addBook,
      addBooks,
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

