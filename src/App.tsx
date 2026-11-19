/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CurrencyMode } from './types/media';
import { Header } from './components/Header';
import { TabsNav, ActiveTab } from './components/TabsNav';
import { DescriptiveView } from './components/DescriptiveView';
import { TrendView } from './components/TrendView';
import { ForecastView } from './components/ForecastView';
import { DataTableView } from './components/DataTableView';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { exportDatasetToCSV } from './utils/exportCsv';
import { 
  BarChart2, 
  TrendingUp, 
  LineChart, 
  Table2, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export default function App() {
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('cop_nominal');
  const [activeTab, setActiveTab] = useState<ActiveTab>('descriptive');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Fixed Header */}
      <Header
        currencyMode={currencyMode}
        onCurrencyChange={setCurrencyMode}
        onOpenReport={() => setIsReportOpen(true)}
        onExportCSV={exportDatasetToCSV}
      />

      {/* Primary Subnav Tabs */}
      <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Analytical Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
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

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-800">
              Observatorio de Inversión en Medios y Publicidad en Colombia
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Series históricas 1995–2025 · Modelos econométricos aplicados · Precios nominales y deflactados por IPC
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Series auditadas</span>
            </span>
            <span>·</span>
            <span>DANE / Banco de la República</span>
            <span>·</span>
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Ver Informe Ejecutivo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
