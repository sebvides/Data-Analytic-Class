import React, { useState, useMemo } from 'react';
import { 
  CurrencyMode, 
  MediaKey, 
  ForecastModelType, 
  MediaForecastResult 
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
  getAllMediaForecasts, 
  getIndustryAggregateForecast, 
  runForecastForMedia 
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
  Legend 
} from 'recharts';
import { 
  LineChart as LineChartIcon, 
  Sliders, 
  Calculator, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  Sparkles,
  BarChart4
} from 'lucide-react';

interface ForecastViewProps {
  currencyMode: CurrencyMode;
}

export const ForecastView: React.FC<ForecastViewProps> = ({ currencyMode }) => {
  const [selectedModel, setSelectedModel] = useState<ForecastModelType>('logistic_damped');
  const [selectedMedia, setSelectedMedia] = useState<MediaKey>('digital');
  const [scenarioMode, setScenarioMode] = useState<'base' | 'all_scenarios'>('all_scenarios');
  const [horizonYears, setHorizonYears] = useState<number>(5); // 2026 to 2030

  // Budget Simulator state
  const [simTargetBudget, setSimTargetBudget] = useState<number>(5500000); // 5.5B COP
  const [simMix, setSimMix] = useState<Record<MediaKey, number>>({
    digital: 62,
    tvNacional: 16,
    radio: 10,
    pubExterior: 7,
    prensa: 3,
    tvRegional: 1.5,
    revistas: 0.5,
  });

  // Calculate forecasts for all media
  const allForecasts = useMemo(
    () => getAllMediaForecasts(selectedModel, currencyMode, horizonYears),
    [selectedModel, currencyMode, horizonYears]
  );

  const aggregateForecast = useMemo(
    () => getIndustryAggregateForecast(allForecasts),
    [allForecasts]
  );

  // Current inspected media forecast
  const currentForecast = allForecasts[selectedMedia];

  // Combined chart data for the selected media (historical 2018-2025 + forecast 2026-2030)
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

    // Merge without duplicating 2025
    return [...historicalSlice.filter((h) => h.year < 2025), ...forecastSlice];
  }, [currentForecast]);

  // Aggregate Chart Data (2018 to 2030)
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

  // Total forecast at 2030
  const proj2030 = aggregateForecast.find((p) => p.year === 2030);
  const total2030 = proj2030 ? proj2030.total : 1;

  // Simulator mix sum
  const simMixSum = Object.values(simMix).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Forecasting Model Controls Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Parámetros y Modelos Econométricos de Pronóstico
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Proyecciones estadísticas del mix de inversión publicitaria hacia el horizonte 2026 – 2030
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Model Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Modelo:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ForecastModelType)}
                aria-label="Seleccionar modelo econométrico de pronóstico"
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="logistic_damped">
                  Curva Logística / Crecimiento Amortiguado (Recomendado)
                </option>
                <option value="linear_recent">
                  Regresión Lineal Reciente (Tendencia 2018-2025)
                </option>
                <option value="exponential_smoothing">
                  Suavizado Exponencial de Holt (Doble nivel)
                </option>
                <option value="cagr_trend">
                  Tasa Compuesta Reciente (CAGR 5 Años)
                </option>
              </select>
            </div>

            {/* Scenario toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setScenarioMode('base')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  scenarioMode === 'base'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solo Base
              </button>
              <button
                onClick={() => setScenarioMode('all_scenarios')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  scenarioMode === 'all_scenarios'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Muestra intervalo de confianza 95% y escenarios optimista / pesimista"
              >
                Escenarios & Bandas
              </button>
            </div>
          </div>
        </div>

        {/* Model explanation pill */}
        <div className="mt-3.5 p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              {selectedModel === 'logistic_damped' && 'Modelo Logístico Amortiguado: '}
              {selectedModel === 'linear_recent' && 'Regresión Lineal Ponderada: '}
              {selectedModel === 'exponential_smoothing' && 'Suavizado Exponencial de Holt: '}
              {selectedModel === 'cagr_trend' && 'Tasa Compuesta (CAGR 5A): '}
            </span>
            {selectedModel === 'logistic_damped' &&
              'Modela la saturación natural de la penetración de internet en Digital (suavizando crecimientos infinitos) y fija un suelo de nicho para la prensa y revistas impresas.'}
            {selectedModel === 'linear_recent' &&
              'Ajusta la pendiente de los últimos 7 años (2018-2025), aislando la dinámica moderna de los años iniciales de monopolio televisivo.'}
            {selectedModel === 'exponential_smoothing' &&
              'Asigna mayor peso a las observaciones recientes con parámetros adaptativos de nivel y tendencia.'}
            {selectedModel === 'cagr_trend' &&
              'Extrapola a futuro la tasa compuesta de crecimiento anual observada en el periodo 2020 a 2025.'}
          </div>
        </div>
      </div>

      {/* Aggregate Industry Forecast Chart & 2030 Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Total Industry Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Proyección de la Inversión Publicitaria Total en Colombia (2025 – 2030)
              </h2>
              <p className="text-xs text-slate-500">
                Línea histórica consolidada y abanico de incertidumbre hacia 2030
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Horizonte: 2026, 2027, 2028, 2029, 2030
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregateChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="projBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
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
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                {scenarioMode === 'all_scenarios' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="none"
                      fill="url(#projBand)"
                    />
                    <Line
                      type="monotone"
                      dataKey="optimistic"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="pessimistic"
                      stroke="#f43f5e"
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
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0f172a' }}
                />
                <Line
                  type="monotone"
                  dataKey="projectedTotal"
                  name="projectedTotal"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3.5, fill: '#2563eb' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-900" />
              <span>Histórico (2018-2025)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-600 border-dashed" />
              <span className="font-semibold text-blue-600">Proyección Base (2026-2030)</span>
            </div>
            {scenarioMode === 'all_scenarios' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500 border-dashed" />
                  <span className="text-emerald-700">Optimista (+12%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-rose-500 border-dashed" />
                  <span className="text-rose-700">Pesimista (-12%)</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Key Projections Summary for 2030 */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                Horizonte 2030: Resumen Industria
              </h2>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                Pronóstico
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Estimación econométrica a 5 años
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <div className="text-[11px] text-slate-500 font-medium">Inversión Total Proyectada (2030)</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {formatCurrencyValue(proj2030?.total, currencyMode)}
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                  +
                  {(
                    ((proj2030?.total! - aggregateForecast[0].total) /
                      aggregateForecast[0].total) *
                    100
                  ).toFixed(1)}
                  % acum. vs 2025
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <div className="text-[11px] text-slate-500 font-medium">Digital proyectado a 2030</div>
                <div className="text-lg font-bold text-blue-600 mt-0.5">
                  {formatCurrencyValue(
                    allForecasts.digital.forecastData.find((p) => p.year === 2030)?.value,
                    currencyMode
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Cuota estimada:{' '}
                  <span className="font-bold text-slate-900">
                    {(
                      (allForecasts.digital.forecastData.find((p) => p.year === 2030)?.value! /
                        total2030) *
                      100
                    ).toFixed(1)}
                    %
                  </span>{' '}
                  de la inversión
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <div className="text-[11px] text-slate-500 font-medium">Publicidad Exterior (OOH/DOOH)</div>
                <div className="text-lg font-bold text-purple-600 mt-0.5">
                  {formatCurrencyValue(
                    allForecasts.pubExterior.forecastData.find((p) => p.year === 2030)?.value,
                    currencyMode
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  CAGR proyectado: +{allForecasts.pubExterior.projectedCAGR}% anual
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Datos validados con series históricas 1995-2025</span>
          </div>
        </div>
      </div>

      {/* Individual Medium Detailed Inspector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Pronóstico Detallado por Medio Individual
            </h2>
            <p className="text-xs text-slate-500">
              Trayectoria histórica y cono de proyección específica para el medio seleccionado
            </p>
          </div>

          {/* Media selector buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_MEDIA_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setSelectedMedia(k)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedMedia === k
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {MEDIA_METAS[k].shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Medium Hero Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">Inversión 2025 (Cierre)</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {formatCurrencyValue(currentForecast.historicalData.slice(-1)[0].value, currencyMode)}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">Proyección 2026 (1 Año)</div>
            <div className="text-base font-bold text-blue-600 mt-0.5">
              {formatCurrencyValue(
                currentForecast.forecastData.find((p) => p.year === 2026)?.value,
                currencyMode
              )}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">Proyección 2030 (5 Años)</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {formatCurrencyValue(
                currentForecast.forecastData.find((p) => p.year === 2030)?.value,
                currencyMode
              )}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <div className="text-[11px] text-slate-500 font-medium">CAGR Proyectado (25-30)</div>
            <div
              className={`text-base font-bold mt-0.5 ${
                currentForecast.projectedCAGR >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {currentForecast.projectedCAGR >= 0 ? '+' : ''}
              {currentForecast.projectedCAGR}% anual
            </div>
          </div>
        </div>

        {/* Medium Forecast Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mediaSeriesData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
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
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              {scenarioMode === 'all_scenarios' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="optimistic"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="pessimistic"
                    stroke="#f43f5e"
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

      {/* Comprehensive Multi-Media Forecast Table (2025 - 2030) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Tabla Comparativa de Pronósticos por Medio (2025 – 2030)
          </h2>
          <p className="text-xs text-slate-500">
            Valores proyectados año a año, tasa compuesta anual y cuota de mercado estimada al 2030
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Medio</th>
                <th className="py-3 px-3 text-right">2025 (Base)</th>
                <th className="py-3 px-3 text-right">2026 (P)</th>
                <th className="py-3 px-3 text-right">2027 (P)</th>
                <th className="py-3 px-3 text-right">2028 (P)</th>
                <th className="py-3 px-3 text-right">2029 (P)</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">2030 (P)</th>
                <th className="py-3 px-3 text-right">CAGR 25-30</th>
                <th className="py-3 px-3 text-right font-bold text-blue-700">Cuota 2030</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                    className={`hover:bg-slate-50/70 cursor-pointer ${
                      selectedMedia === k ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: MEDIA_METAS[k].color }}
                      />
                      <span>{MEDIA_METAS[k].label}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatValueCompact(v2025, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatValueCompact(v2026, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatValueCompact(v2027, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatValueCompact(v2028, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatValueCompact(v2029, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatValueCompact(v2030, currencyMode)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          fc.projectedCAGR >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {fc.projectedCAGR >= 0 ? '+' : ''}
                        {fc.projectedCAGR}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                      {share2030.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-slate-100/90 font-bold text-slate-900 border-t border-slate-300">
                <td className="py-3 px-4">TOTAL INDUSTRIA</td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[0]?.total, currencyMode)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[1]?.total, currencyMode)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[2]?.total, currencyMode)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[3]?.total, currencyMode)}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatValueCompact(aggregateForecast[4]?.total, currencyMode)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-blue-900">
                  {formatValueCompact(aggregateForecast[5]?.total, currencyMode)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700">
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
                <td className="py-3 px-3 text-right font-mono text-blue-900">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Media Mix Budget Simulator */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Simulador Interactivo de Media Mix & Presupuesto Publicitario
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Planifica un presupuesto objetivo y ajusta la distribución porcentual para evaluar la asignación de recursos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Presupuesto a simular:</span>
            <input
              type="number"
              value={simTargetBudget}
              onChange={(e) => setSimTargetBudget(Math.max(0, Number(e.target.value)))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white w-40 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <span className="text-xs text-slate-400 font-mono">M COP</span>
          </div>
        </div>

        {/* Sliders for each media */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {ALL_MEDIA_KEYS.map((k) => {
            const meta = MEDIA_METAS[k];
            const currentPct = simMix[k] || 0;
            const allocatedAmount = (simTargetBudget * currentPct) / 100;

            return (
              <div
                key={k}
                className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="font-semibold text-slate-200">{meta.label}</span>
                  </div>
                  <span className="font-mono font-bold text-blue-400">{currentPct}%</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={80}
                  step={0.5}
                  value={currentPct}
                  onChange={(e) =>
                    setSimMix({ ...simMix, [k]: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>Asignado:</span>
                  <span className="font-bold text-white">
                    {formatCurrencyValue(allocatedAmount, currencyMode)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulator Validation Bar */}
        <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Suma total del Mix asignado:</span>
            <span
              className={`font-mono font-bold text-sm ${
                Math.abs(simMixSum - 100) < 0.1 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {simMixSum.toFixed(1)}% / 100%
            </span>
            {Math.abs(simMixSum - 100) >= 0.1 && (
              <span className="text-[11px] text-amber-300">
                (Diferencia: {(100 - simMixSum).toFixed(1)}%)
              </span>
            )}
          </div>

          <button
            onClick={() => {
              // Normalize to exactly 100%
              if (simMixSum > 0) {
                const normalized: Record<MediaKey, number> = {} as any;
                ALL_MEDIA_KEYS.forEach((k) => {
                  normalized[k] = Number(((simMix[k] / simMixSum) * 100).toFixed(1));
                });
                setSimMix(normalized);
              }
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors cursor-pointer text-xs"
          >
            Normalizar al 100%
          </button>
        </div>
      </div>
    </div>
  );
};
