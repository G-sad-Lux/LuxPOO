import React, { useState, useEffect, useRef } from 'react';
import { MapPin, QrCode, Download, Printer, Database, FileText, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useLibrary } from '../hooks/useLibraryStore';

export const Locations: React.FC = () => {
  const { books } = useLibrary();
  const [selectedLoc, setSelectedLoc] = useState('E1N1');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // List of shelves
  const shelves = [
    { id: 1, name: 'Estante 1 (Sistemas / Computación)' },
    { id: 2, name: 'Estante 2 (Negocios / Administración)' },
    { id: 3, name: 'Estante 3 (Psicología / Humanidades)' }
  ];

  const levels = [3, 2, 1]; // From top (N3) to bottom (N1)

  // Filter books in the selected location coordinate
  const locationBooks = books.filter(b => b.locationCode === selectedLoc);

  // Render a real scannable QR code containing the location code
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, selectedLoc, {
      width: 200,
      margin: 2,
      color: {
        dark: '#0B3C70',  // Dark pixels (primary blue)
        light: '#FFFFFF'  // Light background
      }
    }, (error) => {
      if (error) console.error('Error generating QR Code:', error);
    });
  }, [selectedLoc]);

  // Download QR Code Simulation
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${selectedLoc}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Print QR simulation
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir QR de Ubicación - ${selectedLoc}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
              img { border: 2px solid #ccc; padding: 10px; width: 300px; height: 300px; }
              h1 { color: #0B3C70; margin-bottom: 5px; }
              p { color: #666; margin-top: 5px; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>Universidad Lux</h1>
            <h2>Ubicación Física: ${selectedLoc}</h2>
            <img src="${url}" />
            <p>Escanear para ver los libros catalogados en este nivel.</p>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div>
        <h2 className="font-heading font-bold text-3xl text-gray-800">Ubicaciones y QR</h2>
        <p className="text-gray-500 text-sm mt-1">
          Navega por las estanterías de la biblioteca, descarga códigos QR de inventario y localiza ejemplares.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Interactive Shelf Grid - Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-heading font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="text-primary" size={20} />
              <span>Mapa Visual de Estanterías</span>
            </h3>

            <div className="space-y-8">
              {shelves.map((shelf) => (
                <div key={shelf.id} className="p-5 rounded-2xl border border-gray-200/80 bg-gray-50/50">
                  <h4 className="font-heading font-bold text-sm text-gray-700 mb-4">{shelf.name}</h4>
                  
                  {/* Grid levels */}
                  <div className="grid grid-cols-3 gap-4">
                    {levels.map((lvl) => {
                      const code = `E${shelf.id}N${lvl}`;
                      const isSelected = selectedLoc === code;
                      
                      // Count books in this cell
                      const bookCount = books.filter(b => b.locationCode === code).length;

                      return (
                        <button
                          key={code}
                          onClick={() => setSelectedLoc(code)}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-center
                            ${isSelected
                              ? 'bg-primary border-primary text-white shadow-md scale-102'
                              : 'bg-white border-gray-200 hover:border-primary text-gray-700 hover:bg-primary/5'
                            }
                          `}
                        >
                          <span className="font-heading font-bold text-xs uppercase tracking-wider">Nivel {lvl}</span>
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full
                            ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
                          `}>
                            {code}
                          </span>
                          <span className={`text-[10px] font-semibold mt-1
                            ${isSelected ? 'text-blue-200' : 'text-gray-400'}
                          `}>
                            {bookCount} {bookCount === 1 ? 'libro' : 'libros'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (QR Visualizer Module) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
            <QrCode className="text-primary" size={20} />
            <h3 className="font-heading font-bold text-lg text-gray-800">Código QR</h3>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-2xl">
            <canvas 
              ref={canvasRef} 
              width={200} 
              height={200}
              className="border border-gray-200 rounded-xl bg-white shadow-sm"
            />
            <p className="font-heading font-bold text-primary mt-3 text-sm tracking-wider">
              Ubicación: {selectedLoc}
            </p>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-xl flex items-center gap-1.5 font-bold">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Código descargado exitosamente.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-secondary hover:bg-secondary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Download size={14} />
              <span>Descargar</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Printer size={14} />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

      </div>

      {/* Table section: Shelf Inventory */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="text-secondary" size={20} />
            <h3 className="font-heading font-bold text-lg text-gray-800">
              Inventario en Ubicación <span className="font-mono text-secondary">{selectedLoc}</span>
            </h3>
          </div>
          <button
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <FileText size={14} />
            <span>Imprimir Inventario</span>
          </button>
        </div>

        {locationBooks.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            No hay ningún libro asignado físicamente a la ubicación {selectedLoc}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
                  <th className="px-6 py-4">Título del Libro / Tesis</th>
                  <th className="px-6 py-4">Autor</th>
                  <th className="px-6 py-4">Licenciatura / Carrera</th>
                  <th className="px-6 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {locationBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div>
                        <p className="italic font-medium">{book.title}</p>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">ID: {book.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{book.author}</td>
                    <td className="px-6 py-4 text-gray-500">{book.licenciatura}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase
                        ${book.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}
                      `}>
                        {book.status === 'available' ? 'Disponible' : 'Prestado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Locations;
