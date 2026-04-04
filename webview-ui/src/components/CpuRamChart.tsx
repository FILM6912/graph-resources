import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { getChartHoverLabel } from '../chartHoverLabel';
import { getChartAxisColors, getCpuRamSeries, getXAxisHoverSpike } from '../chartTheme';
import { ChartDataPoint, Settings } from '../types';

interface CpuRamChartProps {
  data: ChartDataPoint[];
  settings: Settings;
  cpuName: string;
  cpuPercent: number;
  ramPercent: number;
  ramUsed: string;
  ramTotal: string;
}

export const CpuRamChart = ({
  data,
  settings,
  cpuName,
  cpuPercent,
  ramPercent,
  ramUsed,
  ramTotal,
}: CpuRamChartProps) => {
  const x = useMemo(() => data.map((_, i) => i), [data]);
  const cpuY = useMemo(() => data.map(d => d.cpu), [data]);
  const ramY = useMemo(() => data.map(d => d.ram), [data]);
  const series = useMemo(() => getCpuRamSeries(settings.theme), [settings.theme]);
  const axis = useMemo(() => getChartAxisColors(settings.theme), [settings.theme]);
  const xSpike = useMemo(() => getXAxisHoverSpike(settings.theme), [settings.theme]);

  const traces = useMemo(() => {
    const t: Plotly.Data[] = [];
    if (settings.showCpu) {
      t.push({
        x: x,
        y: cpuY,
        name: 'CPU',
        type: 'scatter',
        mode: 'lines',
        line: { color: series.cpu.line, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: series.cpu.fill,
      });
    }
    if (settings.showSystemVram) {
      t.push({
        x: x,
        y: ramY,
        name: 'RAM',
        type: 'scatter',
        mode: 'lines',
        line: { color: series.ram.line, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: series.ram.fill,
      });
    }
    return t;
  }, [settings.showCpu, settings.showSystemVram, x, cpuY, ramY, series]);

  const layout = useMemo(
    () => ({
      margin: { t: 2, r: 2, b: 24, l: 28 },
      xaxis: {
        showgrid: false,
        zeroline: false,
        tickfont: { size: 9, color: axis.tick },
        showline: true,
        linecolor: axis.line,
        linewidth: 1,
        ...xSpike,
      },
      yaxis: {
        range: [0, 100] as [number, number],
        showgrid: true,
        gridcolor: axis.grid,
        griddash: 'dot' as const,
        zeroline: false,
        tickfont: { size: 9, color: axis.tick },
        showline: true,
        linecolor: axis.line,
        linewidth: 1,
      },
      showlegend: false,
      plot_bgcolor: 'transparent',
      paper_bgcolor: 'transparent',
      dragmode: false as const,
      hovermode: 'x unified' as const,
      hoverlabel: getChartHoverLabel(settings.theme),
      autosize: true,
    }),
    [axis, xSpike, settings.theme],
  );

  const pct = (n: number, digits: number) => `${n.toFixed(digits)}%`;

  return (
    <div className="chart-container" style={settings.chartHeightMode === 'auto' ? undefined : { height: `${settings.chartHight}px` }}>
      <div className="chart-head-stats">
        <div className="chart-stat-col">
          <span className="status-card-label">CPU</span>
          <span className="status-card-value cpu">{pct(cpuPercent, 0)}</span>
          <span className="status-card-sub" title={cpuName}>
            {cpuName}
          </span>
        </div>
        <div className="chart-stat-col">
          <span className="status-card-label">RAM</span>
          <span className="status-card-value ram">{pct(ramPercent, 1)}</span>
          <span className="status-card-sub">
            {ramUsed}/{ramTotal} GB
          </span>
        </div>
      </div>
      <div className="chart-plot-wrap">
        <Plot
          data={traces}
          layout={layout}
          config={{
            displayModeBar: false,
            responsive: true,
            scrollZoom: false,
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler
        />
      </div>
    </div>
  );
};
