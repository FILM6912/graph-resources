import type { Settings } from './types';

/** Opaque, high-contrast Plotly hover box for dark/light UI. */
export function getChartHoverLabel(theme: Settings['theme']) {
  if (theme === 'light') {
    return {
      bgcolor: '#ffffff',
      bordercolor: '#d0d7de',
      font: { color: '#1c2128', size: 11 },
      namelength: -1,
    };
  }
  return {
    bgcolor: '#161b22',
    bordercolor: '#8b949e',
    font: { color: '#e6edf3', size: 11 },
    namelength: -1,
  };
}
