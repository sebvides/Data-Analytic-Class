import React, { useState, useMemo } from 'react';
import {
  CurrencyMode,
  MediaKey,
  ForecastModelType,
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
  getAllMediaForecasts,
  getIndustryAggregateForecast,
} from '../utils/forecasting';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Calculator,
  Info,
} from 'lucide-react';

interface ForecastViewProps {
  currencyMode: CurrencyMode;
}

export const ForecastView: React.FC<ForecastViewProps> = ({ currencyMode }) => {
  const [selectedModel, setSelectedModel] = useState<ForecastModelType>('logistic_damped');
  const [selectedMedia, setSelectedMedia] = useState<MediaKey>('digital');
  const [scenarioMode, setScenarioMode] = useState<'base' | 'all_scenarios'>('all_scenarios');
  const [horizonYears] = useState<number>(5);

  const [simTargetBudget, setSimTargetBudget] = useState<number>(5500000);
  const [simMix, setSimMix] = useState<Record<MediaKey, number>>({
    digital: 62,
    tvNacional: 16,
    radio: 10,
    pubExterior: 7,
    prensa: 3,
    tvRegional: 1.5,
    revistas: 0.5,
  });

  const allForecasts = useMemo(
    () => getAllMediaForecasts(selectedModel, currencyMode, horizonYears),
    [selectedModel, currencyMode, horizonYears]
  );

  const aggregateForecast = useMemo(
    () => getIndustryAggregateForecast(allForecasts),
    [allForecasts]
  );

  const currentForecast = allForecasts[selectedMedia];

  const mediaSeriesData = useMemo(() => {
    const historicalSlice = currentForecast.historicalData
      .filter((h) => h.year >= 2018)
      .map((h) => ({
        year: h.year,
        historical: h.value,
        forecast: null,
        lowerBound: null,
        upperBound: null,
        optimistic: null,
        pessimistic: null,
      }));

    const forecastSlice = currentForecast.forecastData.map((f) => ({
      year: f.year,
      historical: f.year === 2025 ? f.value : null,
      forecast: f.value,
      lowerBound: f.lowerBound,
      upperBound: f.upperBound,
      optimistic: f.optimistic,
      pessimistic: f.pessimistic,
    }));

    return [...historicalSlice.filter((h) => h.year < 2025), ...forecastSlice];
  }, [currentForecast]);

  const aggregateChartData = useMemo(() => {
    const hist2018 = RAW_MEDIA_DATA.filter((d) => d.year >= 2018).map((d) => ({
      year: d.year,
      historicalTotal: convertValue(d.totalInv, d.year, currencyMode, d.trm),
      projectedTotal: null,
      lowerBound: null,
      upperBound: null,
      optimistic: null,
      pessimistic: null,
    }));

    const projSlice = aggregateForecast.map((p) => ({
      year: p.year,
      historicalTotal: p.year === 2025 ? p.total : null,
      projectedTotal: p.total,
      lowerBound: p.lowerBound,
      upperBound: p.upperBound,
      optimistic: p.optimistic,
      pessimistic: p.pessimistic,
    }));

    return [...hist2018.filter((h) => h.year < 2025), ...projSlice];
  }, [currencyMode, aggregateForecast]);

  const proj2030 = aggregateForecast.find((p) => p.year === 2030);
  const total2030 = proj2030 ? proj2030.total : 1;
  const simMixSum = Object.values(simMix).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Econometric Model Controls Bar */}
      <section className="bg-white p-6 rounded-lg border border-stone-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-stone-500">Metodología Predictiva · 2026–2030</div>
            <h2 className="font-serif text-xl font-semibold text-stone-950 mt-0.5">
              Selección de Modelo Econométrico y Escenarios
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="model-select" className="text-xs font-medium text-stone-600">
                Modelo:
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ForecastModelType)}
                className="text-xs font-medium bg-[#FAF9F6] border border-stone-300 rounded-md px-3 py-1.5 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-blue-800"
              >
                <option value="logistic_damped">
                  Curva Logística / Crecimiento Amortiguado (Recomendado)
                </option>
                <option value="linear_recent">
                  Regresión Lineal Reciente (2018–2025)
                </option>
                <option value="exponential_smoothing">
                  Suavizado Exponencial de Holt (Doble nivel)
                </option>
                <option value="cagr_trend">
                  Tasa Compuesta Reciente (CAGR 5 Años)
                </option>
              </select>
            </div>

            <div className="inline-flex items-center p-1 bg-stone-100 border border-stone-200 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setScenarioMode('base')}
                className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  scenarioMode === 'base'
                    ? 'bg-white text-stone-950 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Solo Base
              </button>
              <button
                type="button"
                onClick={() => setScenarioMode('all_scenarios')}
                className={`px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  scenarioMode === 'all_scenarios'
                    ? 'bg-white text-stone-950 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
                title="Muestra bandas de confianza y escenarios optimista / pesimista"
              >
                Escenarios y Bandas
              </button>
            </div>
          </div>
        </div>

        {/* Clean hairline methodological note (no thick left border or floating card) */}
        <div className="mt-4 pt-4 border-t border-stone-200 text-xs text-stone-600 flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
          <p>
            <strong className="text-stone-900">
              {selectedModel === 'logistic_damped' && 'Nota metodológica · Modelo Logístico Amortiguado: '}
              {selectedModel === 'linear_recent' && 'Nota metodológica · Regresión Lineal Ponderada: '}
              {selectedModel === 'exponential_smoothing' && 'Nota metodológica · Suavizado Exponencial de Holt: '}
              {selectedModel === 'cagr_trend' && 'Nota metodológica · Tasa Compuesta (CAGR 5A): '}
            </strong>
            {selectedModel === 'logistic_damped' &&
              'Modela la maduración natural de la penetración de internet en Digital (amortiguando crecimientos infinitos) y fija un suelo de nicho para la prensa y revistas impresas.'}
            {selectedModel === 'linear_recent' &&
              'Ajusta la pendiente sobre los últimos 7 años (2018–2025), aislando la dinámica contemporánea del mercado frente a las décadas iniciales.'}
            {selectedModel === 'exponential_smoothing' &&
              'Asigna mayor ponderación a las observaciones más recientes mediante parámetros adaptativos de nivel y tendencia.'}
            {selectedModel === 'cagr_trend' &&
              'Extrapola hacia 2030 la tasa compuesta de crecimiento anual observada en el último quinquenio (2020–2025).'}
          </p>
        </div>
      </section>

      {/* Fig 05 Aggregate Forecast + 2030 Summary Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <article className="lg:col-span-8 bg-white p-6 rounded-lg border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone-100 pb-3 mb-4">
              <div>
                <div className="text-xs font-mono text-stone-500">Figura 05 · Consolidado Nacional</div>
                <h2 className="font-serif text-lg font-semibold text-stone-950">
                  Proyección de la Inversión Publicitaria Total (2025–2030)
                </h2>
              </div>
              <span className="text-xs font-mono text-stone-500">Horizonte 5 años</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aggregateChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="projBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#78716c' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    tickFormatter={(val) => formatValueCompact(val, currencyMode)}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatCurrencyValue(Number(val), currencyMode),
                      name === 'historicalTotal'
                        ? 'Histórico Real'
                        : name === 'projectedTotal'
                        ? 'Proyección Base'
                        : name === 'optimistic'
                        ? 'Escenario Optimista'
                        : name === 'pessimistic'
                        ? 'Escenario Pesimista'
                        : name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: '#292524',
                      borderRadius: '6px',
                      color: '#fafaf9',
                      fontSize: '11px',
                    }}
                  />
                  {scenarioMode === 'all_scenarios' && (
                    <>
                      <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#projBand)" />
                      <Line
                        type="monotone"
                        dataKey="optimistic"
                        stroke="#047857"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="pessimistic"
                        stroke="#be123c"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </>
                  )}
                  <Line
                    type="monotone"
                    dataKey="historicalTotal"
                    name="historicalTotal"
                    stroke="#1c1917"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#1c1917' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedTotal"
                    name="projectedTotal"
                    stroke="#1d4ed8"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 3.5, fill: '#1d4ed8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-center gap-5 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-stone-900" aria-hidden="true" />
              <span>Histórico (2018–2025)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-blue-700 border-b border-dashed border-blue-700" aria-hidden="true" />
              <span className="font-semibold text-blue-900">Proyección Base (2026–2030)</span>
            </div>
            {scenarioMode === 'all_scenarios' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-0.5 bg-emerald-700" aria-hidden="true" />
                  <span className="text-emerald-800">Optimista (+12%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-0.5 bg-rose-700" aria-hidden="true" />
                  <span className="text-rose-800">Pesimista (-12%)</span>
                </div>
              </>
            )}
          </div>
        </article>

        {/* Right Summary Column: 2030 Outlook */}
        <aside className="lg:col-span-4 bg-white rounded-lg border border-stone-200 flex flex-col justify-between overflow-hidden">
          <div className="p-6 border-b border-stone-200">
            <div className="text-xs font-mono text-stone-500">Síntesis de Cierre · 2030</div>
            <h2 className="font-serif text-lg font-semibold text-stone-950 mt-0.5">
              Horizonte Proyectado de Industria
            </h2>
          </div>

          <div className="divide-y divide-stone-200 flex-1 flex flex-col justify-center">
            <div className="p-6">
              <div className="text-xs text-stone-500 font-medium">Inversión Total Estimada (2030)</div>
              <div className="text-2xl font-serif font-semibold text-stone-950 mt-1 tabular-nums">
                {formatCurrencyValue(proj2030?.total, currencyMode)}
              </div>
              <div className="text-xs font-mono text-emerald-700 font-semibold mt-1 tabular-nums">
                +
                {(
                  ((proj2030?.total! - aggregateForecast[0].total) /
                    aggregateForecast[0].total) *
                  100
                ).toFixed(1)}
                % acumulado vs. 2025
              </div>
            </div>

            <div className="p-6">
              <div className="text-xs text-stone-500 font-medium">Digital Proyectado (2030)</div>
              <div className="text-xl font-serif font-semibold text-blue-900 mt-1 tabular-nums">
                {formatCurrencyValue(
                  allForecasts.digital.forecastData.find((p) => p.year === 2030)?.value,
                  currencyMode
                )}
              </div>
              <div className="text-xs text-stone-600 mt-1 font-mono tabular-nums">
                Cuota estimada:{' '}
                <strong className="text-stone-950">
                  {(
                    (allForecasts.digital.forecastData.find((p) => p.year === 2030)?.value! /
                      total2030) *
                    100
                  ).toFixed(1)}
                  %
                </strong>{' '}
                del mercado
              </div>
            </div>

            <div className="p-6">
              <div className="text-xs text-stone-500 font-medium">Publicidad Exterior (OOH / DOOH)</div>
              <div className="text-xl font-serif font-semibold text-stone-950 mt-1 tabular-nums">
                {formatCurrencyValue(
                  allForecasts.pubExterior.forecastData.find((p) => p.year === 2030)?.value,
                  currencyMode
                )}
              </div>
              <div className="text-xs font-mono text-stone-600 mt-1 tabular-nums">
                CAGR 2025–2030: +{allForecasts.pubExterior.projectedCAGR}% anual
              </div>
            </div>
          </div>

          <div className="px-6 py-3 bg-[#FAF9F6] border-t border-stone-200 text-[11px] text-stone-500">
            Calibrado sobre serie histórica auditada 1995–2025
          </div>
        </aside>
      </div>

      {/* Fig 06: Individual Medium Detailed Forecast */}
      <article className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-stone-500">Figura 06 · Desglose por Medio</div>
            <h2 className="font-serif text-xl font-semibold text-stone-950 mt-0.5">
              Pronóstico Individual: {MEDIA_METAS[selectedMedia].label}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_MEDIA_KEYS.map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => setSelectedMedia(k)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedMedia === k
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {MEDIA_METAS[k].shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Clean 4-column summary strip (no nested card boxes) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 bg-[#FAF9F6] border-b border-stone-200">
          <div className="p-5">
            <div className="text-[11px] text-stone-500 font-medium">Cierre 2025 (Real)</div>
            <div className="text-base font-mono font-semibold text-stone-950 mt-1 tabular-nums">
              {formatCurrencyValue(currentForecast.historicalData.slice(-1)[0].value, currencyMode)}
            </div>
          </div>
          <div className="p-5">
            <div className="text-[11px] text-stone-500 font-medium">Pronóstico 2026</div>
            <div className="text-base font-mono font-semibold text-blue-900 mt-1 tabular-nums">
              {formatCurrencyValue(
                currentForecast.forecastData.find((p) => p.year === 2026)?.value,
                currencyMode
              )}
            </div>
          </div>
          <div className="p-5">
            <div className="text-[11px] text-stone-500 font-medium">Pronóstico 2030</div>
            <div className="text-base font-mono font-semibold text-stone-950 mt-1 tabular-nums">
              {formatCurrencyValue(
                currentForecast.forecastData.find((p) => p.year === 2030)?.value,
                currencyMode
              )}
            </div>
          </div>
          <div className="p-5">
            <div className="text-[11px] text-stone-500 font-medium">CAGR Proyectado (25–30)</div>
            <div
              className={`text-base font-mono font-semibold mt-1 tabular-nums ${
                currentForecast.projectedCAGR >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {currentForecast.projectedCAGR >= 0 ? '+' : ''}
              {currentForecast.projectedCAGR}% anual
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mediaSeriesData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickFormatter={(val) => formatValueCompact(val, currencyMode)}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    formatCurrencyValue(Number(val), currencyMode),
                    name === 'historical'
                      ? 'Histórico'
                      : name === 'forecast'
                      ? 'Pronóstico Base'
                      : name === 'optimistic'
                      ? 'Optimista'
                      : name === 'pessimistic'
                      ? 'Pesimista'
                      : name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    borderColor: '#292524',
                    borderRadius: '6px',
                    color: '#fafaf9',
                    fontSize: '11px',
                  }}
                />
                {scenarioMode === 'all_scenarios' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="optimistic"
                      stroke="#047857"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="pessimistic"
                      stroke="#be123c"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}
                <Line
                  type="monotone"
                  dataKey="historical"
                  name="historical"
                  stroke={MEDIA_METAS[selectedMedia].color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: MEDIA_METAS[selectedMedia].color }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="forecast"
                  stroke={MEDIA_METAS[selectedMedia].color}
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3.5, fill: MEDIA_METAS[selectedMedia].color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </article>

      {/* Tabla 03: Comprehensive Multi-Media Forecast Table (2025 - 2030) */}
      <section className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <div className="text-xs font-mono text-stone-500">Tabla 03 · Proyecciones Anuales</div>
          <h2 className="font-serif text-xl font-semibold text-stone-950 mt-0.5">
            Matriz Comparativa de Pronósticos por Medio (2025–2030)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Estimaciones anuales del modelo seleccionado, tasa compuesta quinquenal y participación esperada al 2030
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-5">Medio Publicitario</th>
                <th className="py-3.5 px-3 text-right">2025 (Real)</th>
                <th className="py-3.5 px-3 text-right">2026 (P)</th>
                <th className="py-3.5 px-3 text-right">2027 (P)</th>
                <th className="py-3.5 px-3 text-right">2028 (P)</th>
                <th className="py-3.5 px-3 text-right">2029 (P)</th>
                <th className="py-3.5 px-3 text-right font-bold text-stone-950">2030 (P)</th>
                <th className="py-3.5 px-3 text-right">CAGR 25–30</th>
                <th className="py-3.5 px-5 text-right font-bold text-blue-900">Cuota 2030</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 tabular-nums">
              {ALL_MEDIA_KEYS.map((k) => {
                const fc = allForecasts[k];
                const v2025 = fc.forecastData.find((p) => p.year === 2025)?.value || 0;
                const v2026 = fc.forecastData.find((p) => p.year === 2026)?.value || 0;
                const v2027 = fc.forecastData.find((p) => p.year === 2027)?.value || 0;
                const v2028 = fc.forecastData.find((p) => p.year === 2028)?.value || 0;
                const v2029 = fc.forecastData.find((p) => p.year === 2029)?.value || 0;
                const v2030 = fc.forecastData.find((p) => p.year === 2030)?.value || 0;
                const share2030 = total2030 > 0 ? (v2030 / total2030) * 100 : 0;

                return (
                  <tr
                    key={k}
                    onClick={() => setSelectedMedia(k)}
                    className={`hover:bg-stone-50 cursor-pointer transition-colors ${
                      selectedMedia === k ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5 font-medium text-stone-900">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs shrink-0"
                          style={{ backgroundColor: MEDIA_METAS[k].color }}
                          aria-hidden="true"
                        />
                        <span>{MEDIA_METAS[k].label}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-600">
                      {formatValueCompact(v2025, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-700">
                      {formatValueCompact(v2026, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-700">
                      {formatValueCompact(v2027, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-700">
                      {formatValueCompact(v2028, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-stone-700">
                      {formatValueCompact(v2029, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-stone-950">
                      {formatValueCompact(v2030, currencyMode)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          fc.projectedCAGR >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {fc.projectedCAGR >= 0 ? '+' : ''}
                        {fc.projectedCAGR}%
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-blue-900">
                      {share2030.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}

              <tr className="bg-stone-100/90 font-bold text-stone-950 border-t border-stone-300">
                <td className="py-3.5 px-5">TOTAL INDUSTRIA</td>
                <td className="py-3.5 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[0]?.total, currencyMode)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[1]?.total, currencyMode)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[2]?.total, currencyMode)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[3]?.total, currencyMode)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[4]?.total, currencyMode)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-blue-950">
                  {formatValueCompact(aggregateForecast[5]?.total, currencyMode)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-emerald-800">
                  +
                  {(
                    (Math.pow(
                      aggregateForecast[5]?.total / aggregateForecast[0]?.total,
                      1 / 5
                    ) -
                      1) *
                    100
                  ).toFixed(1)}
                  %
                </td>
                <td className="py-3.5 px-5 text-right font-mono text-blue-950">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Dark Plate: Interactive Media Mix Budget Simulator */}
      <section className="bg-stone-950 text-stone-100 p-6 sm:p-7 rounded-lg border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>Herramienta de Planeación de Agencia</span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-white mt-1">
              Simulador Interactivo de Distribución de Presupuesto (Media Mix)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sim-budget-input" className="text-xs text-stone-400">
              Presupuesto objetivo:
            </label>
            <input
              id="sim-budget-input"
              type="number"
              value={simTargetBudget}
              onChange={(e) => setSimTargetBudget(Math.max(0, Number(e.target.value)))}
              className="bg-stone-900 border border-stone-700 rounded-md px-3 py-1.5 text-xs font-mono font-semibold text-white w-36 focus:ring-2 focus:ring-blue-500 focus:outline-hidden tabular-nums"
            />
            <span className="text-xs text-stone-400 font-mono">M COP</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-5">
          {ALL_MEDIA_KEYS.map((k) => {
            const meta = MEDIA_METAS[k];
            const currentPct = simMix[k] || 0;
            const allocatedAmount = (simTargetBudget * currentPct) / 100;

            return (
              <div
                key={k}
                className="p-4 bg-stone-900/70 rounded-md border border-stone-800"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-stone-200">{meta.label}</span>
                  </div>
                  <span className="font-mono font-semibold text-blue-300 tabular-nums">
                    {currentPct}%
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={80}
                  step={0.5}
                  value={currentPct}
                  aria-label={`Porcentaje asignado a ${meta.label}`}
                  onChange={(e) =>
                    setSimMix({ ...simMix, [k]: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2.5 font-mono tabular-nums">
                  <span>Asignado:</span>
                  <span className="font-semibold text-white">
                    {formatCurrencyValue(allocatedAmount, currencyMode)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 tabular-nums">
            <span className="text-stone-400">Suma total del mix asignado:</span>
            <span
              className={`font-mono font-bold text-sm ${
                Math.abs(simMixSum - 100) < 0.1 ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {simMixSum.toFixed(1)}% / 100%
            </span>
            {Math.abs(simMixSum - 100) >= 0.1 && (
              <span className="text-[11px] text-amber-200 font-mono">
                (Diferencia: {(100 - simMixSum).toFixed(1)}%)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (simMixSum > 0) {
                const normalized: Record<MediaKey, number> = {} as any;
                ALL_MEDIA_KEYS.forEach((k) => {
                  normalized[k] = Number(((simMix[k] / simMixSum) * 100).toFixed(1));
                });
                setSimMix(normalized);
              }
            }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors cursor-pointer text-xs whitespace-nowrap"
          >
            Normalizar al 100%
          </button>
        </div>
      </section>
    </div>
  );
};
