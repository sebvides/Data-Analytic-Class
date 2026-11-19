import React, { useState, useMemo } from 'react';
import { CurrencyMode, MediaKey } from '../types/media';
import {
  RAW_MEDIA_DATA,
  MEDIA_METAS,
  ALL_MEDIA_KEYS,
  formatCurrencyValue,
  formatValueCompact,
  convertValue,
} from '../data/mediaData';
import {
  calculateMacroCorrelations,
  calculateHHI,
  calculateCAGR,
} from '../utils/statistics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendViewProps {
  currencyMode: CurrencyMode;
}

export const TrendView: React.FC<TrendViewProps> = ({ currencyMode }) => {
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

  const trendData = useMemo(() => {
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

  const correlations = useMemo(() => calculateMacroCorrelations(), []);
  const hhiData = useMemo(() => calculateHHI(), []);

  const eras = [
    { name: 'Era Tradicional (1995–2007)', startYear: 1995, endYear: 2007 },
    { name: 'Emergencia Digital (2008–2014)', startYear: 2008, endYear: 2014 },
    { name: 'Disrupción y Pandemia (2015–2020)', startYear: 2015, endYear: 2020 },
    { name: 'Hegemonía Digital y DOOH (2021–2025)', startYear: 2021, endYear: 2025 },
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
    <div className="space-y-8">
      {/* Editorial Timeline: Four Market Eras */}
      <section className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <div className="text-xs font-mono text-stone-500">Crónica Sectorial · 1995–2025</div>
          <h2 className="font-serif text-xl font-semibold text-stone-950 mt-0.5">
            Cuatro Ciclos Históricos de la Pauta Publicitaria en Colombia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200 text-xs">
          <div className="p-6">
            <div className="font-mono text-blue-900 font-semibold mb-1.5 tabular-nums">
              01 · 1995–2007
            </div>
            <h3 className="font-serif text-sm font-semibold text-stone-950 mb-2">
              Hegemonía Televisiva e Impresa
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Consolidación de canales privados nacionales. La TV Nacional captaba más del 50% de la inversión y la Prensa superaba los $500 mil millones COP.
            </p>
          </div>

          <div className="p-6">
            <div className="font-mono text-blue-900 font-semibold mb-1.5 tabular-nums">
              02 · 2008–2014
            </div>
            <h3 className="font-serif text-sm font-semibold text-stone-950 mb-2">
              Irrupción del Ecosistema Digital
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Primer registro digital en 2008 ($40.6 mil millones COP, 2.1% cuota). En 2014 Digital alcanza el 8.8% mientras TV Nacional marca su récord ($1.15B).
            </p>
          </div>

          <div className="p-6">
            <div className="font-mono text-blue-900 font-semibold mb-1.5 tabular-nums">
              03 · 2015–2020
            </div>
            <h3 className="font-serif text-sm font-semibold text-stone-950 mb-2">
              Punto de Inflexión y Pandemia
            </h3>
            <p className="text-stone-600 leading-relaxed">
              En 2020 el confinamiento contrajo Exterior (-55%) y Prensa (-40%), mientras Digital creció +15.8% acelerando la migración de presupuestos.
            </p>
          </div>

          <div className="p-6">
            <div className="font-mono text-blue-900 font-semibold mb-1.5 tabular-nums">
              04 · 2021–2025
            </div>
            <h3 className="font-serif text-sm font-semibold text-stone-950 mb-2">
              Primacía Digital y Resurgimiento DOOH
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Digital superó a TV Nacional en 2021 y cierra 2025 en $3.07 billones COP (59.7% cuota), acompañado del fuerte rebote de Publicidad Exterior (+12.4%).
            </p>
          </div>
        </div>
      </section>

      {/* Fig 03: Multi-Media Evolution Chart */}
      <article className="bg-white p-6 rounded-lg border border-stone-200">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-stone-100 mb-4">
          <div>
            <div className="text-xs font-mono text-stone-500">Figura 03 · Series Longitudinales</div>
            <h2 className="font-serif text-xl font-semibold text-stone-950 mt-0.5">
              Evolución Comparada de la Inversión por Medio (1995–2025)
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {scaleType === 'linear'
                ? `Cifras expresadas en ${
                    currencyMode === 'usd'
                      ? 'Millones de USD (TRM promedio anual)'
                      : currencyMode === 'cop_real_2025'
                      ? 'Millones COP Reales (poder adquisitivo 2025)'
                      : 'Millones COP Corrientes'
                  }`
                : 'Índice de crecimiento normalizado (Año base 2014 = 100)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center p-1 bg-stone-100 border border-stone-200 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setScaleType('linear')}
                className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  scaleType === 'linear'
                    ? 'bg-white text-stone-950 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Escala Monetaria
              </button>
              <button
                type="button"
                onClick={() => setScaleType('indexed')}
                className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  scaleType === 'indexed'
                    ? 'bg-white text-stone-950 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
                title="Normaliza todos los medios a 100 en 2014 para comparar tasas de expansión"
              >
                Base 2014 = 100
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => selectPreset('all')}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md font-medium whitespace-nowrap cursor-pointer"
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => selectPreset('digital_vs_tv')}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md font-medium whitespace-nowrap cursor-pointer"
              >
                Digital vs. TV
              </button>
              <button
                type="button"
                onClick={() => selectPreset('traditional')}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md font-medium whitespace-nowrap cursor-pointer"
              >
                Tradicionales
              </button>
              <button
                type="button"
                onClick={() => selectPreset('print')}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md font-medium whitespace-nowrap cursor-pointer"
              >
                Impresos
              </button>
            </div>
          </div>
        </div>

        {/* Media filter checkboxes */}
        <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
          <span className="text-stone-500 font-medium mr-1">Series activas:</span>
          {ALL_MEDIA_KEYS.map((k) => {
            const isChecked = activeMedia[k];
            const meta = MEDIA_METAS[k];
            return (
              <button
                type="button"
                key={k}
                onClick={() => setActiveMedia({ ...activeMedia, [k]: !isChecked })}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors font-medium whitespace-nowrap cursor-pointer ${
                  isChecked
                    ? 'bg-white text-stone-900 border-stone-300'
                    : 'bg-stone-50 text-stone-400 border-stone-200 hover:text-stone-600'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: isChecked ? meta.color : '#d6d3d1' }}
                  aria-hidden="true"
                />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: '#d6d3d1' }}
                tick={{ fontSize: 11, fill: '#78716c' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickFormatter={(val) =>
                  scaleType === 'indexed' ? `${val}` : formatValueCompact(val, currencyMode)
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
                  backgroundColor: '#1c1917',
                  borderColor: '#292524',
                  borderRadius: '6px',
                  color: '#fafaf9',
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
                    dot={{ r: 2, fill: meta.color }}
                    activeDot={{ r: 4.5 }}
                    connectNulls={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* Tabla 02: CAGR by Eras + Fig 04: HHI Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <article className="lg:col-span-8 bg-white p-6 rounded-lg border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between gap-2 border-b border-stone-100 pb-3 mb-4">
              <div>
                <div className="text-xs font-mono text-stone-500">Tabla 02 · Dinámica Anualizada</div>
                <h2 className="font-serif text-lg font-semibold text-stone-950">
                  Crecimiento Anual Compuesto (CAGR) por Era Histórica
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-500">Tasa anual (%)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-3">Periodo Histórico</th>
                    <th className="py-3 px-2 text-right">Industria</th>
                    <th className="py-3 px-2 text-right text-blue-700">Digital</th>
                    <th className="py-3 px-2 text-right text-emerald-700">TV Nac.</th>
                    <th className="py-3 px-2 text-right text-amber-700">Radio</th>
                    <th className="py-3 px-2 text-right text-purple-700">Exterior</th>
                    <th className="py-3 px-3 text-right text-rose-700">Prensa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 tabular-nums">
                  {erasCAGR.map((row, i) => (
                    <tr key={i} className="hover:bg-stone-50">
                      <td className="py-3 px-3 font-medium text-stone-900">{row.eraName}</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-stone-950">
                        {row.totalInv !== null ? `${row.totalInv > 0 ? '+' : ''}${row.totalInv}%` : '—'}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-blue-700 font-semibold">
                        {row.digital !== null ? `${row.digital > 0 ? '+' : ''}${row.digital}%` : '—'}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-stone-700">
                        {row.tvNacional !== null ? `${row.tvNacional > 0 ? '+' : ''}${row.tvNacional}%` : '—'}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-stone-700">
                        {row.radio !== null ? `${row.radio > 0 ? '+' : ''}${row.radio}%` : '—'}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-stone-700">
                        {row.pubExterior !== null ? `${row.pubExterior > 0 ? '+' : ''}${row.pubExterior}%` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-700">
                        {row.prensa !== null ? `${row.prensa > 0 ? '+' : ''}${row.prensa}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 italic mt-4 pt-3 border-t border-stone-100">
            Nota: Los guiones (—) corresponden a periodos previos al registro oficial del medio en el observatorio nacional.
          </p>
        </article>

        {/* Fig 04: HHI Index */}
        <article className="lg:col-span-4 bg-white p-6 rounded-lg border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between gap-2 border-b border-stone-100 pb-3 mb-3">
              <div>
                <div className="text-xs font-mono text-stone-500">Figura 04</div>
                <h2 className="font-serif text-lg font-semibold text-stone-950">
                  Índice de Concentración (HHI)
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold text-blue-900 tabular-nums">
                {hhiData[hhiData.length - 1].hhi} pts
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              Escala Herfindahl-Hirschman (0–10.000). Valores superiores a 2.500 indican alta concentración.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hhiData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#78716c' }} />
                  <YAxis domain={[1000, 6500]} tick={{ fontSize: 10, fill: '#78716c' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} pts`, 'Índice HHI']}
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#292524',
                      borderRadius: '6px',
                      color: '#fafaf9',
                      fontSize: '11px',
                    }}
                  />
                  <Line type="monotone" dataKey="hhi" stroke="#1e3a8a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-600 leading-relaxed">
            <strong className="text-stone-900">Lectura de mercado:</strong> Tras diversificarse entre 2010 y 2018 (~2.500 pts), el ecosistema vuelve a concentrarse por la hegemonía digital (&gt;4.000 pts).
          </div>
        </article>
      </div>

      {/* Macroeconomic Correlations */}
      <section className="bg-white p-6 rounded-lg border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-100 mb-5">
          <div>
            <div className="text-xs font-mono text-stone-500">Análisis Econométrico · Correlación de Pearson</div>
            <h2 className="font-serif text-xl font-semibold text-stone-950 mt-0.5">
              Sensibilidad Frente a Indicadores Macroeconómicos
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Grado de asociación lineal (-1.00 a +1.00) entre la inversión por medio y las variables estructurales del país
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-stone-100 border border-stone-200 rounded-lg text-xs shrink-0">
            <button
              type="button"
              onClick={() => setMacroVar('internet')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                macroVar === 'internet'
                  ? 'bg-white text-stone-950 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Penetración Internet
            </button>
            <button
              type="button"
              onClick={() => setMacroVar('trm')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                macroVar === 'trm'
                  ? 'bg-white text-stone-950 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              TRM (COP/USD)
            </button>
            <button
              type="button"
              onClick={() => setMacroVar('ipc')}
              className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                macroVar === 'ipc'
                  ? 'bg-white text-stone-950 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Inflación (IPC)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 border border-stone-200 rounded-md overflow-hidden">
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
              <div key={c.mediaKey} className="p-4 bg-[#FAF9F6] flex flex-col justify-between">
                <div className="text-xs font-semibold text-stone-800 truncate" title={c.label}>
                  {c.label}
                </div>
                <div className="my-3">
                  <div className="text-lg font-mono font-semibold text-stone-950 tabular-nums">
                    {corrVal > 0 ? '+' : ''}
                    {corrVal.toFixed(2)}
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${
                        isPositive ? 'bg-blue-800' : 'bg-rose-700'
                      }`}
                      style={{ width: `${Math.min(intensity * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-[11px] text-stone-500">
                  {intensity > 0.8
                    ? 'Asociación muy alta'
                    : intensity > 0.5
                    ? 'Asociación moderada'
                    : intensity > 0.2
                    ? 'Asociación baja'
                    : 'Sin relación lineal'}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
