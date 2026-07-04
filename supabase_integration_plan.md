# Plan de Integración con Supabase para SGBU (Sistema de Gestión de Biblioteca)

Este documento detalla el análisis del código actual del frontend del proyecto y propone el esquema de base de datos, la configuración de Supabase y el plan de implementación para conectar el frontend a una base de datos PostgreSQL real administrada por Supabase.

---

## 1. Análisis del Código Actual y Características

El proyecto actual es un sistema de gestión de bibliotecas para la **Universidad Lux** desarrollado en **React, TypeScript y Vite**.

### Características Clave:
* **Vistas principales:**
  * **Dashboard:** Muestra estadísticas generales (total de libros, préstamos activos, usuarios morosos, etc.) y logs de actividad recientes.
  * **Usuarios (`/usuarios`):** Lista y permite registrar usuarios (alumnos con campos como matrícula, carrera, email, foto y conteo de préstamos).
  * **Materiales/Libros (`/libros`):** Catálogo de libros con ISBN/ID, título, autor, año, carrera/licenciatura correspondiente, asesor de tesis y ubicación en estantes.
  * **Préstamos (`/prestamos`):** Registro de nuevos préstamos de libros a usuarios, devoluciones, renovaciones y cálculo automático de multas por retraso.
  * **Ubicaciones (`/ubicaciones`):** Mapa interactivo de los estantes y niveles (ej: Estante 1 - Nivel 1, código `E1N1`).
  * **Reportes (`/reportes`):** Gráficos y estadísticas analíticas de libros prestados por carrera.

### Estado Actual de los Datos:
Todos los datos se manejan localmente en memoria y se persisten en el navegador usando `localStorage` mediante el contexto de React en [useLibraryStore.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/hooks/useLibraryStore.tsx).

---

## 2. Estructura de Base de Datos en Supabase (Esquema SQL)

Para migrar a Supabase, debemos crear las tablas correspondientes en la consola de Supabase. El siguiente script de SQL se debe ejecutar en el **SQL Editor** de Supabase:

```sql
-- Habilitar extensión UUID si no está activa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Ubicaciones (Locations)
CREATE TABLE locations (
    code TEXT PRIMARY KEY, -- Ej: E1N1
    shelf INT NOT NULL,
    level INT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar ubicaciones iniciales por defecto
INSERT INTO locations (code, shelf, level, name) VALUES
('E1N1', 1, 1, 'Estante 1 - Nivel 1'),
('E1N2', 1, 2, 'Estante 1 - Nivel 2'),
('E1N3', 1, 3, 'Estante 1 - Nivel 3'),
('E2N1', 2, 1, 'Estante 2 - Nivel 1'),
('E2N2', 2, 2, 'Estante 2 - Nivel 2'),
('E2N3', 2, 3, 'Estante 2 - Nivel 3'),
('E3N1', 3, 1, 'Estante 3 - Nivel 1'),
('E3N2', 3, 2, 'Estante 3 - Nivel 2'),
('E3N3', 3, 3, 'Estante 3 - Nivel 3')
ON CONFLICT (code) DO NOTHING;

-- 2. Tabla de Usuarios (Users)
CREATE TABLE users (
    matricula TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    carrera TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'overdue')),
    loan_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Libros (Books)
CREATE TABLE books (
    id TEXT PRIMARY KEY, -- ISBN o código de barra
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INT NOT NULL,
    licenciatura TEXT NOT NULL,
    advisor TEXT,
    location_code TEXT REFERENCES locations(code) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'loaned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Préstamos (Loans)
CREATE TABLE loans (
    id TEXT PRIMARY KEY, -- Ej: L-1001
    user_matricula TEXT NOT NULL REFERENCES users(matricula) ON DELETE CASCADE,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('returned', 'in_progress', 'overdue')),
    fine_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Historial/Actividades (Activities)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('loan', 'return', 'user_register', 'book_register')),
    user_name TEXT NOT NULL,
    user_matricula TEXT NOT NULL,
    book_title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL
);
```

---

## 3. Preparación e Instalación en el Frontend

### Paso A: Variables de Entorno
Crea un archivo llamado `.env.local` en la raíz del proyecto ([C:\Users\Gsad\Documents\UNILUX\T5\POO\.env.local](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/.env.local)) con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
```

### Paso B: Cliente de Supabase
Crearemos el archivo `src/utils/supabaseClient.ts` para inicializar el cliente que consumirá la base de datos:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials are not defined in environmental variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
```

---

## 4. Adaptación del Frontend al Backend

Para realizar la conexión definitiva, modificaremos [useLibraryStore.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/hooks/useLibraryStore.tsx) para que, en lugar de consultar y persistir en `localStorage`, realice consultas asíncronas directamente con el cliente `supabase`.

### Cambios a realizar en el Store:
1. **Inicialización y Carga de Datos (`useEffect`):**
   * Al cargar la app, haremos consultas `SELECT` a las tablas `users`, `books`, `loans` y `activities`.
   * Agregaremos un estado `loading` para manejar la carga inicial de datos.
2. **Método `addUser`:**
   * Guardará un nuevo registro en la tabla `users` mediante `supabase.from('users').insert(...)`.
   * Creará una nueva entrada en `activities` correspondiente.
3. **Método `addBook`:**
   * Registrará el libro en `books`.
4. **Método `createLoan`:**
   * Cambiará el estado del libro en la base de datos a `loaned`.
   * Incrementará `loan_count` en el registro del usuario.
   * Creará el préstamo en la tabla `loans`.
   * Registrará la actividad.
5. **Método `returnLoan` y `renewLoan`:**
   * Actualizará el préstamo y los estados correspondientes de libros y usuarios.

---

## 5. Mock de Datos a Importar en Supabase

Si deseas poblar tu base de datos de Supabase con los mismos datos de prueba que tenía el sistema local, podemos crear un script SQL específico con los registros iniciales que extrajimos de `mockData.ts`.
