import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Save, 
  Plus, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  Upload, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLibrary } from '../hooks/useLibraryStore';
import confetti from 'canvas-confetti';

export const Books: React.FC = () => {
  const { books, addBook, addBooks } = useLibrary();

  // Form states (Single Register)
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

  // Excel states
  const [previewBooks, setPreviewBooks] = useState<any[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [importing, setImporting] = useState(false);

  // Pagination parameters
  const itemsPerPage = 6;

  // Statistics
  const totalTitles = books.length;
  const availableCount = books.filter(b => b.status === 'available').length;
  const loanedCount = books.filter(b => b.status === 'loaned').length;

  // Handle Form Submit (Add single book)
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

  // Download Sample Excel Template
  const downloadTemplate = () => {
    const headers = [['ISBN', 'Título', 'Autor', 'Año', 'Licenciatura', 'Asesor', 'Ubicación']];
    const sampleData = [
      ['9786071511522', 'Cálculo de una Variable', 'James Stewart', 2018, 'Ingeniería en Sistemas Computacionales', 'Ing. Carrizales Pinal Emma', 'E1N1'],
      ['9786071514035', 'Física Universitaria', 'Sears y Zemansky', 2020, 'Ingeniería en Sistemas Computacionales', 'Ing. Carrizales Pinal Emma', 'E1N2'],
      ['T-018210', 'Tesis: Diseño Organizacional', 'Gámez Garza María Fernanda', 2026, 'Licenciatura en Administración de Empresas', 'Lic. Alberto Gómez Treviño', 'E2N2']
    ];

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Libros');
    XLSX.writeFile(wb, 'plantilla_importacion_libros.xlsx');
  };

  // Handle Excel Upload and Parsing
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });

        if (data.length <= 1) {
          setError('El archivo Excel está vacío o no contiene filas de datos.');
          return;
        }

        // Map columns by matching headers
        const rawHeaders = data[0] as any[];
        const headers = rawHeaders.map(h => String(h || '').toLowerCase().trim());
        
        const colIndices = {
          id: headers.findIndex(h => h.includes('id') || h.includes('isbn') || h.includes('codigo') || h.includes('código')),
          title: headers.findIndex(h => h.includes('título') || h.includes('titulo') || h.includes('title') || h.includes('nombre')),
          author: headers.findIndex(h => h.includes('autor') || h.includes('author') || h.includes('escritor')),
          year: headers.findIndex(h => h.includes('año') || h.includes('ano') || h.includes('year') || h.includes('fecha')),
          licenciatura: headers.findIndex(h => h.includes('licenciatura') || h.includes('carrera') || h.includes('major')),
          advisor: headers.findIndex(h => h.includes('asesor') || h.includes('advisor') || h.includes('director')),
          locationCode: headers.findIndex(h => h.includes('ubicación') || h.includes('ubicacion') || h.includes('estante') || h.includes('location') || h.includes('código de ubicación') || h.includes('codigo de ubicacion'))
        };

        // Verification of headers
        if (colIndices.title === -1 || colIndices.author === -1 || colIndices.licenciatura === -1) {
          setError('El Excel debe incluir al menos las columnas: "Título", "Autor" y "Licenciatura".');
          return;
        }

        const parsedBooks: any[] = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i] as any[];
          if (!row || row.length === 0) continue;

          const titleVal = colIndices.title !== -1 ? row[colIndices.title] : '';
          const authorVal = colIndices.author !== -1 ? row[colIndices.author] : '';
          
          // Skip completely empty rows
          if (!titleVal && !authorVal) continue;

          if (!titleVal || !authorVal) {
            console.warn(`Row ${i} skipped: Title or Author is missing.`);
            continue;
          }

          const idVal = colIndices.id !== -1 && row[colIndices.id]
            ? String(row[colIndices.id]).trim()
            : `ISBN-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;

          const yearVal = colIndices.year !== -1 && !isNaN(Number(row[colIndices.year]))
            ? Number(row[colIndices.year])
            : new Date().getFullYear();

          const licenciaturaVal = colIndices.licenciatura !== -1 && row[colIndices.licenciatura]
            ? String(row[colIndices.licenciatura]).trim()
            : 'General';

          const advisorVal = colIndices.advisor !== -1 && row[colIndices.advisor] 
            ? String(row[colIndices.advisor]).trim() 
            : undefined;
          
          let locationCodeVal = colIndices.locationCode !== -1 && row[colIndices.locationCode]
            ? String(row[colIndices.locationCode]).trim().toUpperCase()
            : 'E1N1';
          
          // Verify shelf patterns (E1N1 - E3N3)
          if (!/^[E][1-3][N][1-3]$/.test(locationCodeVal)) {
            locationCodeVal = 'E1N1'; // fallback
          }

          parsedBooks.push({
            id: idVal,
            title: String(titleVal).trim(),
            author: String(authorVal).trim(),
            year: yearVal,
            licenciatura: licenciaturaVal,
            advisor: advisorVal,
            locationCode: locationCodeVal
          });
        }

        if (parsedBooks.length === 0) {
          setError('No se encontraron libros válidos en el archivo Excel.');
          return;
        }

        setPreviewBooks(parsedBooks);
        setShowPreviewModal(true);
      } catch (err: any) {
        setError('Error al leer el archivo Excel: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
    // Clear value to allow upload of the same file again
    e.target.value = '';
  };

  // Confirm and Execute Import to Supabase
  const handleConfirmImport = async () => {
    setImporting(true);
    setError('');
    
    try {
      const res = await addBooks(previewBooks);
      if (res.success) {
        setSuccessMsg(res.message);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        setShowPreviewModal(false);
        setPreviewBooks([]);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar los libros en la base de datos.');
    } finally {
      setImporting(false);
    }
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

  // Filtered books with lazy search starting at 3 characters
  const filteredBooks = books.filter(book => {
    const isSearchActive = searchTerm.trim().length >= 3;
    const matchesSearch = isSearchActive
      ? book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.id.includes(searchTerm) ||
        book.locationCode.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
      
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
        
        {/* Left Column: Form lateral + Importador Excel */}
        <div className="space-y-6">
          {/* Card 1: Nuevo Registro */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Plus className="text-primary" size={20} />
              <h3 className="font-heading font-bold text-lg text-gray-800">Nuevo Registro</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && !showPreviewModal && <p className="text-xs text-red-500 font-medium bg-red-50 p-2 border border-red-100 rounded-xl">{error}</p>}
              {successMsg && <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2 border border-emerald-100 rounded-xl">{successMsg}</p>}

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

          {/* Card 2: Importación Lote (Excel) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6 text-left">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <FileSpreadsheet className="text-secondary" size={20} />
              <h3 className="font-heading font-bold text-lg text-gray-800">Carga Masiva (Excel)</h3>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Registra varios volúmenes al mismo tiempo subiendo un archivo de Excel (.xlsx, .xls).
            </p>

            {/* Dropzone Container */}
            <div className="relative border-2 border-dashed border-gray-200 hover:border-secondary rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all bg-gray-50/50 hover:bg-gray-100/30 group">
              <Upload className="text-gray-400 group-hover:text-secondary group-hover:scale-110 transition-all stroke-[1.5]" size={32} />
              <div className="text-center">
                <label htmlFor="excel-file-upload" className="text-xs font-bold text-secondary hover:underline cursor-pointer">
                  Selecciona tu archivo
                </label>
                <span className="text-[10px] text-gray-400 block mt-0.5">o arrástralo aquí (.xlsx)</span>
              </div>
              <input
                id="excel-file-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
            </div>

            <button
              onClick={downloadTemplate}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-gray-200"
            >
              <FileSpreadsheet size={12} className="text-emerald-600" />
              <span>Descargar Plantilla Excel</span>
            </button>
          </div>
        </div>

        {/* Right Column: Catalog Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[500px]">
          
          {/* Filters Bar */}
          <div className="p-6 border-b border-gray-100 space-y-4">
            <h3 className="font-heading font-bold text-lg text-gray-800">Catálogo de Materiales</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col relative justify-center">
                <input
                  type="text"
                  placeholder="Buscar por título, autor..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary"
                />
                {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
                  <span className="text-[9px] text-amber-600 font-bold mt-1 animate-pulse">
                    ⚠️ Mínimo 3 letras para filtrar...
                  </span>
                )}
              </div>

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

      {/* Excel Preview & Import Confirmation Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl flex flex-col max-h-[85vh] text-left border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-secondary" size={24} />
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-gray-800">
                    Vista Previa de Importación
                  </h3>
                  <p className="text-[11px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wide">
                    Se encontraron {previewBooks.length} libros listos para guardar en Supabase.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewBooks([]);
                }}
                disabled={importing}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Table preview of parsed books */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider select-none">
                      <th className="px-4 py-3">ISBN / Código</th>
                      <th className="px-4 py-3">Título</th>
                      <th className="px-4 py-3">Autor</th>
                      <th className="px-4 py-3">Año</th>
                      <th className="px-4 py-3">Carrera</th>
                      <th className="px-4 py-3">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                    {previewBooks.map((book, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-gray-500">{book.id}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 italic">{book.title}</td>
                        <td className="px-4 py-3 text-gray-600">{book.author}</td>
                        <td className="px-4 py-3 font-medium text-gray-500">{book.year}</td>
                        <td className="px-4 py-3 text-gray-500 truncate max-w-[140px]">{book.licenciatura}</td>
                        <td className="px-4 py-3 font-bold font-mono text-secondary">{book.locationCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 bg-white">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                <AlertTriangle size={14} className="shrink-0" />
                <span>Revisa la estructura de los campos antes de confirmar.</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewBooks([]);
                  }}
                  disabled={importing}
                  className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary-hover/50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-md disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Guardando en BD...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Confirmar Importación</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
