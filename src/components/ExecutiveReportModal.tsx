import React from 'react';
import { CurrencyMode } from '../types/media';
import {
  RAW_MEDIA_DATA,
  formatCurrencyValue,
  convertValue,
} from '../data/mediaData';
import { calculateDescriptiveStats } from '../utils/statistics';
import {
  X,
  Printer,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Compass,
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
  const stats = calculateDescriptiveStats(currencyMode);
  const totalStats = stats.find((s) => s.key === 'totalInv')!;

  const total2025 = convertValue(rec2025.totalInv, 2025, currencyMode, rec2025.trm)!;
  const digital2025 = convertValue(rec2025.digital, 2025, currencyMode, rec2025.trm)!;
  const digitalShare = (digital2025 / total2025) * 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-stone-950 text-white flex items-center justify-between print:hidden">
          <div>
            <div className="font-serif text-base font-semibold text-white">
              Ágora Media · Informe Ejecutivo de Mercado
            </div>
            <p className="text-xs text-stone-400">
              Diagnóstico Histórico (1995–2025) y Perspectivas Estratégicas 2026–2030
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-white rounded-md border border-stone-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar informe ejecutivo"
              className="p-1.5 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Editorial Paper Content */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-7 text-stone-800 text-xs sm:text-sm leading-relaxed print:p-0 print:space-y-5">
          {/* Masthead in Document */}
          <div className="border-b border-stone-200 pb-5">
            <div className="text-xs font-mono text-blue-900 font-semibold">
              Ágora Media · Unidad de Inteligencia de Mercado · Edición Colombia
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-950 mt-1.5 leading-tight">
              La Gran Transformación del Mercado Publicitario Colombiano
            </h1>
            <p className="text-xs text-stone-500 mt-1.5">
              Serie Histórica Oficial 1995–2025 · Modelos Predictivos Econométricos · Documento para Anunciantes y Directores de Medios
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-2.5 max-w-prose">
            <h3 className="font-serif text-base font-semibold text-stone-950">
              01. Resumen Ejecutivo
            </h3>
            <p className="text-stone-600 leading-relaxed first-letter:text-4xl first-letter:font-serif first-letter:font-semibold first-letter:text-stone-950 first-letter:float-left first-letter:mr-2.5 first-letter:leading-none">
              Durante las últimas tres décadas (1995–2025), el mercado publicitario en Colombia transitó desde un monopolio televisivo e impreso hacia un ecosistema dominado por plataformas digitales y experiencias omnicanal. Al cierre de 2025, la inversión total en medios alcanzó una cifra récord de{' '}
              <strong className="text-stone-950 font-mono tabular-nums">
                {formatCurrencyValue(total2025, currencyMode)}
              </strong>
              , experimentando un crecimiento interanual del{' '}
              <strong className="text-emerald-700 font-mono tabular-nums">
                +{totalStats.yoyGrowth.toFixed(1)}%
              </strong>{' '}
              respecto al año anterior.
            </p>
            <p className="text-stone-600 leading-relaxed">
              El segmento <strong className="text-blue-900">Digital</strong> concentra hoy el{' '}
              <strong className="font-mono tabular-nums">{digitalShare.toFixed(1)}%</strong> de toda la inversión publicitaria del país (
              <span className="font-mono tabular-nums">{formatCurrencyValue(digital2025, currencyMode)}</span>), consolidando una posición hegemónica que superó a la televisión abierta en 2021.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-stone-950">
              02. Diagnóstico por Medios: Expansión, Resiliencia y Reconfiguración
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 border border-stone-200 rounded-md overflow-hidden text-xs">
              <div className="p-4 bg-[#FAF9F6]">
                <div className="font-semibold text-blue-950 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-800" />
                  <span>Líderes de Crecimiento</span>
                </div>
                <ul className="space-y-1.5 text-stone-700 leading-relaxed">
                  <li>
                    <strong>Digital:</strong> CAGR de dos dígitos impulsado por video digital, redes sociales, retail media y compra programática.
                  </li>
                  <li>
                    <strong>Exterior (OOH):</strong> Fuerte repunte post-pandemia (+12.4% en 2025) apalancado en pantallas digitales DOOH.
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-[#FAF9F6]">
                <div className="font-semibold text-stone-950 mb-2 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-700" />
                  <span>Bastiones de Resiliencia</span>
                </div>
                <ul className="space-y-1.5 text-stone-700 leading-relaxed">
                  <li>
                    <strong>TV Nacional:</strong> Mantiene $908.6 mil millones COP (17.7% cuota), clave para construcción de marca y alcance masivo.
                  </li>
                  <li>
                    <strong>Radio:</strong> Notoria estabilidad ($560.7 mil millones COP, 10.9% cuota) gracias a la capilaridad regional y audio digital.
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-[#FAF9F6]">
                <div className="font-semibold text-rose-950 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>Medios en Reconfiguración</span>
                </div>
                <ul className="space-y-1.5 text-stone-700 leading-relaxed">
                  <li>
                    <strong>Prensa Impresa:</strong> Pasó de $637 mil millones en su pico (2013) a $206.9 mil millones en 2025 (-67.5% acumulado).
                  </li>
                  <li>
                    <strong>Revistas:</strong> Cayó de $118 mil millones (2007) a $6.8 mil millones en 2025, orientándose a nichos especializados.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2.5">
            <h3 className="font-serif text-base font-semibold text-stone-950">
              03. Hallazgos Econométricos Clave
            </h3>
            <div className="bg-[#FAF9F6] p-5 rounded-md border border-stone-200 text-xs space-y-2.5 text-stone-700 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blue-900 font-mono">A.</span>
                <span>
                  <strong className="text-stone-950">Correlación estructural con Penetración de Internet (r = 0.98):</strong> El ascenso digital en Colombia está anclado al despliegue de conectividad móvil y fibra óptica, que pasó de 22.6% en 2008 a 82.3% en 2025.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blue-900 font-mono">B.</span>
                <span>
                  <strong className="text-stone-950">Sensibilidad Cambiaria (TRM):</strong> Gran parte del inventario digital global se cotiza o indexa al dólar estadounidense, generando presiones inflacionarias en presupuestos durante ciclos de devaluación.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blue-900 font-mono">C.</span>
                <span>
                  <strong className="text-stone-950">Reconcentración del Mercado (HHI):</strong> El índice Herfindahl-Hirschman supera nuevamente los 4.000 puntos debido a la alta participación del ecosistema digital.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2.5">
            <h3 className="font-serif text-base font-semibold text-stone-950">
              04. Recomendaciones Estratégicas de Agencia (2026–2030)
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-950">Modelos de Atribución Omnicanal (MMM):</strong> Con más del 60% del presupuesto proyectado en Digital hacia 2030, las marcas deben medir el efecto sinérgico entre TV, OOH y conversión digital.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-950">Expansión en Publicidad Exterior Digital (DOOH):</strong> La vía pública programática ofrece alto impacto contextual en las principales áreas metropolitanas del país.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-950">Cobertura Regional Estratégica:</strong> La TV Regional y la Radio conservan altos índices de credibilidad y penetración territorial para marcas de consumo masivo y retail.
                </span>
              </li>
            </ul>
          </div>

          {/* Signature Footer */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500">
            <div>Publicado por Ágora Media · Unidad de Inteligencia y Planeación de Medios</div>
            <div className="font-mono">Series auditadas 1995–2025 · Proyecciones 2026–2030</div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF9F6] border-t border-stone-200 flex items-center justify-end print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
