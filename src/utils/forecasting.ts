import { MediaKey, ForecastModelType, MediaForecastResult, ForecastPoint, CurrencyMode } from '../types/media';
import { RAW_MEDIA_DATA, MEDIA_METAS, ALL_MEDIA_KEYS, convertValue } from '../data/mediaData';

export function runForecastForMedia(
  mediaKey: MediaKey,
  model: ForecastModelType,
  mode: CurrencyMode,
  horizonYears: number = 5, // 2026 to 2030
  optimismFactor: number = 0.12 // 12% spread for scenarios
): MediaForecastResult {
  const meta = MEDIA_METAS[mediaKey];

  // Extract valid historical series
  const history: { year: number; value: number }[] = [];
  for (const r of RAW_MEDIA_DATA) {
    const rawVal = r[mediaKey];
    if (rawVal !== null && rawVal !== undefined) {
      const converted = convertValue(rawVal, r.year, mode, r.trm);
      if (converted !== null) {
        history.push({ year: r.year, value: converted });
      }
    }
  }

  if (history.length < 3) {
    throw new Error(`Datos históricos insuficientes para ${meta.label}`);
  }

  const lastHistorical = history[history.length - 1]; // 2025
  const baseYear = lastHistorical.year; // 2025
  const lastVal = lastHistorical.value;

  // Compute baseline forecast values based on chosen model
  const projectedValues: { year: number; val: number }[] = [];

  if (model === 'linear_recent') {
    // Linear regression on the last 5-7 data points (2018-2025)
    const windowSize = Math.min(history.length, 7);
    const windowSlice = history.slice(-windowSize);

    const n = windowSlice.length;
    const xs = windowSlice.map((p, idx) => idx);
    const ys = windowSlice.map((p) => p.value);

    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += Math.pow(xs[i] - meanX, 2);
    }
    const slope = den !== 0 ? num / den : 0;
    const intercept = meanY - slope * meanX;

    for (let h = 1; h <= horizonYears; h++) {
      const targetYear = baseYear + h;
      const xFuture = n - 1 + h;
      let val = intercept + slope * xFuture;
      // Floor at zero for print/declining media
      if (val < 0) val = Math.max(0, lastVal * Math.pow(0.85, h));
      projectedValues.push({ year: targetYear, val });
    }
  } else if (model === 'exponential_smoothing') {
    // Holt's linear exponential smoothing
    const alpha = 0.55;
    const beta = 0.25;

    let level = history[0].value;
    let trend = history.length > 1 ? history[1].value - history[0].value : 0;

    for (let i = 1; i < history.length; i++) {
      const prevLevel = level;
      const prevTrend = trend;
      const y = history[i].value;

      level = alpha * y + (1 - alpha) * (prevLevel + prevTrend);
      trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
    }

    for (let h = 1; h <= horizonYears; h++) {
      const targetYear = baseYear + h;
      let val = level + h * trend;
      if (val < 0) val = Math.max(0, lastVal * Math.pow(0.85, h));
      projectedValues.push({ year: targetYear, val });
    }
  } else if (model === 'logistic_damped') {
    // S-curve / Damped trend for modern market dynamics
    // Digital experiences high growth but dampens as internet penetration nears 85-90%
    // Print media stabilizes near a niche floor
    // Radio & OOH maintain steady moderate expansion
    let growthRate = 0;
    const recent5 = history.slice(-5);
    if (recent5.length >= 2) {
      const start = recent5[0].value;
      const end = recent5[recent5.length - 1].value;
      growthRate = Math.pow(end / Math.max(start, 1), 1 / (recent5.length - 1)) - 1;
    }

    let currentVal = lastVal;
    for (let h = 1; h <= horizonYears; h++) {
      const targetYear = baseYear + h;
      // Damping factor: decay growth rate each year toward a long-term steady state
      const damping = Math.pow(0.82, h - 1);
      const effectiveRate = growthRate * damping;

      if (mediaKey === 'revistas' || mediaKey === 'prensa') {
        // Niche floor: prints don't drop to zero overnight; they reach minimum circulation baseline
        const minFloor = lastVal * 0.45;
        currentVal = Math.max(minFloor, currentVal * (1 + effectiveRate));
      } else if (mediaKey === 'digital') {
        // Digital continues healthy growth (~8% to 5% damped)
        const moderatedRate = Math.max(0.045, effectiveRate * 0.9);
        currentVal = currentVal * (1 + moderatedRate);
      } else {
        currentVal = Math.max(0, currentVal * (1 + effectiveRate));
      }

      projectedValues.push({ year: targetYear, val: currentVal });
    }
  } else {
    // cagr_trend (compound annual growth rate of last 5 years)
    const recent5 = history.slice(-5);
    const startVal = recent5[0].value;
    const endVal = recent5[recent5.length - 1].value;
    const cagr = Math.pow(Math.max(endVal, 1) / Math.max(startVal, 1), 1 / 4) - 1;

    let cur = lastVal;
    for (let h = 1; h <= horizonYears; h++) {
      const targetYear = baseYear + h;
      cur = Math.max(0, cur * (1 + cagr));
      projectedValues.push({ year: targetYear, val: cur });
    }
  }

  // Calculate historical residual variance for confidence interval
  const recentValues = history.slice(-5).map((h) => h.value);
  const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const variance = recentValues.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / recentValues.length;
  const stdError = Math.sqrt(variance);

  // Build forecast data array including the 2025 link point
  const forecastPoints: ForecastPoint[] = [
    {
      year: baseYear,
      isForecast: false,
      value: Number(lastVal.toFixed(2)),
      lowerBound: Number(lastVal.toFixed(2)),
      upperBound: Number(lastVal.toFixed(2)),
      optimistic: Number(lastVal.toFixed(2)),
      pessimistic: Number(lastVal.toFixed(2)),
    },
  ];

  for (let h = 0; h < projectedValues.length; h++) {
    const item = projectedValues[h];
    const step = h + 1;
    // Uncertainty grows with sqrt of time
    const margin = stdError * 0.45 * Math.sqrt(step) + item.val * (optimismFactor * 0.5 * step);
    const opt = item.val * (1 + optimismFactor * Math.sqrt(step));
    const pess = Math.max(0, item.val * (1 - optimismFactor * Math.sqrt(step)));

    forecastPoints.push({
      year: item.year,
      isForecast: true,
      value: Number(item.val.toFixed(2)),
      lowerBound: Number(Math.max(0, item.val - margin).toFixed(2)),
      upperBound: Number((item.val + margin).toFixed(2)),
      optimistic: Number(opt.toFixed(2)),
      pessimistic: Number(pess.toFixed(2)),
    });
  }

  const finalForecastVal = forecastPoints[forecastPoints.length - 1].value;
  const projectedCAGR =
    lastVal > 0 && finalForecastVal > 0
      ? (Math.pow(finalForecastVal / lastVal, 1 / horizonYears) - 1) * 100
      : 0;

  return {
    key: mediaKey,
    label: meta.label,
    color: meta.color,
    model,
    historicalData: history,
    forecastData: forecastPoints,
    projectedCAGR: Number(projectedCAGR.toFixed(2)),
  };
}

