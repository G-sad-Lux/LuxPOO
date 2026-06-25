export interface User {
  matricula: string;
  name: string;
  carrera: string;
  email: string;
  status: 'active' | 'overdue';
  photoUrl?: string;
  loanCount: number;
}

export interface Book {
  id: string; // ISBN or barcode
  title: string;
  author: string;
  year: number;
  licenciatura: string;
  advisor?: string;
  locationCode: string; // e.g. E1N1
  status: 'available' | 'loaned';
}

export interface Loan {
  id: string;
  userMatricula: string;
  userName: string;
  userCarrera: string;
  bookId: string;
  bookTitle: string;
  bookLocation: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'returned' | 'in_progress' | 'overdue';
  fineAmount: number;
}

export interface Location {
  code: string; // e.g. E1N1
  shelf: number; // 1, 2, 3
  level: number; // 1, 2, 3
  name: string; // e.g. Estante 1 - Nivel 1
}

export interface Activity {
  id: string;
  type: 'loan' | 'return' | 'user_register' | 'book_register';
  userName: string;
  userMatricula: string;
  bookTitle: string;
  date: string;
  status: string; // e.g. 'Devuelto', 'En Curso', 'Atrasado', 'Registrado'
}
