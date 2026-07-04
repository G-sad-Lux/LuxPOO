import React, { useState } from 'react';
import { Bell, Search, Globe, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLibrary } from '../../hooks/useLibraryStore';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, activities, books } = useLibrary();
  const [showNotifications, setShowNotifications] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter activities to show as alerts
  const alerts = activities.slice(0, 4);

  // Filter books matching search term (lazy search starting at 3 characters)
  const filteredBooks = searchQuery.trim().length >= 3
    ? books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleItemClick = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
      setSearchQuery('');
    }, 1200);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por título, autor o ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
        />

        {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
          <div className="absolute left-0 right-0 mt-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-[10px] text-amber-700 font-bold z-30 shadow-sm animate-pulse flex items-center gap-1">
            <span>⚠️ Escribe al menos 3 caracteres para buscar...</span>
          </div>
        )}
        
        {/* Autocomplete Dropdown List */}
        {searchQuery.trim().length >= 3 && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <p className="px-4 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
              Resultados del Acervo
            </p>
            {filteredBooks.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">
                No se encontraron materiales para "{searchQuery}"
              </div>
            ) : (
              filteredBooks.map(book => {
                const isCopied = copiedId === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => handleItemClick(book.id)}
                    className="w-full px-4 py-2.5 hover:bg-gray-50 flex flex-col gap-0.5 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-semibold text-gray-800 italic line-clamp-1 flex-1 pr-2">
                        {book.title}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0
                        ${isCopied 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : book.status === 'available' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-amber-50 text-amber-600'
                        }
                      `}>
                        {isCopied ? '¡Copiado!' : book.status === 'available' ? 'Disponible' : 'Prestado'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>{book.author} | Estante: {book.locationCode}</span>
                      <span className="font-mono text-[9px]">{book.id}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-6">
        {/* Campus Selection */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full bg-gray-50 select-none">
          <Globe size={14} className="text-secondary" />
          <span>Campus Monterrey</span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-500 hover:text-secondary rounded-xl hover:bg-gray-100 transition-colors relative cursor-pointer"
          >
            <Bell size={20} />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-gray-800">Notificaciones</h3>
                  <span className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded-full font-bold">
                    {alerts.length} nuevas
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex gap-3 text-xs last:border-b-0">
                      <div className="mt-0.5 shrink-0">
                        {alert.type === 'loan' ? (
                          <AlertCircle className="text-amber-500" size={14} />
                        ) : (
                          <CheckCircle2 className="text-emerald-500" size={14} />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-700">
                          <span className="font-semibold">{alert.userName}</span>{' '}
                          {alert.type === 'loan' ? 'solicitó prestado' : 'devolvió'}{' '}
                          <span className="font-medium italic">{alert.bookTitle}</span>
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(alert.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info header badge */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 select-none">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            LUX
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-gray-800">SGBU Admin</p>
            <p className="text-[10px] text-gray-400 font-medium">Universidad Lux</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
