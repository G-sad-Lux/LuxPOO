-- Script para poblar la base de datos con datos de prueba (Mock Data)

-- 1. Insertar Usuarios
INSERT INTO users (matricula, name, carrera, email, photo_url, status, loan_count) VALUES
('017497', 'Patricio Ávila Izaguirre', 'Ingeniería en Sistemas Computacionales', 'patricio.avila@lux.edu.mx', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120', 'active', 2),
('017495', 'Isidro Hernández Obregón', 'Ingeniería en Sistemas Computacionales', 'isidro.hernandez@lux.edu.mx', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', 'active', 1),
('017402', 'Valeria Hernández Hernández', 'Licenciatura en Psicología', 'valeria.hernandez@lux.edu.mx', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', 'overdue', 3),
('017567', 'Eduardo Martin Pérez Hernández', 'Ingeniería en Sistemas Computacionales', 'eduardo.perez@lux.edu.mx', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', 'active', 0),
('018210', 'María Fernanda Gámez Garza', 'Licenciatura en Administración de Empresas', 'fernanda.garza@lux.edu.mx', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120', 'active', 1)
ON CONFLICT (matricula) DO UPDATE SET
name = EXCLUDED.name,
carrera = EXCLUDED.carrera,
email = EXCLUDED.email,
photo_url = EXCLUDED.photo_url,
status = EXCLUDED.status,
loan_count = EXCLUDED.loan_count;

-- 2. Insertar Libros
INSERT INTO books (id, title, author, year, licenciatura, advisor, location_code, status) VALUES
('9786071511522', 'Cálculo de una Variable: Trascendentes Tempranas', 'James Stewart', 2018, 'Ingeniería en Sistemas Computacionales', 'Ing. Carrizales Pinal Emma', 'E1N1', 'available'),
('9786071514035', 'Física Universitaria con Física Moderna Vol. 1', 'Sears y Zemansky', 2020, 'Ingeniería en Sistemas Computacionales', 'Ing. Carrizales Pinal Emma', 'E1N2', 'loaned'),
('9786071503121', 'Fundamentos de Sistemas de Bases de Datos', 'Ramez Elmasri', 2016, 'Ingeniería en Sistemas Computacionales', 'Ing. Carrizales Pinal Emma', 'E1N3', 'available'),
('9786071509130', 'Introducción a la Teoría General de la Administración', 'Idalberto Chiavenato', 2019, 'Licenciatura en Administración de Empresas', 'Lic. Alberto Gómez Treviño', 'E2N1', 'available'),
('9786074423884', 'Principios de Marketing', 'Philip Kotler', 2017, 'Licenciatura en Administración de Empresas', 'Lic. Alberto Gómez Treviño', 'E2N2', 'loaned'),
('9788448161118', 'Psicología del Desarrollo: Infancia y Adolescencia', 'David R. Shaffer', 2015, 'Licenciatura en Psicología', 'Dra. Sofía Rodríguez Ortiz', 'E3N1', 'loaned'),
('T-017402', 'Tesis: Desarrollo de Sistema SGBU de Gestión Bibliotecaria', 'Hernández Hernández Valeria', 2026, 'Ingeniería en Sistemas Computacionales', 'Ing. Carrizales Pinal Emma', 'E1N1', 'available'),
('T-017497', 'Tesis: Optimización de Algoritmos de Búsqueda Predictiva', 'Ávila Izaguirre Carlos Patricio', 2026, 'Ingeniería en Sistemas Computacionales', 'Ing. Carrizales Pinal Emma', 'E1N2', 'available'),
('9786071505293', 'Estructuras de Datos en Java', 'Mark Allen Weiss', 2013, 'Ingeniería en Sistemas Computacionales', 'Ing. Carrizales Pinal Emma', 'E1N3', 'available'),
('9786073238472', 'Comportamiento Organizacional', 'Stephen P. Robbins', 2017, 'Licenciatura en Administración de Empresas', 'Lic. Alberto Gómez Treviño', 'E2N3', 'available')
ON CONFLICT (id) DO UPDATE SET
title = EXCLUDED.title,
author = EXCLUDED.author,
year = EXCLUDED.year,
licenciatura = EXCLUDED.licenciatura,
advisor = EXCLUDED.advisor,
location_code = EXCLUDED.location_code,
status = EXCLUDED.status;

-- 3. Insertar Préstamos
INSERT INTO loans (id, user_matricula, book_id, loan_date, due_date, return_date, status, fine_amount) VALUES
('L-1001', '017497', '9786071511522', '2026-06-15', '2026-06-22', '2026-06-21', 'returned', 0),
('L-1002', '017495', '9786071514035', '2026-06-20', '2026-06-27', NULL, 'in_progress', 0),
('L-1003', '017402', '9788448161118', '2026-06-10', '2026-06-17', NULL, 'overdue', 315.00),
('L-1004', '018210', '9786074423884', '2026-06-22', '2026-06-29', NULL, 'in_progress', 0)
ON CONFLICT (id) DO UPDATE SET
user_matricula = EXCLUDED.user_matricula,
book_id = EXCLUDED.book_id,
loan_date = EXCLUDED.loan_date,
due_date = EXCLUDED.due_date,
return_date = EXCLUDED.return_date,
status = EXCLUDED.status,
fine_amount = EXCLUDED.fine_amount;

-- 4. Insertar Actividades
INSERT INTO activities (type, user_name, user_matricula, book_title, date, status) VALUES
('loan', 'María Fernanda Gámez Garza', '018210', 'Principios de Marketing', '2026-06-22 10:30:00+00', 'En Curso'),
('return', 'Patricio Ávila Izaguirre', '017497', 'Cálculo de una Variable', '2026-06-21 14:15:00+00', 'Devuelto'),
('user_register', 'Eduardo Martin Pérez Hernández', '017567', 'Registro de cuenta de usuario', '2026-06-19 09:00:00+00', 'Completado'),
('book_register', 'Bibliotecaria Lux', 'ADMIN', 'Tesis: Optimización de Algoritmos', '2026-06-18 16:45:00+00', 'Registrado');
