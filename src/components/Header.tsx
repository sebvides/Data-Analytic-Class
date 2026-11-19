import React from 'react';
import { CurrencyMode } from '../types/media';
import { 
  BarChart3, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  Coins, 
  Calendar,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currencyMode: CurrencyMode;
  onCurrencyChange: (mode: CurrencyMode) => void;
  onOpenReport: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currencyMode,
  onCurrencyChange,
  onOpenReport,
  onExportCSV,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-inner">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Inversión en Medios en Colombia
                </h1>
                <span className="text-xs text-slate-400 font-mono">1995 – 2025</span>
              </div>
              <p className="text-xs text-slate-400">
                Observatorio de Inversión Publicitaria · Análisis Descriptivo, Tendencias y Pronósticos 2026-2030
              </p>
            </div>
          </div>

          {/* Controls: Currency switch & Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Currency Mode Selector */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/80 text-xs">
              <button
                type="button"
                onClick={() => onCurrencyChange('cop_nominal')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  currencyMode === 'cop_nominal'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Valores históricos en Millones de COP sin ajuste inflacionario"
              >
                COP Corrientes
              </button>
              <button
                type="button"
                onClick={() => onCurrencyChange('cop_real_2025')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  currencyMode === 'cop_real_2025'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Valores deflactados con IPC acumulado a poder adquisitivo de 2025"
              >
                COP Reales (Base 2025)
              </button>
              <button
                type="button"
                onClick={() => onCurrencyChange('usd')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  currencyMode === 'usd'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Convertido a Millones de USD a la TRM promedio de cada año"
              >
                USD (TRM)
              </button>
            </div>

            {/* Actions: Export & Report */}
            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              title="Descargar dataset completo con variables calculadas en CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Informe Ejecutivo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
