import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  LineChart, 
  Table2 
} from 'lucide-react';

export type ActiveTab = 'descriptive' | 'trends' | 'forecast' | 'data';

interface TabsNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'descriptive' as ActiveTab,
      label: 'Análisis Descriptivo',
      shortLabel: 'Descriptivo',
      icon: BarChart2,
      badge: 'KPIs & Mix',
    },
    {
      id: 'trends' as ActiveTab,
      label: 'Análisis de Tendencias',
      shortLabel: 'Tendencias',
      icon: TrendingUp,
      badge: '1995-2025',
    },
    {
      id: 'forecast' as ActiveTab,
      label: 'Proyecciones y Pronósticos',
      shortLabel: 'Pronósticos',
      icon: LineChart,
      badge: '2026-2030',
    },
    {
      id: 'data' as ActiveTab,
      label: 'Explorador del Dataset',
      shortLabel: 'Datos',
      icon: Table2,
      badge: '31 Años',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-blue-100/80 text-blue-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
