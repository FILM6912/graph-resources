import type { Settings } from './types';

/** Vertical hover line for `hovermode: 'x unified'` — thin stroke; halo removed via CSS in index.css */
export function getXAxisHoverSpike(theme: Settings['theme']) {
  if (theme === 'light') {
    return {
      showspikes: true,
      spikemode: 'across' as const,
      spikesnap: 'data' as const,
      spikedash: 'solid' as const,
      spikecolor: 'rgba(87, 96, 106, 0.55)',
      spikethickness: 0.5,
    };
  }
  return {
    showspikes: true,
    spikemode: 'across' as const,
    spikesnap: 'data' as const,
    spikedash: 'solid' as const,
    spikecolor: 'rgba(230, 237, 243, 0.45)',
    spikethickness: 0.5,
  };
}

export function getChartAxisColors(theme: Settings['theme']) {
  if (theme === 'light') {
    return {
      tick: '#57606a',
      line: '#d0d7de',
      grid: '#eaeef2',
    };
  }
  return {
    tick: '#484f58',
    line: '#30363d',
    grid: '#21262d',
  };
}

export function getCpuRamSeries(theme: Settings['theme']) {
  if (theme === 'light') {
    return {
      cpu: { line: '#0969da', fill: 'rgba(9, 105, 218, 0.12)' },
      ram: { line: '#8250df', fill: 'rgba(130, 80, 223, 0.1)' },
    };
  }
  return {
    cpu: { line: '#58a6ff', fill: 'rgba(88, 166, 255, 0.08)' },
    ram: { line: '#d2a8ff', fill: 'rgba(210, 168, 255, 0.08)' },
  };
}

export function getGpuSeries(theme: Settings['theme']) {
  if (theme === 'light') {
    return {
      usage: { line: '#bf8700', fill: 'rgba(191, 135, 0, 0.12)' },
      vram: { line: '#1a7f37', fill: 'rgba(26, 127, 55, 0.1)' },
      temp: { line: '#cf222e', fill: 'rgba(207, 34, 46, 0.08)' },
    };
  }
  return {
    usage: { line: '#d29922', fill: 'rgba(210, 153, 34, 0.08)' },
    vram: { line: '#3fb950', fill: 'rgba(63, 185, 80, 0.08)' },
    temp: { line: '#f85149', fill: 'rgba(248, 81, 73, 0.08)' },
  };
}
