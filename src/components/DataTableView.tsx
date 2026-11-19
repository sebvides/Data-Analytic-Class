import React, { useState, useMemo } from 'react';
import { CurrencyMode } from '../types/media';
import {
  RAW_MEDIA_DATA,
  formatValueCompact,
  convertValue,
} from '../data/mediaData';
import {
  Search,
  ArrowUpDown,
  Download,
} from 'lucide-react';

interface DataTableViewProps {
  currencyMode: CurrencyMode;
  onExportCSV: () => void;
}

export const DataTableView: React.FC<DataTableViewProps> = ({ currencyMode, onExportCSV }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
    <section className="bg-white rounded-lg border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-stone-500">Anexo Estadístico · Serie 1995–2025</div>
          <h2 className="font-serif text-xl font-semibold text-stone-950 mt-0.5">
            Registro Histórico Completo de Inversión en Medios
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Filtrar año..."
              aria-label="Filtrar tabla por año"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-stone-300 rounded-md pl-8 pr-3 py-1.5 w-32 sm:w-40 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-blue-800"
            />
          </div>

          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200 sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleSort('year')}
                className="py-3.5 px-4 cursor-pointer hover:bg-stone-100 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Año</span>
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('digital')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap text-blue-800"
              >
                Digital
              </th>
              <th
                onClick={() => handleSort('tvNacional')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap text-emerald-800"
              >
                TV Nac.
              </th>
              <th
                onClick={() => handleSort('radio')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap text-amber-800"
              >
                Radio
              </th>
              <th
                onClick={() => handleSort('pubExterior')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap text-purple-800"
              >
                Exterior
              </th>
              <th
                onClick={() => handleSort('prensa')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap text-rose-800"
              >
                Prensa
              </th>
              <th
                onClick={() => handleSort('tvRegional')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap text-cyan-800"
              >
                TV Reg.
              </th>
              <th
                onClick={() => handleSort('revistas')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap text-pink-800"
              >
                Revistas
              </th>
              <th
                onClick={() => handleSort('totalInv')}
                className="py-3.5 px-3 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap font-bold text-stone-950 bg-stone-100/70"
              >
                Total Inversión
              </th>
              <th
                onClick={() => handleSort('internetPenetration')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap"
              >
                Internet (%)
              </th>
              <th
                onClick={() => handleSort('trm')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap"
              >
                TRM (COP)
              </th>
              <th
                onClick={() => handleSort('ipc')}
                className="py-3.5 px-2.5 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap"
              >
                IPC (%)
              </th>
              <th
                onClick={() => handleSort('poblacionDane')}
                className="py-3.5 px-4 text-right cursor-pointer hover:bg-stone-100 whitespace-nowrap"
              >
                Población
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 font-mono tabular-nums">
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
                <tr key={row.year} className="hover:bg-stone-50 transition-colors">
                  <td className="py-2.5 px-4 font-sans font-bold text-stone-950">
                    {row.year}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-blue-800">
                    {formatValueCompact(digVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-emerald-800">
                    {formatValueCompact(tvNVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-amber-800">
                    {formatValueCompact(radVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-purple-800">
                    {formatValueCompact(extVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-rose-800">
                    {formatValueCompact(preVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-cyan-800">
                    {formatValueCompact(tvRVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-pink-800">
                    {formatValueCompact(revVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-stone-950 bg-stone-50/70">
                    {formatValueCompact(totVal, currencyMode)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-stone-600">
                    {row.internetPenetration}%
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-stone-600">
                    ${row.trm.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-stone-600">
                    {row.ipc}%
                  </td>
                  <td className="py-2.5 px-4 text-right text-stone-500 font-sans">
                    {(row.poblacionDane / 1000000).toFixed(1)}M
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={13} className="py-10 text-center font-sans text-stone-500">
                  No se encontraron registros para el año "{searchTerm}".{' '}
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-blue-800 font-semibold hover:underline cursor-pointer"
                  >
                    Restablecer filtro
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3.5 bg-[#FAF9F6] border-t border-stone-200 text-xs text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Mostrando {filteredData.length} de {RAW_MEDIA_DATA.length} registros anuales (1995–2025)</span>
        <span>Fuente: Observatorio de Inversión en Medios Colombia · DANE · Banco de la República</span>
      </div>
    </section>
  );
};
