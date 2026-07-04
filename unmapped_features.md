# 📋 Lista de Características Simuladas y Sin Funcionalidad (Backlog de Mapeo)

Este documento contiene un análisis detallado de las funcionalidades de la aplicación **SGBU** que actualmente están simuladas en el frontend (hardcodeadas) o no conectadas con las reglas de negocio reales.

---

## 1. Autenticación Real con Supabase Auth
* **Archivo:** [src/pages/Login.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/pages/Login.tsx) y [src/layouts/MainLayout.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/layouts/MainLayout.tsx)
* **Estado actual:** El inicio de sesión está simulado localmente. Valida que el correo termine en `lux.edu.mx` o coincida con `admin@lux.edu.mx` / `admin123`, y escribe un token falso en `localStorage.getItem('sgbu_authenticated')`.
* **Propuesta de Mapeo:** Usar `supabase.auth.signInWithPassword()` para autenticar administradores reales creados en el panel de autenticación de Supabase.

---

## 2. Registro Manual de ISBN / Código de Barras
* **Archivo:** [src/pages/Books.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/pages/Books.tsx)
* **Estado actual:** En el formulario de catalogación no hay campo para introducir el ISBN/ID del libro. Se autogenera un código aleatorio en el frontend: `ISBN-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`.
* **Propuesta de Mapeo:** Agregar un campo de texto `"ISBN / Código de Barras"` en el formulario lateral de registro de libros para poder registrar y buscar libros por su identificador real.

---

## 3. Conexión de Ajustes de Operación a la Lógica de Negocio
* **Archivo:** [src/pages/Settings.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/pages/Settings.tsx)
* **Estado actual:** Los ajustes (días de préstamo, multa diaria y límite de libros) se guardan en `localStorage` pero **no se aplican en la lógica de negocio**:
  1. **Monto de la multa:** En [Loans.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/pages/Loans.tsx#L129), la multa diaria por mora está hardcodeada a `$45` (`loan.fineAmount = diffDays * 45;`). Debería leerse el valor configurado en los ajustes.
  2. **Plazo de préstamo predeterminado:** En [Loans.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/pages/Loans.tsx#L17), el estado `loanDays` inicial de la barra deslizante de días está fijado en `7` en vez de usar el plazo por defecto configurado.
  3. **Límite de préstamos simultáneos:** La regla que impide a un alumno tener más de X préstamos activos (por defecto 3) no se valida en la función `createLoan` de [useLibraryStore.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/hooks/useLibraryStore.tsx).
* **Propuesta de Mapeo:**
  * Modificar `useLibraryStore` para leer y aplicar las variables de configuración en `createLoan` y al calcular multas.
  * Opcional: Crear una tabla `settings` en Supabase para persistir estas configuraciones globalmente en el servidor en lugar de en el navegador individual de cada bibliotecario.

---

## 4. Carga Real de Fotografías (Supabase Storage)
* **Archivo:** [src/pages/NewUser.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/pages/NewUser.tsx)
* **Estado actual:** Al hacer clic en "Simular Carga de Foto", el frontend elige un enlace aleatorio de retrato de Unsplash.
* **Propuesta de Mapeo:** Habilitar un input de tipo `file` para que el usuario pueda seleccionar una foto real e integrarlo con un bucket de almacenamiento en Supabase Storage (ej. `user-photos`) para guardar y servir las imágenes reales.

---

## 5. Simulador de Lector QR
* **Archivo:** [src/pages/Dashboard.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/pages/Dashboard.tsx)
* **Estado actual:** El modal para escanear QR simplemente solicita escribir un código de ubicación manualmente (ej: `E1N1`) en un input de texto.
* **Propuesta de Mapeo:** Integrar la cámara web del dispositivo usando una biblioteca ligera de escaneo (como `html5-qrcode` o `@zxing/library`) para que realmente pueda leer códigos QR impresos.

---

## 6. Exportación de Reportes a PDF y Excel
* **Archivo:** [src/pages/Reports.tsx](file:///C:/Users/Gsad/Documents/UNILUX/T5/POO/src/pages/Reports.tsx)
* **Estado actual:** Los botones "Exportar PDF" y "Exportar Excel" abren un modal simulado con un mensaje de espera de 3 segundos, pero no descargan ningún archivo real.
* **Propuesta de Mapeo:** Implementar descargas reales usando `jspdf` para PDF y `xlsx` / `sheetjs` para Excel, o bien crear una hoja de estilos de impresión CSS optimizada para que el navegador genere el PDF directamente.
