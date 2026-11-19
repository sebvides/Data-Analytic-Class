import React, { useState, useMemo } from 'react';
import { CurrencyMode, MediaKey } from '../types/media';
import { 
  RAW_MEDIA_DATA, 
  MEDIA_METAS, 
  ALL_MEDIA_KEYS, 
  formatCurrencyValue, 
  formatValueCompact, 
  convertValue 
} from '../data/mediaData';
import { 
  Table2, 
  Search, 
  ArrowUpDown, 
  Download, 
  SlidersHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface DataTableViewProps {
  currencyMode: CurrencyMode;
  onExportCSV: () => void;
}

export const DataTableView: React.FC<DataTableViewProps> = ({ currencyMode, onExportCSV }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let list = [...RAW_MEDIA_DATA];

    if (searchTerm.trim() !== '') {
      list = list.filter((r) => r.year.toString().includes(searchTerm.trim()));
    }

    list.sort((a, b) => {
      let valA: any = a[sortField as keyof typeof a];
      let valB: any = b[sortField as keyof typeof b];

      if (valA === null || valA === undefined) valA = -999999999;
      if (valB === null || valB === undefined) valB = -999999999;

      if (sortDirection === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    return list;
  }, [searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header & Search */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Registro Histórico Completo de Inversión (1995 – 2025)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Base de datos oficial con 31 observaciones anuales y variables macroeconómicas asociadas
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar año..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-32 sm:w-40 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleSort('year')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100/80 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Año</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('digital')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap text-blue-700"
              >
                Digital
              </th>
              <th
                onClick={() => handleSort('tvNacional')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap text-emerald-700"
              >
                TV Nac.
              </th>
              <th
                onClick={() => handleSort('radio')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap text-amber-700"
              >
                Radio
              </th>
              <th
                onClick={() => handleSort('pubExterior')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap text-purple-700"
              >
                Exterior
              </th>
              <th
                onClick={() => handleSort('prensa')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap text-rose-700"
              >
                Prensa
              </th>
              <th
                onClick={() => handleSort('tvRegional')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap text-cyan-700"
              >
                TV Reg.
              </th>
              <th
                onClick={() => handleSort('revistas')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap text-pink-700"
              >
                Revistas
              </th>
              <th
                onClick={() => handleSort('totalInv')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap font-bold text-slate-900 bg-slate-100/60"
              >
                Total Inversión
              </th>
              <th
                onClick={() => handleSort('internetPenetration')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap"
              >
                Internet (%)
              </th>
              <th
                onClick={() => handleSort('trm')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap"
              >
                TRM ($ COP)
              </th>
              <th
                onClick={() => handleSort('ipc')}
                className="py-3 px-2 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap"
              >
                IPC (%)
              </th>
              <th
                onClick={() => handleSort('poblacionDane')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100/80 whitespace-nowrap"
              >
                Población
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredData.map((row) => {
              const digVal = convertValue(row.digital, row.year, currencyMode, row.trm);
              const tvNVal = convertValue(row.tvNacional, row.year, currencyMode, row.trm);
              const radVal = convertValue(row.radio, row.year, currencyMode, row.trm);
              const extVal = convertValue(row.pubExterior, row.year, currencyMode, row.trm);
              const preVal = convertValue(row.prensa, row.year, currencyMode, row.trm);
              const tvRVal = convertValue(row.tvRegional, row.year, currencyMode, row.trm);
              const revVal = convertValue(row.revistas, row.year, currencyMode, row.trm);
              const totVal = convertValue(row.totalInv, row.year, currencyMode, row.trm);

              return (
                <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                    {row.year}
                  </td>
                  <td className="py-2.5 px-2 text-right text-blue-700">
                    {formatValueCompact(digVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-emerald-700">
                    {formatValueCompact(tvNVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-amber-700">
                    {formatValueCompact(radVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-purple-700">
                    {formatValueCompact(extVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-rose-700">
                    {formatValueCompact(preVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-cyan-700">
                    {formatValueCompact(tvRVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-pink-700">
                    {formatValueCompact(revVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 bg-slate-50/50">
                    {formatValueCompact(totVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-600">
                    {row.internetPenetration}%
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-600">
                    ${row.trm.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-600">
                    {row.ipc}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 font-sans">
                    {(row.poblacionDane / 1000000).toFixed(1)}M
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Mostrando {filteredData.length} registros (1995-2025)</span>
        <span>Fuente: Registro consolidado de inversión en medios Colombia & DANE</span>
      </div>
    </div>
  );
};