export function getAllMediaForecasts(
  model: ForecastModelType,
  mode: CurrencyMode,
  horizonYears: number = 5,
  optimismFactor: number = 0.12
): Record<MediaKey, MediaForecastResult> {
  const map: Partial<Record<MediaKey, MediaForecastResult>> = {};
  for (const k of ALL_MEDIA_KEYS) {
    map[k] = runForecastForMedia(k, model, mode, horizonYears, optimismFactor);
  }
  return map as Record<MediaKey, MediaForecastResult>;
}

// Generate combined forecast points across all media
export function getIndustryAggregateForecast(
  allForecasts: Record<MediaKey, MediaForecastResult>
) {
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  return years.map((yr) => {
    let totalVal = 0;
    let totalLower = 0;
    let totalUpper = 0;
    let totalOpt = 0;
    let totalPess = 0;
    const mediaBreakdown: Record<string, number> = {};

    for (const key of ALL_MEDIA_KEYS) {
      const fItem = allForecasts[key]?.forecastData.find((p) => p.year === yr);
      if (fItem) {
        totalVal += fItem.value;
        totalLower += fItem.lowerBound;
        totalUpper += fItem.upperBound;
        totalOpt += fItem.optimistic;
        totalPess += fItem.pessimistic;
        mediaBreakdown[key] = fItem.value;
      }
    }

    return {
      year: yr,
      isForecast: yr > 2025,
      total: Number(totalVal.toFixed(2)),
      lowerBound: Number(totalLower.toFixed(2)),
      upperBound: Number(totalUpper.toFixed(2)),
      optimistic: Number(totalOpt.toFixed(2)),
      pessimistic: Number(totalPess.toFixed(2)),
      ...mediaBreakdown,
    };
  });
}
