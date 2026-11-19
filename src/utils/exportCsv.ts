import { RAW_MEDIA_DATA, convertValue } from '../data/mediaData';

export function exportDatasetToCSV() {
  const headers = [
    'AÑO',
    'TV REG Y LOCAL (M COP)',
    'REVISTAS (M COP)',
    'PUB EXTERIOR (M COP)',
    'PRENSA (M COP)',
    'RADIO (M COP)',
    'TV NACIONAL (M COP)',
    'DIGITAL (M COP)',
    'TOTAL INVERSION (M COP)',
    'TOTAL INVERSION REAL BASE 2025 (M COP)',
    'TOTAL INVERSION (M USD)',
    'IPC (%)',
    'TRM PROMEDIO (COP/USD)',
    'PENETRACION INTERNET (%)',
    'POBLACION DANE',
  ];

  const rows = RAW_MEDIA_DATA.map((r) => {
    const totalReal2025 = convertValue(r.totalInv, r.year, 'cop_real_2025');
    const totalUsd = convertValue(r.totalInv, r.year, 'usd', r.trm);

    return [
      r.year,
      r.tvRegional !== null ? r.tvRegional.toFixed(1) : '',
      r.revistas !== null ? r.revistas.toFixed(1) : '',
      r.pubExterior !== null ? r.pubExterior.toFixed(1) : '',
      r.prensa !== null ? r.prensa.toFixed(1) : '',
      r.radio !== null ? r.radio.toFixed(1) : '',
      r.tvNacional !== null ? r.tvNacional.toFixed(1) : '',
      r.digital !== null ? r.digital.toFixed(1) : '',
      r.totalInv.toFixed(1),
      totalReal2025 ? totalReal2025.toFixed(1) : '',
      totalUsd ? totalUsd.toFixed(2) : '',
      r.ipc.toFixed(1),
      r.trm.toFixed(2),
      r.internetPenetration.toFixed(1),
      r.poblacionDane,
    ];
  });

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'inversion_medios_colombia_1995_2025.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
