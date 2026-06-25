import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldAlert } from 'lucide-react';
import logo from '../assets/logo oficial.png';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated login process
    setTimeout(() => {
      // Allow any email ending with lux.edu.mx or a specific admin account
      if (email.toLowerCase() === 'admin@lux.edu.mx' && password === 'admin123') {
        localStorage.setItem('sgbu_authenticated', 'true');
        navigate('/');
      } else {
        setError('Credenciales incorrectas. Pruebe con el correo y contraseña predeterminados.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-left select-none">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-8 relative overflow-hidden">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>

        {/* Branding header */}
        <div className="text-center space-y-4">
          <img
            src={logo}
            alt="Universidad Lux Logo"
            className="h-24 w-auto mx-auto object-contain drop-shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/150x50/0b3c70/ffffff?text=LUX';
            }}
          />
          <div className="space-y-1">
            <h1 className="font-heading font-extrabold text-2xl text-gray-800 tracking-tight">SGBU</h1>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Sistema de Gestión de Biblioteca
            </p>
          </div>
        </div>

        {/* Credentials Suggestion Banner */}
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
          <ShieldAlert className="text-primary mt-0.5 shrink-0" size={16} />
          <div className="text-xs text-primary-hover">
            <p className="font-bold">Acceso de Simulación:</p>
            <p className="font-medium mt-0.5">
              Correo: <span className="font-mono font-semibold select-all">admin@lux.edu.mx</span><br />
              Contraseña: <span className="font-mono font-semibold select-all">admin123</span>
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email input */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@lux.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all bg-gray-50/50"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all bg-gray-50/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:bg-primary-hover/50 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg focus:outline-none cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Validando...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer copyright */}
      <p className="mt-8 text-center text-xs text-gray-400 font-medium">
        © {new Date().getFullYear()} Universidad Lux. Todos los derechos reservados.
      </p>
    </div>
  );
};
export default Login;
