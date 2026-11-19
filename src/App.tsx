/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CurrencyMode } from './types/media';
import { Header } from './components/Header';
import { PublicationMasthead } from './components/PublicationMasthead';
import { DescriptiveView } from './components/DescriptiveView';
import { TrendView } from './components/TrendView';
import { ForecastView } from './components/ForecastView';
import { DataTableView } from './components/DataTableView';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { exportDatasetToCSV } from './utils/exportCsv';

export type ActiveTab = 'descriptive' | 'trends' | 'forecast' | 'data';

export default function App() {
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('cop_nominal');
  const [activeTab, setActiveTab] = useState<ActiveTab>('descriptive');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-950">
      {/* Top 3-Zone Editorial Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Editorial Publication Masthead & Operational Workspace Toolbar */}
      <PublicationMasthead
        activeTab={activeTab}
        currencyMode={currencyMode}
        onCurrencyChange={setCurrencyMode}
        onExportCSV={exportDatasetToCSV}
      />

      {/* Main Analytical Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full flex-1">
        {activeTab === 'descriptive' && (
          <DescriptiveView currencyMode={currencyMode} />
        )}

        {activeTab === 'trends' && (
          <TrendView currencyMode={currencyMode} />
        )}

        {activeTab === 'forecast' && (
          <ForecastView currencyMode={currencyMode} />
        )}

        {activeTab === 'data' && (
          <DataTableView
            currencyMode={currencyMode}
            onExportCSV={exportDatasetToCSV}
          />
        )}
      </main>

      {/* Executive Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        currencyMode={currencyMode}
      />

      {/* Quiet Editorial Agency Colophon Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-serif text-sm font-semibold text-stone-900">
              Ágora Media · Unidad de Inteligencia y Planeación de Medios
            </div>
            <p className="text-xs text-stone-500">
              Series auditadas 1995–2025 · Fuentes macroeconómicas: DANE y Banco de la República · Modelos econométricos propios
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className="hover:text-stone-900 hover:underline cursor-pointer"
            >
              Anexo Estadístico
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={exportDatasetToCSV}
              className="hover:text-stone-900 hover:underline cursor-pointer"
            >
              Descargar Base CSV
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="text-blue-800 hover:underline font-semibold cursor-pointer"
            >
              Abrir Informe Ejecutivo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
