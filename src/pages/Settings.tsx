import React, { useState } from 'react';
import { Save, Calendar, DollarSign, BookOpen, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Settings: React.FC = () => {
  // Settings states loaded from localstorage or defaults
  const [loanPeriod, setLoanPeriod] = useState(() => {
    return Number(localStorage.getItem('sgbu_setting_loan_period') || 7);
  });
  const [fineAmount, setFineAmount] = useState(() => {
    return Number(localStorage.getItem('sgbu_setting_fine_amount') || 45);
  });
  const [maxLoans, setMaxLoans] = useState(() => {
    return Number(localStorage.getItem('sgbu_setting_max_loans') || 3);
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('sgbu_setting_loan_period', String(loanPeriod));
    localStorage.setItem('sgbu_setting_fine_amount', String(fineAmount));
    localStorage.setItem('sgbu_setting_max_loans', String(maxLoans));
    
    setSaveSuccess(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });

    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 text-left max-w-2xl">
      {/* Page Header */}
      <div>
        <h2 className="font-heading font-bold text-3xl text-gray-800">Ajustes y Configuración</h2>
        <p className="text-gray-500 text-sm mt-1">
          Ajusta los plazos predeterminados, tarifas de penalización por entrega tardía y límites operativos.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6 relative">
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Configuración guardada exitosamente. Los plazos operativos han sido actualizados.</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Fine amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={16} className="text-secondary" />
              <span>Multa por día de retraso (MXN)</span>
            </label>
            <input
              type="number"
              value={fineAmount}
              onChange={(e) => setFineAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all bg-gray-50/50"
              min={0}
              required
            />
            <p className="text-[10px] text-gray-400">
              Monto a cobrar por cada día de mora acumulado después del plazo límite de devolución.
            </p>
          </div>

          {/* Standard loan period */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={16} className="text-secondary" />
              <span>Plazo estándar de préstamos (Días)</span>
            </label>
            <input
              type="number"
              value={loanPeriod}
              onChange={(e) => setLoanPeriod(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all bg-gray-50/50"
              min={1}
              required
            />
            <p className="text-[10px] text-gray-400">
              Número de días sugerido por defecto al realizar una nueva boleta de préstamo.
            </p>
          </div>

          {/* Maximum loans per user */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={16} className="text-secondary" />
              <span>Límite de préstamos simultáneos por alumno</span>
            </label>
            <input
              type="number"
              value={maxLoans}
              onChange={(e) => setMaxLoans(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all bg-gray-50/50"
              min={1}
              required
            />
            <p className="text-[10px] text-gray-400">
              Cantidad máxima de libros físicos que un alumno puede tener en préstamo simultáneamente.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-md"
          >
            <Save size={16} />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default Settings;
