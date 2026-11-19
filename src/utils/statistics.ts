import { RawMediaRecord, MediaKey, DescriptiveStats, CurrencyMode } from '../types/media';
import { RAW_MEDIA_DATA, MEDIA_METAS, ALL_MEDIA_KEYS, convertValue } from '../data/mediaData';

export function calculateDescriptiveStats(mode: CurrencyMode): DescriptiveStats[] {
  const currentRec = RAW_MEDIA_DATA[RAW_MEDIA_DATA.length - 1]; // 2025
  const prevRec = RAW_MEDIA_DATA[RAW_MEDIA_DATA.length - 2]; // 2024
  const tenYearRec = RAW_MEDIA_DATA.find((d) => d.year === 2015);

  const results: DescriptiveStats[] = [];

  // Calculate for each media
  for (const key of ALL_MEDIA_KEYS) {
    const meta = MEDIA_METAS[key];
    const validPairs: { year: number; val: number }[] = [];

    for (const r of RAW_MEDIA_DATA) {
      const rawVal = r[key];
      if (rawVal !== null && rawVal !== undefined) {
        const converted = convertValue(rawVal, r.year, mode, r.trm);
        if (converted !== null) {
          validPairs.push({ year: r.year, val: converted });
        }
      }
    }

    if (validPairs.length === 0) continue;

    const values = validPairs.map((p) => p.val);
    const count = values.length;
    const totalSum = values.reduce((a, b) => a + b, 0);
    const mean = totalSum / count;

    // Median
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Min & Max with years
    let minPair = validPairs[0];
    let maxPair = validPairs[0];
    for (const p of validPairs) {
      if (p.val < minPair.val) minPair = p;
      if (p.val > maxPair.val) maxPair = p;
    }

    // Std Dev
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    // Current & previous
    const currentVal = convertValue(currentRec[key], currentRec.year, mode, currentRec.trm) || 0;
    const prevVal = convertValue(prevRec[key], prevRec.year, mode, prevRec.trm) || 0;
    const yoyGrowth = prevVal > 0 ? ((currentVal - prevVal) / prevVal) * 100 : 0;

    // Current Share
    const currentTotal = convertValue(currentRec.totalInv, currentRec.year, mode, currentRec.trm) || 1;
    const shareCurrent = (currentVal / currentTotal) * 100;

    // Historical average share
    let sumShare = 0;
    let shareCount = 0;
    for (const r of RAW_MEDIA_DATA) {
      const mVal = r[key];
      if (mVal !== null && mVal !== undefined && r.totalInv > 0) {
        sumShare += (mVal / r.totalInv) * 100;
        shareCount++;
      }
    }
    const shareHistoricalAvg = shareCount > 0 ? sumShare / shareCount : 0;

    // 10 year CAGR (2015 to 2025)
    let cagr10Year = 0;
    if (tenYearRec && tenYearRec[key] !== null) {
      const tenVal = convertValue(tenYearRec[key], tenYearRec.year, mode, tenYearRec.trm);
      if (tenVal && tenVal > 0 && currentVal > 0) {
        cagr10Year = (Math.pow(currentVal / tenVal, 1 / 10) - 1) * 100;
      }
    }

    results.push({
      key,
      label: meta.label,
      color: meta.color,
      count,
      totalSum,
      mean,
      median,
      min: minPair.val,
      minYear: minPair.year,
      max: maxPair.val,
      maxYear: maxPair.year,
      stdDev,
      currentValue: currentVal,
      previousValue: prevVal,
      yoyGrowth,
      shareCurrent,
      shareHistoricalAvg,
      cagr10Year,
    });
  }

  // Also calculate total industry stats
  const totalPairs = RAW_MEDIA_DATA.map((r) => ({
    year: r.year,
    val: convertValue(r.totalInv, r.year, mode, r.trm)!,
  }));
  const totalVals = totalPairs.map((p) => p.val);
  const totalMean = totalVals.reduce((a, b) => a + b, 0) / totalVals.length;
  const sortedTotal = [...totalVals].sort((a, b) => a - b);
  const midTotal = Math.floor(sortedTotal.length / 2);
  const totalMedian =
    sortedTotal.length % 2 !== 0
      ? sortedTotal[midTotal]
      : (sortedTotal[midTotal - 1] + sortedTotal[midTotal]) / 2;

  let minTot = totalPairs[0];
  let maxTot = totalPairs[0];
  for (const p of totalPairs) {
    if (p.val < minTot.val) minTot = p;
    if (p.val > maxTot.val) maxTot = p;
  }
  const varianceTotal =
    totalVals.reduce((sum, v) => sum + Math.pow(v - totalMean, 2), 0) / totalVals.length;
  const curTot = totalVals[totalVals.length - 1];
  const prevTot = totalVals[totalVals.length - 2];
  const tenTot = convertValue(tenYearRec?.totalInv || null, 2015, mode, tenYearRec?.trm) || curTot;
  const cagrTot10 = (Math.pow(curTot / tenTot, 1 / 10) - 1) * 100;

  results.unshift({
    key: 'totalInv',
    label: 'Total Industria',
    color: '#0f172a',
    count: totalVals.length,
    totalSum: totalVals.reduce((a, b) => a + b, 0),
    mean: totalMean,
    median: totalMedian,
    min: minTot.val,
    minYear: minTot.year,
    max: maxTot.val,
    maxYear: maxTot.year,
    stdDev: Math.sqrt(varianceTotal),
    currentValue: curTot,
    previousValue: prevTot,
    yoyGrowth: ((curTot - prevTot) / prevTot) * 100,
    shareCurrent: 100,
    shareHistoricalAvg: 100,
    cagr10Year: cagrTot10,
  });

  return results;
}

