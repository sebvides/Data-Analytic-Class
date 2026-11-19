import React from 'react';
import { CurrencyMode } from '../types/media';
import { Download } from 'lucide-react';
import { ActiveTab } from '../App';

interface PublicationMastheadProps {
  activeTab: ActiveTab;
  currencyMode: CurrencyMode;
  onCurrencyChange: (mode: CurrencyMode) => void;
  onExportCSV: () => void;
}

const SECTION_DESCRIPTIONS: Record<
  ActiveTab,
  { sectionLabel: string; headline: string; deck: string }
> = {
  descriptive: {
    sectionLabel: 'Capítulo 01 · Radiografía del Mercado',
    headline: 'Inversión Publicitaria en Medios en Colombia',
    deck: 'Análisis descriptivo de participación de mercado, métricas paramétricas y evolución del mix publicitario nacional entre 1995 y 2025.',
  },
  trends: {
    sectionLabel: 'Capítulo 02 · Dinámica Estructural',
    headline: 'Tendencias Históricas y Ciclos de Inversión',
    deck: 'Seguimiento longitudinal de las cuatro eras mediáticas, tasas de crecimiento compuesto (CAGR), concentración del mercado y sensibilidad macroeconómica.',
  },
  forecast: {
    sectionLabel: 'Capítulo 03 · Proyecciones 2026–2030',
    headline: 'Pronósticos Econométricos y Escenarios de Pauta',
    deck: 'Modelos predictivos por categoría de medio con bandas de incertidumbre y simulador de asignación presupuestaria para planeación de medios.',
  },
  data: {
    sectionLabel: 'Anexo Estadístico · Serie Auditada',
    headline: 'Repositorio Histórico de Inversión y Variables Macro',
    deck: 'Registro consolidado de 31 años de inversión publicitaria en Colombia cruzado con inflación (IPC), tasa de cambio (TRM), conectividad y demografía DANE.',
  },
};

export const PublicationMasthead: React.FC<PublicationMastheadProps> = ({
  activeTab,
  currencyMode,
  onCurrencyChange,
  onExportCSV,
}) => {
  const copy = SECTION_DESCRIPTIONS[activeTab];

  return (
    <section className="border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Top Metadata Line (Zero-Pill clean unboxed text) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-3">
          <span className="font-semibold text-blue-900">{copy.sectionLabel}</span>
          <span aria-hidden="true">·</span>
          <span>Observatorio de Inteligencia de Medios</span>
          <span aria-hidden="true">·</span>
          <span>Edición Colombia 1995–2025</span>
        </div>

        {/* Masthead Split: Headline & Deck on Left, Workspace Currency Controls on Right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1
              className="font-serif text-3xl sm:text-4xl font-semibold text-stone-950 tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {copy.headline}
            </h1>
            <p className="text-sm sm:text-[15px] text-stone-600 leading-relaxed mt-2.5">
              {copy.deck}
            </p>
          </div>

          {/* Operational Workspace Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-stone-500">
                Base monetaria del informe
              </span>
              <div
                className="inline-flex items-center p-1 bg-stone-100 border border-stone-200 rounded-lg text-xs"
                role="group"
                aria-label="Selector de moneda y ajuste inflacionario"
              >
                <button
                  type="button"
                  onClick={() => onCurrencyChange('cop_nominal')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currencyMode === 'cop_nominal'
                      ? 'bg-white text-stone-950 shadow-2xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                  title="Valores históricos en Millones de COP sin ajuste inflacionario"
                >
                  COP Corrientes
                </button>
                <button
                  type="button"
                  onClick={() => onCurrencyChange('cop_real_2025')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currencyMode === 'cop_real_2025'
                      ? 'bg-white text-stone-950 shadow-2xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                  title="Valores deflactados con IPC acumulado a poder adquisitivo de 2025"
                >
                  COP Reales (2025)
                </button>
                <button
                  type="button"
                  onClick={() => onCurrencyChange('usd')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    currencyMode === 'usd'
                      ? 'bg-white text-stone-950 shadow-2xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                  title="Convertido a Millones de USD a la TRM promedio de cada año"
                >
                  USD (TRM)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-stone-500 hidden sm:block">
                Archivo de datos
              </span>
              <button
                type="button"
                onClick={onExportCSV}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-stone-50 text-stone-800 rounded-lg border border-stone-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Descargar serie histórica completa en formato CSV"
              >
                <Download className="w-3.5 h-3.5 text-blue-800" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
