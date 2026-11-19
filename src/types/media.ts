export type MediaKey = 
  | 'tvRegional' 
  | 'revistas' 
  | 'pubExterior' 
  | 'prensa' 
  | 'radio' 
  | 'tvNacional' 
  | 'digital';

export interface RawMediaRecord {
  year: number;
  tvRegional: number | null;
  revistas: number | null;
  pubExterior: number | null;
  prensa: number | null;
  radio: number | null;
  tvNacional: number | null;
  digital: number | null;
  totalInv: number;
  ipc: number; // as percentage, e.g. 19.5
  trm: number; // average TRM COP/USD
  internetPenetration: number; // e.g. 82.3
  poblacionDane: number;
}

export type CurrencyMode = 'cop_nominal' | 'cop_real_2025' | 'usd';

export interface MediaMeta {
  key: MediaKey;
  label: string;
  shortLabel: string;
  color: string;
  lightColor: string;
  description: string;
  category: 'traditional' | 'digital' | 'ooh' | 'print';
}

export interface DescriptiveStats {
  key: MediaKey | 'totalInv';
  label: string;
  color: string;
  count: number;
  totalSum: number;
  mean: number;
  median: number;
  min: number;
  minYear: number;
  max: number;
  maxYear: number;
  stdDev: number;
  currentValue: number; // 2025
  previousValue: number; // 2024
  yoyGrowth: number; // 2024-2025 %
  shareCurrent: number; // % in 2025
  shareHistoricalAvg: number;
  cagr10Year: number; // 2015-2025 CAGR
}

export type ForecastModelType = 'linear_recent' | 'exponential_smoothing' | 'logistic_damped' | 'cagr_trend';

export interface ForecastPoint {
  year: number;
  isForecast: boolean;
  value: number;
  lowerBound: number;
  upperBound: number;
  optimistic: number;
  pessimistic: number;
  share?: number;
}

export interface MediaForecastResult {
  key: MediaKey;
  label: string;
  color: string;
  model: ForecastModelType;
  historicalData: { year: number; value: number }[];
  forecastData: ForecastPoint[];
  rSquared?: number;
  projectedCAGR: number; // from 2025 to 2030
}