export function calculateMarketShareByYear(mode: CurrencyMode) {
  return RAW_MEDIA_DATA.map((r) => {
    const total = convertValue(r.totalInv, r.year, mode, r.trm) || 1;
    const row: Record<string, number | string> = { year: r.year };

    for (const key of ALL_MEDIA_KEYS) {
      const val = convertValue(r[key], r.year, mode, r.trm);
      if (val !== null && val !== undefined) {
        row[key] = Number(((val / total) * 100).toFixed(2));
      } else {
        row[key] = 0;
      }
    }
    return row;
  });
}

export function calculateCAGR(startVal: number, endVal: number, years: number): number {
  if (startVal <= 0 || endVal <= 0 || years <= 0) return 0;
  return (Math.pow(endVal / startVal, 1 / years) - 1) * 100;
}

// Pearson correlation coefficient
export function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const denom = Math.sqrt(denX * denY);
  if (denom === 0) return 0;
  return Number((num / denom).toFixed(3));
}

export function calculateMacroCorrelations() {
  const years = RAW_MEDIA_DATA.map((d) => d.year);
  const internet = RAW_MEDIA_DATA.map((d) => d.internetPenetration);
  const trm = RAW_MEDIA_DATA.map((d) => d.trm);
  const ipc = RAW_MEDIA_DATA.map((d) => d.ipc);
  const totalInv = RAW_MEDIA_DATA.map((d) => d.totalInv);

  const results: {
    mediaKey: MediaKey | 'totalInv';
    label: string;
    corrInternet: number;
    corrTRM: number;
    corrIPC: number;
  }[] = [];

  for (const key of ALL_MEDIA_KEYS) {
    const paired: { val: number; net: number; trm: number; ipc: number }[] = [];
    for (let i = 0; i < RAW_MEDIA_DATA.length; i++) {
      const rec = RAW_MEDIA_DATA[i];
      if (rec[key] !== null) {
        paired.push({
          val: rec[key]!,
          net: rec.internetPenetration,
          trm: rec.trm,
          ipc: rec.ipc,
        });
      }
    }

    const vals = paired.map((p) => p.val);
    results.push({
      mediaKey: key,
      label: MEDIA_METAS[key].label,
      corrInternet: calculateCorrelation(vals, paired.map((p) => p.net)),
      corrTRM: calculateCorrelation(vals, paired.map((p) => p.trm)),
      corrIPC: calculateCorrelation(vals, paired.map((p) => p.ipc)),
    });
  }

  results.unshift({
    mediaKey: 'totalInv',
    label: 'Total Inversión',
    corrInternet: calculateCorrelation(totalInv, internet),
    corrTRM: calculateCorrelation(totalInv, trm),
    corrIPC: calculateCorrelation(totalInv, ipc),
  });

  return results;
}

// Calculate Herfindahl-Hirschman Index (HHI) for each year
// Measures market concentration: sum of squared market shares (0 to 10,000)
export function calculateHHI() {
  return RAW_MEDIA_DATA.map((r) => {
    let sumSquaredShares = 0;
    for (const key of ALL_MEDIA_KEYS) {
      const val = r[key];
      if (val !== null && r.totalInv > 0) {
        const share = (val / r.totalInv) * 100;
        sumSquaredShares += share * share;
      }
    }
    return {
      year: r.year,
      hhi: Math.round(sumSquaredShares),
      interpretation:
        sumSquaredShares > 2500
          ? 'Alta Concentración'
          : sumSquaredShares > 1500
          ? 'Moderada Concentración'
          : 'Competitivo / Diversificado',
    };
  });
}
