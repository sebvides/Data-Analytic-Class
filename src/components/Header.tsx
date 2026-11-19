import React from 'react';
import { ActiveTab } from '../App';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenReport: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'descriptive', label: 'Descriptivo' },
  { id: 'trends', label: 'Tendencias' },
  { id: 'forecast', label: 'Pronósticos' },
  { id: 'data', label: 'Datos' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenReport,
}) => {
  return (
    <header className="bg-[#FAF9F6]/95 backdrop-blur-xs border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onTabChange('descriptive')}
          className="font-serif text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
        >
          Ágora Media
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav
          className="hidden md:flex items-center gap-7 text-sm font-medium"
          aria-label="Secciones del informe"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`relative py-5 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 ${
                  isActive
                    ? 'text-stone-950 font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-800"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenReport}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            Informe Ejecutivo
          </button>
        </div>
      </div>

      {/* Mobile navigation strip (below md) */}
      <nav
        className="md:hidden border-t border-stone-200 bg-[#FAF9F6] px-4 flex items-center gap-5 overflow-x-auto"
        aria-label="Secciones del informe móvil"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative py-2.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                isActive ? 'text-stone-950 font-semibold' : 'text-stone-500'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-800"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
