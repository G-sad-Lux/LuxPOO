import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import NewUser from '../pages/NewUser';
import Books from '../pages/Books';
import Loans from '../pages/Loans';
import Locations from '../pages/Locations';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Administration Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="usuarios/nuevo" element={<NewUser />} />
          <Route path="libros" element={<Books />} />
          <Route path="prestamos" element={<Loans />} />
          <Route path="ubicaciones" element={<Locations />} />
          <Route path="reportes" element={<Reports />} />
          <Route path="configuracion" element={<Settings />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};
export default AppRouter;
