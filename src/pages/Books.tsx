import React, { useState } from 'react';
import { BookOpen, CheckCircle, Save, Plus, ArrowLeftRight } from 'lucide-react';
import { useLibrary } from '../hooks/useLibraryStore';
import confetti from 'canvas-confetti';

export const Books: React.FC = () => {
  const { books, addBook } = useLibrary();

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [licenciatura, setLicenciatura] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [locationCode, setLocationCode] = useState('');
  
  // UI states
  const [filterLicenciatura, setFilterLicenciatura] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination parameters
  const itemsPerPage = 6;

  // Statistics
  const totalTitles = books.length;
  const availableCount = books.filter(b => b.status === 'available').length;
  const loanedCount = books.filter(b => b.status === 'loaned').length;

  // Handle Form Submit (Add book)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !author || !licenciatura || !locationCode) {
      setError('Por favor complete los campos obligatorios del formulario.');
      return;
    }

    // Save
    addBook({
      id: `ISBN-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`, // Simulate ISBN
      title,
      author,
      year: Number(year),
      licenciatura,
      advisor: advisor || undefined,
      locationCode
    });

    // Reset Form
    setTitle('');
    setAuthor('');
    setYear(new Date().getFullYear());
    setLicenciatura('');
    setAdvisor('');
    setLocationCode('');

    setSuccessMsg('¡Material catalogado exitosamente!');
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    
    // Clear message after 3 seconds
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Sort and Filter catalog
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered books
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.id.includes(searchTerm) ||
      book.locationCode.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesLicenciatura = filterLicenciatura ? book.licenciatura === filterLicenciatura : true;
    const matchesStatus = filterStatus ? book.status === filterStatus : true;
    
    return matchesSearch && matchesLicenciatura && matchesStatus;
  });

  // Sorted books
  const sortedBooks = [...filteredBooks].sort((a: any, b: any) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paged books
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const pagedBooks = sortedBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const licenciaturas = [
    "Ingeniería en Sistemas Computacionales",
    "Licenciatura en Administración de Empresas",
    "Licenciatura en Psicología",
    "Licenciatura en Criminología",
    "Licenciatura en Pedagogía",
    "Licenciatura en Derecho"
  ];

  // Estantes y niveles
  const shelfLocations = [
    "E1N1", "E1N2", "E1N3",
    "E2N1", "E2N2", "E2N3",
    "E3N1", "E3N2", "E3N3"
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div>
        <h2 className="font-heading font-bold text-3xl text-gray-800">Acervo Bibliográfico</h2>
        <p className="text-gray-500 text-sm mt-1">
          Catalogación, consulta de disponibilidad física y administración de libros y tesis.
        </p>
      </div>

      {/* Indicators cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Títulos</p>
            <h3 className="font-heading font-extrabold text-2xl text-gray-800 mt-1">{totalTitles}</h3>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 text-gray-500">
            <BookOpen size={20} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Disponibles</p>
            <h3 className="font-heading font-extrabold text-2xl text-emerald-600 mt-1">{availableCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle size={20} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prestados</p>
            <h3 className="font-heading font-extrabold text-2xl text-amber-600 mt-1">{loanedCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <ArrowLeftRight size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid: Lateral Form + Catalog Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form lateral */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <Plus className="text-primary" size={20} />
            <h3 className="font-heading font-bold text-lg text-gray-800">Nuevo Registro</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            {successMsg && <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Título del Material *</label>
              <input
                type="text"
                placeholder="Ej: Física Universitaria"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Autor *</label>
              <input
                type="text"
                placeholder="Ej: James Stewart"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Año publicación</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ubicación Física *</label>
                <select
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all bg-white"
                  required
                >
                  <option value="">Ubicación...</option>
                  {shelfLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Licenciatura / Carrera *</label>
              <select
                value={licenciatura}
                onChange={(e) => setLicenciatura(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all bg-white"
                required
              >
                <option value="">Seleccione carrera...</option>
                {licenciaturas.map((lic) => (
                  <option key={lic} value={lic}>{lic}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Asesor de Contenido (Tesis)</label>
              <input
                type="text"
                placeholder="Ej: Ing. Emma Carrizales Pinal"
                value={advisor}
                onChange={(e) => setAdvisor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Save size={14} />
              <span>Guardar Registro</span>
            </button>
          </form>
        </div>

        {/* Right Column: Catalog Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[500px]">
          
          {/* Filters Bar */}
          <div className="p-6 border-b border-gray-100 space-y-4">
            <h3 className="font-heading font-bold text-lg text-gray-800">Catálogo de Materiales</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Buscar por título, autor..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
              />

              <select
                value={filterLicenciatura}
                onChange={(e) => { setFilterLicenciatura(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary bg-white text-gray-600"
              >
                <option value="">Todas las Licenciaturas</option>
                {licenciaturas.map((lic) => (
                  <option key={lic} value={lic}>{lic}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary bg-white text-gray-600"
              >
                <option value="">Todos los Estados</option>
                <option value="available">Disponible</option>
                <option value="loaned">Prestado</option>
              </select>
            </div>
          </div>

          {/* Table content */}
          <div className="flex-1 overflow-x-auto">
            {pagedBooks.length === 0 ? (
              <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <BookOpen size={48} className="stroke-[1.2]" />
                <p className="text-sm font-semibold">No se encontraron materiales</p>
                <p className="text-xs text-gray-400 max-w-xs">Ajusta los filtros de búsqueda o registra un nuevo volumen en el formulario.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider select-none">
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')}>Título</th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('author')}>Autor</th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('licenciatura')}>Carrera</th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('locationCode')}>Ubicación</th>
                    <th className="px-6 py-4 text-right">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {pagedBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div>
                          <p className="italic font-medium">{book.title}</p>
                          <p className="text-[9px] text-gray-400 font-mono mt-0.5">ID: {book.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{book.author}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-[150px] truncate" title={book.licenciatura}>{book.licenciatura}</td>
                      <td className="px-6 py-4 font-semibold font-mono text-secondary">{book.locationCode}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase
                          ${book.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                        `}>
                          {book.status === 'available' ? 'Disponible' : 'Prestado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs select-none">
              <span className="text-gray-500">
                Página <span className="font-semibold text-gray-700">{currentPage}</span> de <span className="font-semibold text-gray-700">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg font-bold text-[10px] text-gray-600 disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg font-bold text-[10px] text-gray-600 disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Books;
