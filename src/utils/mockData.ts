import type { User, Book, Loan, Activity, Location } from '../types';


export const INITIAL_USERS: User[] = [
  {
    matricula: "017497",
    name: "Patricio Ávila Izaguirre",
    carrera: "Ingeniería en Sistemas Computacionales",
    email: "patricio.avila@lux.edu.mx",
    status: "active",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
    loanCount: 2
  },
  {
    matricula: "017495",
    name: "Isidro Hernández Obregón",
    carrera: "Ingeniería en Sistemas Computacionales",
    email: "isidro.hernandez@lux.edu.mx",
    status: "active",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    loanCount: 1
  },
  {
    matricula: "017402",
    name: "Valeria Hernández Hernández",
    carrera: "Licenciatura en Psicología",
    email: "valeria.hernandez@lux.edu.mx",
    status: "overdue",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    loanCount: 3
  },
  {
    matricula: "017567",
    name: "Eduardo Martin Pérez Hernández",
    carrera: "Ingeniería en Sistemas Computacionales",
    email: "eduardo.perez@lux.edu.mx",
    status: "active",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    loanCount: 0
  },
  {
    matricula: "018210",
    name: "María Fernanda Gámez Garza",
    carrera: "Licenciatura en Administración de Empresas",
    email: "fernanda.garza@lux.edu.mx",
    status: "active",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120",
    loanCount: 1
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: "9786071511522",
    title: "Cálculo de una Variable: Trascendentes Tempranas",
    author: "James Stewart",
    year: 2018,
    licenciatura: "Ingeniería en Sistemas Computacionales",
    advisor: "Ing. Carrizales Pinal Emma",
    locationCode: "E1N1",
    status: "available"
  },
  {
    id: "9786071514035",
    title: "Física Universitaria con Física Moderna Vol. 1",
    author: "Sears y Zemansky",
    year: 2020,
    licenciatura: "Ingeniería en Sistemas Computacionales",
    advisor: "Ing. Carrizales Pinal Emma",
    locationCode: "E1N2",
    status: "loaned"
  },
  {
    id: "9786071503121",
    title: "Fundamentos de Sistemas de Bases de Datos",
    author: "Ramez Elmasri",
    year: 2016,
    licenciatura: "Ingeniería en Sistemas Computacionales",
    advisor: "Ing. Carrizales Pinal Emma",
    locationCode: "E1N3",
    status: "available"
  },
  {
    id: "9786071509130",
    title: "Introducción a la Teoría General de la Administración",
    author: "Idalberto Chiavenato",
    year: 2019,
    licenciatura: "Licenciatura en Administración de Empresas",
    advisor: "Lic. Alberto Gómez Treviño",
    locationCode: "E2N1",
    status: "available"
  },
  {
    id: "9786074423884",
    title: "Principios de Marketing",
    author: "Philip Kotler",
    year: 2017,
    licenciatura: "Licenciatura en Administración de Empresas",
    advisor: "Lic. Alberto Gómez Treviño",
    locationCode: "E2N2",
    status: "loaned"
  },
  {
    id: "9788448161118",
    title: "Psicología del Desarrollo: Infancia y Adolescencia",
    author: "David R. Shaffer",
    year: 2015,
    licenciatura: "Licenciatura en Psicología",
    advisor: "Dra. Sofía Rodríguez Ortiz",
    locationCode: "E3N1",
    status: "loaned"
  },
  {
    id: "T-017402",
    title: "Tesis: Desarrollo de Sistema SGBU de Gestión Bibliotecaria",
    author: "Hernández Hernández Valeria",
    year: 2026,
    licenciatura: "Ingeniería en Sistemas Computacionales",
    advisor: "Ing. Carrizales Pinal Emma",
    locationCode: "E1N1",
    status: "available"
  },
  {
    id: "T-017497",
    title: "Tesis: Optimización de Algoritmos de Búsqueda Predictiva",
    author: "Ávila Izaguirre Carlos Patricio",
    year: 2026,
    licenciatura: "Ingeniería en Sistemas Computacionales",
    advisor: "Ing. Carrizales Pinal Emma",
    locationCode: "E1N2",
    status: "available"
  },
  {
    id: "9786071505293",
    title: "Estructuras de Datos en Java",
    author: "Mark Allen Weiss",
    year: 2013,
    licenciatura: "Ingeniería en Sistemas Computacionales",
    advisor: "Ing. Carrizales Pinal Emma",
    locationCode: "E1N3",
    status: "available"
  },
  {
    id: "9786073238472",
    title: "Comportamiento Organizacional",
    author: "Stephen P. Robbins",
    year: 2017,
    licenciatura: "Licenciatura en Administración de Empresas",
    advisor: "Lic. Alberto Gómez Treviño",
    locationCode: "E2N3",
    status: "available"
  }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: "L-1001",
    userMatricula: "017497",
    userName: "Patricio Ávila Izaguirre",
    userCarrera: "Ingeniería en Sistemas Computacionales",
    bookId: "9786071511522",
    bookTitle: "Cálculo de una Variable: Trascendentes Tempranas",
    bookLocation: "E1N1",
    loanDate: "2026-06-15",
    dueDate: "2026-06-22",
    returnDate: "2026-06-21",
    status: "returned",
    fineAmount: 0
  },
  {
    id: "L-1002",
    userMatricula: "017495",
    userName: "Isidro Hernández Obregón",
    userCarrera: "Ingeniería en Sistemas Computacionales",
    bookId: "9786071514035",
    bookTitle: "Física Universitaria con Física Moderna Vol. 1",
    bookLocation: "E1N2",
    loanDate: "2026-06-20",
    dueDate: "2026-06-27",
    status: "in_progress",
    fineAmount: 0
  },
  {
    id: "L-1003",
    userMatricula: "017402",
    userName: "Valeria Hernández Hernández",
    userCarrera: "Licenciatura en Psicología",
    bookId: "9788448161118",
    bookTitle: "Psicología del Desarrollo: Infancia y Adolescencia",
    bookLocation: "E3N1",
    loanDate: "2026-06-10",
    dueDate: "2026-06-17",
    status: "overdue",
    fineAmount: 315 // 7 days * $45 MXN
  },
  {
    id: "L-1004",
    userMatricula: "018210",
    userName: "María Fernanda Gámez Garza",
    userCarrera: "Licenciatura en Administración de Empresas",
    bookId: "9786074423884",
    bookTitle: "Principios de Marketing",
    bookLocation: "E2N2",
    loanDate: "2026-06-22",
    dueDate: "2026-06-29",
    status: "in_progress",
    fineAmount: 0
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "ACT-001",
    type: "loan",
    userName: "María Fernanda Gámez Garza",
    userMatricula: "018210",
    bookTitle: "Principios de Marketing",
    date: "2026-06-22T10:30:00Z",
    status: "En Curso"
  },
  {
    id: "ACT-002",
    type: "return",
    userName: "Patricio Ávila Izaguirre",
    userMatricula: "017497",
    bookTitle: "Cálculo de una Variable",
    date: "2026-06-21T14:15:00Z",
    status: "Devuelto"
  },
  {
    id: "ACT-003",
    type: "user_register",
    userName: "Eduardo Martin Pérez Hernández",
    userMatricula: "017567",
    bookTitle: "Registro de cuenta de usuario",
    date: "2026-06-19T09:00:00Z",
    status: "Completado"
  },
  {
    id: "ACT-004",
    type: "book_register",
    userName: "Bibliotecaria Lux",
    userMatricula: "ADMIN",
    bookTitle: "Tesis: Optimización de Algoritmos",
    date: "2026-06-18T16:45:00Z",
    status: "Registrado"
  }
];

export const SHELF_LOCATIONS: Location[] = [
  { code: "E1N1", shelf: 1, level: 1, name: "Estante 1 - Nivel 1" },
  { code: "E1N2", shelf: 1, level: 2, name: "Estante 1 - Nivel 2" },
  { code: "E1N3", shelf: 1, level: 3, name: "Estante 1 - Nivel 3" },
  { code: "E2N1", shelf: 2, level: 1, name: "Estante 2 - Nivel 1" },
  { code: "E2N2", shelf: 2, level: 2, name: "Estante 2 - Nivel 2" },
  { code: "E2N3", shelf: 2, level: 3, name: "Estante 2 - Nivel 3" },
  { code: "E3N1", shelf: 3, level: 1, name: "Estante 3 - Nivel 1" },
  { code: "E3N2", shelf: 3, level: 2, name: "Estante 3 - Nivel 2" },
  { code: "E3N3", shelf: 3, level: 3, name: "Estante 3 - Nivel 3" }
];
