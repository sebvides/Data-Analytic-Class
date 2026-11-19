import React from 'react';
import { CurrencyMode } from '../types/media';
import { 
  RAW_MEDIA_DATA, 
  MEDIA_METAS, 
  ALL_MEDIA_KEYS, 
  formatCurrencyValue, 
  convertValue 
} from '../data/mediaData';
import { calculateDescriptiveStats, calculateMacroCorrelations } from '../utils/statistics';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Compass,
  FileText
} from 'lucide-react';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencyMode: CurrencyMode;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  currencyMode,
}) => {
  if (!isOpen) return null;

  const rec2025 = RAW_MEDIA_DATA[RAW_MEDIA_DATA.length - 1];
  const rec2024 = RAW_MEDIA_DATA[RAW_MEDIA_DATA.length - 2];
  const rec1995 = RAW_MEDIA_DATA[0];
  const rec2008 = RAW_MEDIA_DATA.find((d) => d.year === 2008)!;

  const stats = calculateDescriptiveStats(currencyMode);
  const totalStats = stats.find((s) => s.key === 'totalInv')!;

  const total2025 = convertValue(rec2025.totalInv, 2025, currencyMode, rec2025.trm)!;
  const digital2025 = convertValue(rec2025.digital, 2025, currencyMode, rec2025.trm)!;
  const tvNac2025 = convertValue(rec2025.tvNacional, 2025, currencyMode, rec2025.trm)!;
  const radio2025 = convertValue(rec2025.radio, 2025, currencyMode, rec2025.trm)!;
  const exterior2025 = convertValue(rec2025.pubExterior, 2025, currencyMode, rec2025.trm)!;
  const prensa2025 = convertValue(rec2025.prensa, 2025, currencyMode, rec2025.trm)!;

  const digitalShare = (digital2025 / total2025) * 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Informe Ejecutivo: Inversión en Medios en Colombia
              </h2>
              <p className="text-xs text-slate-400">
                Diagnóstico Histórico (1995-2025) y Perspectivas Estratégicas 2026-2030
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed print:p-0 print:space-y-4">
          {/* Header in print */}
          <div className="border-b border-slate-200 pb-4">
            <div className="text-[11px] font-mono text-blue-600 font-semibold uppercase tracking-wider">
              Documento de Análisis Estratégico · Sector Publicitario Colombia
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              La Gran Transformación del Mercado Publicitario Colombiano
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Serie Histórica Oficial 1995–2025 · Modelos Predictivos Econométricos · Emitido en Octubre 2026
            </p>
          </div>

          {/* Section 1: Resumen Ejecutivo */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              1. Resumen Ejecutivo
            </h3>
            <p className="text-slate-600">
              Durante las últimas tres décadas (1995–2025), el mercado publicitario en Colombia transitó desde un monopolio televisivo e impreso hacia un ecosistema dominado por plataformas digitales y experiencias omnicanal. Al cierre de 2025, la inversión total en medios alcanzó una cifra récord de{' '}
              <strong className="text-slate-900">
                {formatCurrencyValue(total2025, currencyMode)}
              </strong>
              , experimentando un crecimiento interanual del{' '}
              <strong className="text-emerald-700">+{totalStats.yoyGrowth.toFixed(1)}%</strong>{' '}
              respecto al año anterior.
            </p>
            <p className="text-slate-600">
              El segmento <strong className="text-blue-700">Digital</strong> concentra hoy el{' '}
              <strong>{digitalShare.toFixed(1)}%</strong> de toda la inversión publicitaria del país ({formatCurrencyValue(digital2025, currencyMode)}), consolidando una posición hegemónica que superó a la televisión abierta en 2021.
            </p>
          </div>

          {/* Section 2: Diagnóstico por Categoría de Medio */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              2. Diagnóstico por Medios: Ganadores, Resistentes y en Declive
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Líderes de Crecimiento
                </div>
                <ul className="space-y-1 text-slate-700">
                  <li>
                    <strong>Digital:</strong> CAGR de dos dígitos, impulsado por video digital, redes sociales, retail media y publicidad programática.
                  </li>
                  <li>
                    <strong>Publicidad Exterior (OOH):</strong> Fuerte repunte post-pandemia (+12.4% en 2025) apalancado en pantallas digitales DOOH y geolocalización.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <Compass className="w-4 h-4 text-amber-600" />
                  Bastiones de Resiliencia
                </div>
                <ul className="space-y-1 text-slate-700">
                  <li>
                    <strong>TV Nacional:</strong> Mantiene $908.6 mil millones COP (17.7% share), conservando su papel clave para branding masivo y credibilidad.
                  </li>
                  <li>
                    <strong>Radio:</strong> Notoria estabilidad ($560.7 mil millones COP, 10.9% share), gracias a la cercanía territorial y la transición a audio digital/podcast.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
                <div className="font-bold text-rose-900 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Medios en Reconfiguración
                </div>
                <ul className="space-y-1 text-slate-700">
                  <li>
                    <strong>Prensa Impresa:</strong> Pasó de $637 mil millones en su pico (2013) a $206.9 mil millones en 2025 (-67.5% de contracción acumulada).
                  </li>
                  <li>
                    <strong>Revistas:</strong> Cayó de $118 mil millones (2007) a $6.8 mil millones en 2025, transformándose en publicaciones de nicho exclusivo.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Hallazgos Econométricos */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              3. Hallazgos Econométricos Clave
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-700 font-mono">A.</span>
                <span>
                  <strong>Correlación casi perfecta con la Penetración de Internet (r = 0.98):</strong> El ascenso digital en Colombia está estrechamente anclado al despliegue de conectividad móvil y fibra óptica, que pasó del 22.6% en 2008 al 82.3% de los colombianos en 2025.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-700 font-mono">B.</span>
                <span>
                  <strong>Sensibilidad Cambiaria (TRM):</strong> Gran parte del inventario publicitario digital (Google, Meta, TikTok) se cotiza o indexa indirectamente al dólar estadounidense, lo que genera presiones de costos en años de alta devaluación.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-700 font-mono">C.</span>
                <span>
                  <strong>Reconcentración del Mercado (HHI):</strong> El índice Herfindahl-Hirschman muestra que el mercado publicitario colombiano ha vuelto a niveles de concentración superiores a 4.000 puntos, impulsado por los gigantes tecnológicos globales.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Recomendaciones Estratégicas 2026-2030 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              4. Recomendaciones Estratégicas para Anunciantes y Agencias (2026–2030)
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Adopción de Modelos de Atribución Omnicanal (MMM):</strong> Con más del 60% del presupuesto proyectado en Digital para 2026-2030, las marcas deben evitar la canibalización y medir el impacto sinérgico entre TV, OOH y formatos de conversión digital.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Inversión en Publicidad Exterior Digital (DOOH):</strong> OOH ofrece la mejor relación costo-impacto en el mundo físico y continúa expandiéndose con pantallas inteligentes programáticas en las principales ciudades colombianas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Cobertura Regional Estratégica:</strong> La TV Regional y la Radio Comunitaria mantienen altos índices de confianza en regiones descentralizadas (Antioquia, Valle, Caribe, Eje Cafetero), siendo indispensables para marcas de consumo masivo y retail.
                </span>
              </li>
            </ul>
          </div>

          {/* Signature Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>Generado automáticamente por el Dashboard de Inversión en Medios Colombia</div>
            <div>Datos oficiales 1995–2025 · Proyecciones 2026–2030</div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
