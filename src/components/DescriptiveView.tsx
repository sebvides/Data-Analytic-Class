import React, { useState, useMemo } from 'react';
import {
  CurrencyMode,
  MediaKey,
  DescriptiveStats,
} from '../types/media';
import {
  RAW_MEDIA_DATA,
  MEDIA_METAS,
  ALL_MEDIA_KEYS,
  formatCurrencyValue,
  formatValueCompact,
  convertValue,
} from '../data/mediaData';
import {
  calculateDescriptiveStats,
  calculateMarketShareByYear,
} from '../utils/statistics';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';

interface DescriptiveViewProps {
  currencyMode: CurrencyMode;
}

export const DescriptiveView: React.FC<DescriptiveViewProps> = ({ currencyMode }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [inspectedMedia, setInspectedMedia] = useState<MediaKey>('digital');

  const stats = useMemo(() => calculateDescriptiveStats(currencyMode), [currencyMode]);
  const sharesByYear = useMemo(() => calculateMarketShareByYear(currencyMode), [currencyMode]);

  const totalIndustry = stats.find((s) => s.key === 'totalInv')!;
  const mediaStats = stats.filter((s) => s.key !== 'totalInv') as DescriptiveStats[];

  const rec2025 = RAW_MEDIA_DATA[RAW_MEDIA_DATA.length - 1];
  const total2025 = convertValue(rec2025.totalInv, 2025, currencyMode, rec2025.trm) || 1;

  const donutData = useMemo(() => {
    return ALL_MEDIA_KEYS.map((k) => {
      const val = convertValue(rec2025[k], 2025, currencyMode, rec2025.trm) || 0;
      const pct = (val / total2025) * 100;
      return {
        name: MEDIA_METAS[k].label,
        key: k,
        value: Number(val.toFixed(1)),
        percentage: Number(pct.toFixed(1)),
        color: MEDIA_METAS[k].color,
      };
    }).sort((a, b) => b.value - a.value);
  }, [currencyMode, rec2025, total2025]);

  const yearRecord = RAW_MEDIA_DATA.find((d) => d.year === selectedYear) || rec2025;
  const yearTotal = convertValue(yearRecord.totalInv, yearRecord.year, currencyMode, yearRecord.trm) || 1;

  const yearRanking = useMemo(() => {
    const list: { key: MediaKey; label: string; value: number; share: number; color: string }[] = [];
    for (const k of ALL_MEDIA_KEYS) {
      const val = convertValue(yearRecord[k], yearRecord.year, currencyMode, yearRecord.trm);
      if (val !== null && val > 0) {
        list.push({
          key: k,
          label: MEDIA_METAS[k].label,
          value: val,
          share: (val / yearTotal) * 100,
          color: MEDIA_METAS[k].color,
        });
      }
    }
    return list.sort((a, b) => b.value - a.value);
  }, [yearRecord, yearTotal, currencyMode]);

  const currentInspected = mediaStats.find((s) => s.key === inspectedMedia) || mediaStats[0];

  return (
    <div className="space-y-8">
      {/* Editorial KPI Summary Strip (Unified Single-Elevation Band with Hairline Dividers) */}
      <section aria-label="Indicadores clave del mercado 2025" className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
          {/* KPI 1 */}
          <div className="p-6">
            <div className="text-xs font-medium text-stone-500">
              Inversión Total de la Industria · 2025
            </div>
            <div className="text-2xl font-serif font-semibold text-stone-950 tracking-tight mt-2 tabular-nums">
              {formatCurrencyValue(totalIndustry.currentValue, currencyMode)}
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              <span
                className={`font-mono font-semibold inline-flex items-center gap-1 tabular-nums ${
                  totalIndustry.yoyGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {totalIndustry.yoyGrowth >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {totalIndustry.yoyGrowth >= 0 ? '+' : ''}
                {totalIndustry.yoyGrowth.toFixed(1)}% interanual
              </span>
              <span className="text-stone-400">vs. 2024</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="p-6">
            <div className="text-xs font-medium text-stone-500">
              Medio Líder en Participación · 2025
            </div>
            <div className="text-2xl font-serif font-semibold text-stone-950 tracking-tight mt-2 tabular-nums">
              Digital · 59.7%
            </div>
            <div className="mt-2.5 text-xs text-stone-600 font-mono tabular-nums">
              {formatCurrencyValue(
                convertValue(rec2025.digital, 2025, currencyMode, rec2025.trm),
                currencyMode
              )}{' '}
              <span className="text-stone-400 font-sans">· +8.5% YoY</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="p-6">
            <div className="text-xs font-medium text-stone-500">
              Inversión Publicitaria Per Cápita
            </div>
            <div className="text-2xl font-serif font-semibold text-stone-950 tracking-tight mt-2 tabular-nums">
              {currencyMode === 'usd'
                ? `$${(totalIndustry.currentValue / (rec2025.poblacionDane / 1000000)).toFixed(1)} USD`
                : `$${Math.round(
                    (rec2025.totalInv * 1000000) / rec2025.poblacionDane
                  ).toLocaleString('es-CO')} COP`}
            </div>
            <div className="mt-2.5 text-xs text-stone-500">
              Por habitante · Base {(rec2025.poblacionDane / 1000000).toFixed(1)}M DANE
            </div>
          </div>

          {/* KPI 4 */}
          <div className="p-6">
            <div className="text-xs font-medium text-stone-500">
              Crecimiento Compuesto 10 Años
            </div>
            <div className="text-2xl font-serif font-semibold text-stone-950 tracking-tight mt-2 tabular-nums">
              {totalIndustry.cagr10Year >= 0 ? '+' : ''}
              {totalIndustry.cagr10Year.toFixed(2)}% anual
            </div>
            <div className="mt-2.5 text-xs text-stone-500 tabular-nums">
              Acumulado 31 años: {formatCurrencyValue(totalIndustry.totalSum, currencyMode)}
            </div>
          </div>
        </div>
      </section>

      {/* Main Visual Plates: Fig 01 Donut 2025 + Fig 02 Stacked Area 1995-2025 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Fig 01: Share of Voice 2025 */}
        <article className="lg:col-span-5 bg-white p-6 rounded-lg border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between gap-2 border-b border-stone-100 pb-3 mb-4">
              <div>
                <div className="text-xs font-mono text-stone-500">Figura 01</div>
                <h2 className="font-serif text-lg font-semibold text-stone-950">
                  Distribución del Mix de Medios (2025)
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-500 tabular-nums">Base 100%</span>
            </div>

            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={94}
                    paddingAngle={1.5}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatCurrencyValue(Number(val), currencyMode)} (${item.payload.percentage}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#292524',
                      borderRadius: '6px',
                      color: '#fafaf9',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-stone-500 font-medium">Líder Digital</span>
                <span className="text-xl font-serif font-semibold text-stone-950 tabular-nums">59.7%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {donutData.map((d) => (
                <button
                  type="button"
                  key={d.name}
                  onClick={() => setInspectedMedia(d.key as MediaKey)}
                  className={`flex items-center justify-between py-1 px-1.5 rounded text-left transition-colors cursor-pointer ${
                    inspectedMedia === d.key
                      ? 'bg-stone-100 font-semibold text-stone-950'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: d.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{d.name}</span>
                  </span>
                  <span className="font-mono text-stone-900 shrink-0 tabular-nums">{d.percentage}%</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 italic mt-3">
              Nota: Haga clic en cualquier medio para inspeccionar su ficha estadística detallada más abajo.
            </p>
          </div>
        </article>

        {/* Fig 02: Historical Share Evolution */}
        <article className="lg:col-span-7 bg-white p-6 rounded-lg border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone-100 pb-3 mb-4">
              <div>
                <div className="text-xs font-mono text-stone-500">Figura 02</div>
                <h2 className="font-serif text-lg font-semibold text-stone-950">
                  Reconfiguración Estructural de Cuotas (1995–2025)
                </h2>
              </div>
              <span className="text-xs text-stone-500">
                Participación porcentual histórica por año
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sharesByYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val}%`,
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
                  <Area
                    type="monotone"
                    dataKey="digital"
                    stackId="1"
                    stroke={MEDIA_METAS.digital.color}
                    fill={MEDIA_METAS.digital.color}
                    fillOpacity={0.85}
                  />
                  <Area
                    type="monotone"
                    dataKey="tvNacional"
                    stackId="1"
                    stroke={MEDIA_METAS.tvNacional.color}
                    fill={MEDIA_METAS.tvNacional.color}
                    fillOpacity={0.85}
                  />
                  <Area
                    type="monotone"
                    dataKey="radio"
                    stackId="1"
                    stroke={MEDIA_METAS.radio.color}
                    fill={MEDIA_METAS.radio.color}
                    fillOpacity={0.85}
                  />
                  <Area
                    type="monotone"
                    dataKey="pubExterior"
                    stackId="1"
                    stroke={MEDIA_METAS.pubExterior.color}
                    fill={MEDIA_METAS.pubExterior.color}
                    fillOpacity={0.85}
                  />
                  <Area
                    type="monotone"
                    dataKey="prensa"
                    stackId="1"
                    stroke={MEDIA_METAS.prensa.color}
                    fill={MEDIA_METAS.prensa.color}
                    fillOpacity={0.85}
                  />
                  <Area
                    type="monotone"
                    dataKey="tvRegional"
                    stackId="1"
                    stroke={MEDIA_METAS.tvRegional.color}
                    fill={MEDIA_METAS.tvRegional.color}
                    fillOpacity={0.85}
                  />
                  <Area
                    type="monotone"
                    dataKey="revistas"
                    stackId="1"
                    stroke={MEDIA_METAS.revistas.color}
                    fill={MEDIA_METAS.revistas.color}
                    fillOpacity={0.85}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
              {ALL_MEDIA_KEYS.map((k) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs"
                    style={{ backgroundColor: MEDIA_METAS[k].color }}
                    aria-hidden="true"
                  />
                  <span>{MEDIA_METAS[k].shortLabel}</span>
                </div>
              ))}
            </div>
            <span className="text-[11px] text-stone-500 italic">
              Fuente: Serie histórica consolidada 1995–2025
            </span>
          </div>
        </article>
      </div>

      {/* Dark Editorial Plate: Interactive Historical Year Ranking */}
      <section className="bg-stone-950 text-stone-100 p-6 sm:p-7 rounded-lg border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Archivo Cronológico · Ranking por Año</span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-white mt-1">
              Jerarquía de Medios en Colombia: Año {selectedYear}
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full md:w-80">
            <span className="text-xs text-stone-400 font-mono tabular-nums">1995</span>
            <input
              type="range"
              min={1995}
              max={2025}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Seleccionar año del ranking histórico"
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
            <span className="text-xs text-blue-300 font-mono font-semibold tabular-nums">
              {selectedYear}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-5">
          {yearRanking.map((item, idx) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setInspectedMedia(item.key)}
              className={`p-3.5 rounded-md border text-left transition-colors cursor-pointer ${
                inspectedMedia === item.key
                  ? 'bg-stone-900 border-blue-500'
                  : 'bg-stone-900/50 border-stone-800 hover:bg-stone-900 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono tabular-nums">
                <span className="text-stone-400">#{idx + 1}</span>
                <span className="text-blue-300 font-semibold">{item.share.toFixed(1)}%</span>
              </div>
              <div className="text-xs font-semibold truncate text-white" title={item.label}>
                {item.label}
              </div>
              <div className="text-xs font-mono text-stone-300 mt-1 tabular-nums">
                {formatValueCompact(item.value, currencyMode)}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Tabla 01: Deep-Dive Statistical Analysis & Comparative Matrix */}
      <section className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-stone-500">Tabla 01 · Ficha Paramétrica</div>
            <h2 className="font-serif text-xl font-semibold text-stone-950 mt-0.5">
              Análisis Estadístico Descriptivo por Categoría
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="inspect-media-select" className="text-xs font-medium text-stone-600">
              Medio destacado:
            </label>
            <select
              id="inspect-media-select"
              value={inspectedMedia}
              onChange={(e) => setInspectedMedia(e.target.value as MediaKey)}
              className="text-xs font-medium bg-[#FAF9F6] border border-stone-300 rounded-md px-3 py-1.5 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-blue-800"
            >
              {ALL_MEDIA_KEYS.map((k) => (
                <option key={k} value={k}>
                  {MEDIA_METAS[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Highlighted Media Analytical Brief (Clean Hairline Divided Grid, No Nested Card Boxes) */}
        <div className="bg-[#FAF9F6] border-b border-stone-200 grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-3 h-3 rounded-xs shrink-0"
                style={{ backgroundColor: currentInspected.color }}
                aria-hidden="true"
              />
              <h3 className="font-serif text-lg font-semibold text-stone-950">
                {currentInspected.label}
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {MEDIA_METAS[inspectedMedia].description}
            </p>
            <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center gap-3 text-xs text-stone-600 font-mono tabular-nums">
              <span>{currentInspected.count} años de serie</span>
              <span aria-hidden="true">·</span>
              <span>{currentInspected.shareCurrent.toFixed(1)}% cuota</span>
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-stone-500 font-medium">Cierre 2025 vs. 2024</div>
            <div className="text-xl font-serif font-semibold text-stone-950 mt-1.5 tabular-nums">
              {formatCurrencyValue(currentInspected.currentValue, currencyMode)}
            </div>
            <div
              className={`text-xs font-mono font-semibold mt-1.5 tabular-nums ${
                currentInspected.yoyGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {currentInspected.yoyGrowth >= 0 ? '+' : ''}
              {currentInspected.yoyGrowth.toFixed(1)}% variación YoY
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-stone-500 font-medium">Tendencia Central y Dispersión</div>
            <div className="text-sm font-mono font-semibold text-stone-900 mt-2 tabular-nums">
              Media: {formatValueCompact(currentInspected.mean, currencyMode)}
            </div>
            <div className="text-xs font-mono text-stone-600 mt-1 tabular-nums">
              Mediana: {formatValueCompact(currentInspected.median, currencyMode)}
            </div>
            <div className="text-xs font-mono text-stone-500 mt-1 tabular-nums">
              Desv. Est.: ±{formatValueCompact(currentInspected.stdDev, currencyMode)}
            </div>
          </div>

          <div className="p-6">
            <div className="text-xs text-stone-500 font-medium">Récord Histórico Observado</div>
            <div className="text-xl font-serif font-semibold text-stone-950 mt-1.5 tabular-nums">
              {formatCurrencyValue(currentInspected.max, currencyMode)}
            </div>
            <div className="text-xs text-blue-900 font-medium mt-1.5">
              Máximo alcanzado en {currentInspected.maxYear}
            </div>
            <div className="text-xs font-mono text-stone-500 mt-0.5 tabular-nums">
              Mínimo: {formatValueCompact(currentInspected.min, currencyMode)} ({currentInspected.minYear})
            </div>
          </div>
        </div>

        {/* Comparative Statistical Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-5">Medio Publicitario</th>
                <th className="py-3.5 px-3 text-right">Inversión 2025</th>
                <th className="py-3.5 px-3 text-right">Var YoY</th>
                <th className="py-3.5 px-3 text-right">Cuota 2025</th>
                <th className="py-3.5 px-3 text-right">Media</th>
                <th className="py-3.5 px-3 text-right">Mediana</th>
                <th className="py-3.5 px-3 text-right">Pico Récord</th>
                <th className="py-3.5 px-3 text-center">Año Pico</th>
                <th className="py-3.5 px-5 text-right">CAGR 10A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 tabular-nums">
              {stats.map((row) => {
                const isSelected = row.key === inspectedMedia;
                const isTotal = row.key === 'totalInv';
                return (
                  <tr
                    key={row.key}
                    onClick={() => {
                      if (!isTotal) setInspectedMedia(row.key as MediaKey);
                    }}
                    className={`transition-colors ${
                      isTotal
                        ? 'bg-stone-100/80 font-bold text-stone-950'
                        : isSelected
                        ? 'bg-blue-50/60 font-medium'
                        : 'hover:bg-stone-50 cursor-pointer'
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: row.color }}
                          aria-hidden="true"
                        />
                        <span className={isTotal ? 'font-bold' : 'text-stone-900'}>{row.label}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-stone-900">
                      {formatCurrencyValue(row.currentValue, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          row.yoyGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {row.yoyGrowth >= 0 ? '+' : ''}
                        {row.yoyGrowth.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-800">
                      {row.shareCurrent.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-600">
                      {formatValueCompact(row.mean, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-600">
                      {formatValueCompact(row.median, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-800">
                      {formatValueCompact(row.max, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-stone-500">
                      {row.maxYear}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono">
                      <span
                        className={
                          row.cagr10Year > 0
                            ? 'text-emerald-700 font-semibold'
                            : row.cagr10Year < 0
                            ? 'text-rose-700 font-semibold'
                            : 'text-stone-500'
                        }
                      >
                        {row.cagr10Year > 0 ? '+' : ''}
                        {row.cagr10Year.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
