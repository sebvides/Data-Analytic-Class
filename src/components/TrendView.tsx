import React, { useState, useMemo } from 'react';
import { 
  CurrencyMode, 
  MediaKey 
} from '../types/media';
import { 
  RAW_MEDIA_DATA, 
  MEDIA_METAS, 
  ALL_MEDIA_KEYS, 
  formatCurrencyValue, 
  formatValueCompact, 
  convertValue 
} from '../data/mediaData';
import { 
  calculateMacroCorrelations, 
  calculateHHI, 
  calculateCAGR 
} from '../utils/statistics';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend, 
  ScatterChart, 
  Scatter, 
  ZAxis 
} from 'recharts';
import { 
  TrendingUp, 
  Layers, 
  Activity, 
  Globe, 
  DollarSign, 
  Clock, 
  CheckSquare, 
  Square,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface TrendViewProps {
  currencyMode: CurrencyMode;
}

export const TrendView: React.FC<TrendViewProps> = ({ currencyMode }) => {
  // Active media filter for main trend chart
  const [activeMedia, setActiveMedia] = useState<Record<MediaKey, boolean>>({
    digital: true,
    tvNacional: true,
    radio: true,
    pubExterior: true,
    prensa: true,
    tvRegional: true,
    revistas: true,
  });

  const [scaleType, setScaleType] = useState<'linear' | 'indexed'>('linear');
  const [macroVar, setMacroVar] = useState<'internet' | 'trm' | 'ipc'>('internet');

  // Multi-series trend chart data
  const trendData = useMemo(() => {
    // For indexed scale, base year is 2014 (first year with all 7 media recorded)
    const baseYearRec = RAW_MEDIA_DATA.find((d) => d.year === 2014);

    return RAW_MEDIA_DATA.map((r) => {
      const row: Record<string, any> = {
        year: r.year,
        totalInv: convertValue(r.totalInv, r.year, currencyMode, r.trm),
        internetPenetration: r.internetPenetration,
        trm: r.trm,
        ipc: r.ipc,
      };

      for (const k of ALL_MEDIA_KEYS) {
        const val = convertValue(r[k], r.year, currencyMode, r.trm);
        if (scaleType === 'indexed' && baseYearRec && val !== null) {
          const baseVal = convertValue(baseYearRec[k], 2014, currencyMode, baseYearRec.trm);
          row[k] = baseVal && baseVal > 0 ? Number(((val / baseVal) * 100).toFixed(1)) : null;
        } else {
          row[k] = val !== null ? Number(val.toFixed(1)) : null;
        }
      }
      return row;
    });
  }, [currencyMode, scaleType]);

  // Correlations
  const correlations = useMemo(() => calculateMacroCorrelations(), []);
  const hhiData = useMemo(() => calculateHHI(), []);

  // Eras CAGR Analysis
  const eras = [
    { name: 'Era Tradicional (1995-2007)', startYear: 1995, endYear: 2007 },
    { name: 'Emergencia Digital (2008-2014)', startYear: 2008, endYear: 2014 },
    { name: 'Disrupción y Pandemia (2015-2020)', startYear: 2015, endYear: 2020 },
    { name: 'Hegemonía Digital & DOOH (2021-2025)', startYear: 2021, endYear: 2025 },
  ];

  const erasCAGR = useMemo(() => {
    return eras.map((era) => {
      const startRec = RAW_MEDIA_DATA.find((d) => d.year === era.startYear)!;
      const endRec = RAW_MEDIA_DATA.find((d) => d.year === era.endYear)!;
      const yearsDiff = era.endYear - era.startYear;

      const results: Record<string, any> = { eraName: era.name };
      for (const k of ALL_MEDIA_KEYS) {
        const sVal = convertValue(startRec[k], startRec.year, currencyMode, startRec.trm);
        const eVal = convertValue(endRec[k], endRec.year, currencyMode, endRec.trm);
        if (sVal && eVal && sVal > 0 && eVal > 0 && yearsDiff > 0) {
          results[k] = Number(calculateCAGR(sVal, eVal, yearsDiff).toFixed(1));
        } else {
          results[k] = null;
        }
      }
      const sTot = convertValue(startRec.totalInv, startRec.year, currencyMode, startRec.trm)!;
      const eTot = convertValue(endRec.totalInv, endRec.year, currencyMode, endRec.trm)!;
      results.totalInv = Number(calculateCAGR(sTot, eTot, yearsDiff).toFixed(1));
      return results;
    });
  }, [currencyMode]);

  // Toggle helpers
  const toggleAll = (state: boolean) => {
    const updated: Record<MediaKey, boolean> = { ...activeMedia };
    ALL_MEDIA_KEYS.forEach((k) => (updated[k] = state));
    setActiveMedia(updated);
  };

  const selectPreset = (type: 'digital_vs_tv' | 'traditional' | 'print' | 'all') => {
    const next: Record<MediaKey, boolean> = {
      digital: false,
      tvNacional: false,
      radio: false,
      pubExterior: false,
      prensa: false,
      tvRegional: false,
      revistas: false,
    };
    if (type === 'digital_vs_tv') {
      next.digital = true;
      next.tvNacional = true;
    } else if (type === 'traditional') {
      next.tvNacional = true;
      next.radio = true;
      next.tvRegional = true;
    } else if (type === 'print') {
      next.prensa = true;
      next.revistas = true;
    } else {
      ALL_MEDIA_KEYS.forEach((k) => (next[k] = true));
    }
    setActiveMedia(next);
  };

  return (
    <div className="space-y-6">
      {/* Historical Milestones Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Hitos y Transiciones Clave del Mercado Colombiano (1995 – 2025)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="font-bold text-blue-700 font-mono mb-1">1998 - 2007 · Era TV & Prensa</div>
            <p className="text-slate-600 leading-relaxed">
              Consolidación de canales privados (Caracol y RCN). La TV Nacional representaba más del 50% de la inversión y la Prensa superaba los $500 mil millones COP.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="font-bold text-blue-700 font-mono mb-1">2008 - 2014 · Llegada de Digital</div>
            <p className="text-slate-600 leading-relaxed">
              Primer registro de inversión digital en 2008 con $40.6 mil millones COP (2.1% share). En 2014, Digital ya alcanzaba el 8.8% y la TV Nacional marcaba su pico histórico ($1.15 billones COP).
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="font-bold text-blue-700 font-mono mb-1">2020 · Choque Pandemia</div>
            <p className="text-slate-600 leading-relaxed">
              COVID-19 provocó caídas de hasta -55% en Publicidad Exterior y -40% en Prensa. Sin embargo, Digital creció +15.8% acelerando la migración de presupuestos.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <div className="font-bold text-blue-700 font-mono mb-1">2021 - 2025 · Hegemonía Digital</div>
            <p className="text-slate-600 leading-relaxed">
              En 2021 Digital superó a TV Nacional por primera vez. En 2025 alcanza el récord de $3.07 billones COP (59.7% share), mientras Publicidad Exterior (DOOH) resurge (+12.4%).
            </p>
          </div>
        </div>
      </div>

      {/* Main Multi-Media Evolution Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Evolución Histórica Multimedio (1995 – 2025)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {scaleType === 'linear'
                ? `Valores en ${
                    currencyMode === 'usd'
                      ? 'Millones de USD'
                      : currencyMode === 'cop_real_2025'
                      ? 'Millones COP Reales (2025)'
                      : 'Millones COP Corrientes'
                  }`
                : 'Índice de Crecimiento Relativo (Base 2014 = 100)'}
            </p>
          </div>

          {/* Quick presets and scale toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setScaleType('linear')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  scaleType === 'linear'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Escala Real
              </button>
              <button
                onClick={() => setScaleType('indexed')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  scaleType === 'indexed'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Normaliza todos los medios a 100 en 2014 para comparar velocidades de crecimiento"
              >
                Base 2014 = 100
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1">Filtros:</span>
              <button
                onClick={() => selectPreset('all')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
              >
                Todos
              </button>
              <button
                onClick={() => selectPreset('digital_vs_tv')}
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-medium"
              >
                Digital vs TV
              </button>
              <button
                onClick={() => selectPreset('traditional')}
                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[11px] font-medium"
              >
                Tradicionales
              </button>
              <button
                onClick={() => selectPreset('print')}
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-medium"
              >
                Impresos
              </button>
            </div>
          </div>
        </div>

        {/* Media filter toggles */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 text-xs">
          <span className="text-slate-500 font-medium mr-1 text-[11px]">Medios visibles:</span>
          {ALL_MEDIA_KEYS.map((k) => {
            const isChecked = activeMedia[k];
            const meta = MEDIA_METAS[k];
            return (
              <button
                key={k}
                onClick={() => setActiveMedia({ ...activeMedia, [k]: !isChecked })}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  isChecked
                    ? 'bg-white text-slate-800 shadow-2xs border border-slate-200'
                    : 'text-slate-400 hover:text-slate-600 bg-transparent'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: isChecked ? meta.color : '#cbd5e1',
                  }}
                />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* The Recharts Line Chart */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) =>
                  scaleType === 'indexed'
                    ? `${val}`
                    : formatValueCompact(val, currencyMode)
                }
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  scaleType === 'indexed'
                    ? `${val} pts`
                    : formatCurrencyValue(Number(val), currencyMode),
                  MEDIA_METAS[name as MediaKey]?.label || name,
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              {ALL_MEDIA_KEYS.map((k) => {
                if (!activeMedia[k]) return null;
                const meta = MEDIA_METAS[k];
                return (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    name={k}
                    stroke={meta.color}
                    strokeWidth={k === 'digital' || k === 'tvNacional' ? 2.5 : 1.8}
                    dot={{ r: 2.5, fill: meta.color }}
                    activeDot={{ r: 5 }}
                    connectNulls={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CAGR by Eras Table + Herfindahl Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CAGR by Historical Eras */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Tasa de Crecimiento Anual Compuesto (CAGR) por Eras
              </h2>
              <p className="text-xs text-slate-500">
                Rendimiento anualizado en cada periodo histórico
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              % Anual
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Periodo / Era</th>
                  <th className="py-2.5 px-2 text-right">Total Ind.</th>
                  <th className="py-2.5 px-2 text-right text-blue-600">Digital</th>
                  <th className="py-2.5 px-2 text-right text-emerald-600">TV Nac.</th>
                  <th className="py-2.5 px-2 text-right text-amber-600">Radio</th>
                  <th className="py-2.5 px-2 text-right text-purple-600">Exterior</th>
                  <th className="py-2.5 px-2 text-right text-rose-600">Prensa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {erasCAGR.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{row.eraName}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                      {row.totalInv !== null ? `${row.totalInv > 0 ? '+' : ''}${row.totalInv}%` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-blue-600 font-semibold">
                      {row.digital !== null ? `${row.digital > 0 ? '+' : ''}${row.digital}%` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                      {row.tvNacional !== null ? `${row.tvNacional > 0 ? '+' : ''}${row.tvNacional}%` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                      {row.radio !== null ? `${row.radio > 0 ? '+' : ''}${row.radio}%` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                      {row.pubExterior !== null ? `${row.pubExterior > 0 ? '+' : ''}${row.pubExterior}%` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-rose-600">
                      {row.prensa !== null ? `${row.prensa > 0 ? '+' : ''}${row.prensa}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Herfindahl-Hirschman Concentration Index */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                Índice de Concentración (HHI)
              </h2>
              <span className="text-xs text-blue-600 font-mono font-bold">
                {hhiData[hhiData.length - 1].hhi} pts (2025)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Mide la concentración del mercado (escala 0 a 10.000). Valores &gt; 2.500 indican alta concentración.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hhiData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[1000, 6500]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} pts`, 'Índice HHI']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hhi"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
            <span className="font-bold">Interpretación:</span> La industria pasó de un monopolio televisivo en los 90 (HHI &gt; 6.000) a un mercado muy diversificado entre 2010 y 2018 (HHI ~2.500), y ahora reconcentrado por la hegemonía digital (HHI &gt; 4.000).
          </div>
        </div>
      </div>

      {/* Macroeconomic Sensitivity & Correlation Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Sensibilidad y Correlación Macroeconómica
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Coeficiente de correlación de Pearson (-1.0 a +1.0) entre la inversión en medios y variables macro
            </p>
          </div>

          {/* Macro selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMacroVar('internet')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                macroVar === 'internet'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Penetración Internet (%)
            </button>
            <button
              onClick={() => setMacroVar('trm')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                macroVar === 'trm'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TRM (Dólar COP)
            </button>
            <button
              onClick={() => setMacroVar('ipc')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                macroVar === 'ipc'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inflación (IPC %)
            </button>
          </div>
        </div>

        {/* Correlation Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {correlations.map((c) => {
            const corrVal =
              macroVar === 'internet'
                ? c.corrInternet
                : macroVar === 'trm'
                ? c.corrTRM
                : c.corrIPC;

            const isPositive = corrVal >= 0;
            const intensity = Math.abs(corrVal);

            return (
              <div
                key={c.mediaKey}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between"
              >
                <div className="text-xs font-semibold text-slate-800 truncate" title={c.label}>
                  {c.label}
                </div>
                <div className="my-2">
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {corrVal > 0 ? '+' : ''}
                    {corrVal.toFixed(2)}
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        isPositive ? 'bg-blue-600' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(intensity * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  {intensity > 0.8
                    ? 'Muy alta'
                    : intensity > 0.5
                    ? 'Moderada'
                    : intensity > 0.2
                    ? 'Baja'
                    : 'Sin relación'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
