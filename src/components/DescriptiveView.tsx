import React, { useState, useMemo } from 'react';
import { 
  CurrencyMode, 
  MediaKey, 
  DescriptiveStats 
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
  calculateDescriptiveStats, 
  calculateMarketShareByYear 
} from '../utils/statistics';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Users, 
  DollarSign, 
  Calendar, 
  Info, 
  PieChart as PieIcon,
  ChevronRight,
  Sparkles
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

  // 2025 Record
  const rec2025 = RAW_MEDIA_DATA[RAW_MEDIA_DATA.length - 1];
  const total2025 = convertValue(rec2025.totalInv, 2025, currencyMode, rec2025.trm) || 1;
  const perCapita2025 = rec2025.totalInv / (rec2025.poblacionDane / 1000000); // COP per hab or adjusted

  // Data for 2025 Donut Chart
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

  // Selected Year Data for dynamic year ranking inspector
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

  // Currently inspected media statistics
  const currentInspected = mediaStats.find((s) => s.key === inspectedMedia) || mediaStats[0];

  return (
    <div className="space-y-6">
      {/* Top Highlight Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Inversión 2025 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Inversión Total (2025)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrencyValue(totalIndustry.currentValue, currencyMode)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={`font-semibold flex items-center gap-0.5 ${
                totalIndustry.yoyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {totalIndustry.yoyGrowth >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {totalIndustry.yoyGrowth >= 0 ? '+' : ''}
              {totalIndustry.yoyGrowth.toFixed(1)}% YoY
            </span>
            <span className="text-slate-400">vs 2024</span>
          </div>
        </div>

        {/* KPI 2: Medio Líder */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Medio Hegemónico (2025)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Digital (59.7%)
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {formatCurrencyValue(
              convertValue(rec2025.digital, 2025, currencyMode, rec2025.trm),
              currencyMode
            )}{' '}
            <span className="text-slate-400">· +8.5% YoY</span>
          </div>
        </div>

        {/* KPI 3: Inversión Per Cápita */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Inversión Per Cápita (2025)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {currencyMode === 'usd'
              ? `$${(totalIndustry.currentValue / (rec2025.poblacionDane / 1000000)).toFixed(1)} USD/hab`
              : `$${Math.round(
                  (rec2025.totalInv * 1000000) / rec2025.poblacionDane
                ).toLocaleString('es-CO')} COP/hab`}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Población DANE: {(rec2025.poblacionDane / 1000000).toFixed(1)}M colombianos
          </div>
        </div>

        {/* KPI 4: Crecimiento 10 Años (CAGR) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">CAGR 10 Años (2015-2025)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {totalIndustry.cagr10Year >= 0 ? '+' : ''}
            {totalIndustry.cagr10Year.toFixed(2)}% anual
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total acumulado 31 años: {formatCurrencyValue(totalIndustry.totalSum, currencyMode)}
          </div>
        </div>
      </div>

      {/* Main Visuals: Donut 2025 + 100% Stacked Area Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donut Chart Share of Voice 2025 */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                Mix de Inversión / Share of Voice (2025)
              </h2>
              <span className="text-xs text-slate-500 font-mono">Total 100%</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Distribución porcentual de los presupuestos publicitarios en Colombia
            </p>

            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
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
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">Digital Líder</span>
                <span className="text-xl font-bold text-slate-900">59.7%</span>
              </div>
            </div>
          </div>

          {/* Quick Share Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {donutData.map((d) => (
              <div
                key={d.name}
                onClick={() => setInspectedMedia(d.key as MediaKey)}
                className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                  inspectedMedia === d.key ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="truncate text-slate-700">{d.name}</span>
                </div>
                <span className="font-mono text-slate-900 shrink-0">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Evolución Histórica de Cuotas de Mercado (100% Stacked Area) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Transformación Estructural del Mix de Medios (1995 – 2025)
              </h2>
              <p className="text-xs text-slate-500">
                Participación porcentual histórica (% Share of Voice por año)
              </p>
            </div>
            <div className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
              Prensa y Revistas caen · Digital y Exterior crecen
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sharesByYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val}%`,
                    MEDIA_METAS[name as MediaKey]?.label || name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
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

          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 justify-center">
            {ALL_MEDIA_KEYS.map((k) => (
              <div key={k} className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-xs"
                  style={{ backgroundColor: MEDIA_METAS[k].color }}
                />
                <span>{MEDIA_METAS[k].shortLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Year Inspector / Time Travel Ranking */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Explorador Temporal de Ranking por Año: {selectedYear}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Arrastra el control para observar cómo ha evolucionado el podio publicitario en los últimos 31 años
            </p>
          </div>

          {/* Year slider */}
          <div className="flex items-center gap-3 w-full md:w-80">
            <span className="text-xs text-slate-400 font-mono">1995</span>
            <input
              type="range"
              min={1995}
              max={2025}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="text-xs text-blue-400 font-mono font-bold">{selectedYear}</span>
          </div>
        </div>

        {/* Podium cards for selected year */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {yearRanking.map((item, idx) => (
            <div
              key={item.key}
              onClick={() => setInspectedMedia(item.key)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                inspectedMedia === item.key
                  ? 'bg-slate-800 border-blue-500 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-slate-400">#{idx + 1}</span>
                <span className="font-mono text-xs text-blue-300 font-semibold">
                  {item.share.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs font-bold truncate text-white" title={item.label}>
                {item.label}
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">
                {formatValueCompact(item.value, currencyMode)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dive Statistical Analysis Cards & Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Ficha Descriptiva y Estadísticas Paramétricas por Medio
            </h2>
            <p className="text-xs text-slate-500">
              Media, mediana, desviación estándar, pico histórico y tasas de variación
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Seleccionar medio:</span>
            <select
              value={inspectedMedia}
              onChange={(e) => setInspectedMedia(e.target.value as MediaKey)}
              aria-label="Seleccionar medio para inspección estadística"
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {ALL_MEDIA_KEYS.map((k) => (
                <option key={k} value={k}>
                  {MEDIA_METAS[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Inspection Hero for Selected Media */}
        <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: currentInspected.color }}
                />
                <h3 className="text-base font-bold text-slate-900">
                  {currentInspected.label}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                {MEDIA_METAS[inspectedMedia].description}
              </p>
              <div className="text-xs space-y-1 text-slate-600">
                <div>
                  <span className="text-slate-400">Años con registro: </span>
                  <span className="font-semibold text-slate-800">{currentInspected.count} años</span>
                </div>
                <div>
                  <span className="text-slate-400">Participación actual: </span>
                  <span className="font-semibold text-slate-800">
                    {currentInspected.shareCurrent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">Inversión 2025 vs 2024</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrencyValue(currentInspected.currentValue, currencyMode)}
              </div>
              <div
                className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
                  currentInspected.yoyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {currentInspected.yoyGrowth >= 0 ? '+' : ''}
                {currentInspected.yoyGrowth.toFixed(1)}% YoY
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">Media & Mediana Histórica</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                Promedio: {formatValueCompact(currentInspected.mean, currencyMode)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Mediana: {formatValueCompact(currentInspected.median, currencyMode)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Desv. Estándar: ±{formatValueCompact(currentInspected.stdDev, currencyMode)}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">Pico Histórico (Récord)</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrencyValue(currentInspected.max, currencyMode)}
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1">
                Alcanzado en el año {currentInspected.maxYear}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Mínimo: {formatValueCompact(currentInspected.min, currencyMode)} ({currentInspected.minYear})
              </div>
            </div>
          </div>
        </div>

        {/* Full Comparative Statistical Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Medio Publicitario</th>
                <th className="py-3 px-3 text-right">Inversión 2025</th>
                <th className="py-3 px-3 text-right">Var YoY (24-25)</th>
                <th className="py-3 px-3 text-right">Cuota 2025</th>
                <th className="py-3 px-3 text-right">Media Histórica</th>
                <th className="py-3 px-3 text-right">Mediana</th>
                <th className="py-3 px-3 text-right">Pico Récord</th>
                <th className="py-3 px-3 text-center">Año Pico</th>
                <th className="py-3 px-3 text-right">CAGR 10A</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
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
                        ? 'bg-slate-50/90 font-bold text-slate-900'
                        : isSelected
                        ? 'bg-blue-50/70 font-medium'
                        : 'hover:bg-slate-50/60 cursor-pointer'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        <span className={isTotal ? 'font-bold' : ''}>{row.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium">
                      {formatCurrencyValue(row.currentValue, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          row.yoyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {row.yoyGrowth >= 0 ? '+' : ''}
                        {row.yoyGrowth.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {row.shareCurrent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatValueCompact(row.mean, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatValueCompact(row.median, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">
                      {formatValueCompact(row.max, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {row.maxYear}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={
                          row.cagr10Year > 0
                            ? 'text-emerald-600 font-semibold'
                            : row.cagr10Year < 0
                            ? 'text-rose-600 font-semibold'
                            : 'text-slate-500'
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
      </div>
    </div>
  );
};
