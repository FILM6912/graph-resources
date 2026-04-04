import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { getChartHoverLabel } from '../chartHoverLabel';
import { getChartAxisColors, getGpuSeries, getXAxisHoverSpike } from '../chartTheme';
import { GpuIndividualDataPoint, Settings, GPUData } from '../types';

interface GpuIndividualChartProps {
  gpuIndex: number;
  gpuData: GPUData;
  data: GpuIndividualDataPoint[];
  settings: Settings;
}

export const GpuIndividualChart = ({
  gpuIndex,
  gpuData,
  data,
  settings,
}: GpuIndividualChartProps) => {
  const usagePct = parseFloat(gpuData.gpuUsage) || 0;
  const tempC = parseFloat(gpuData.temperature) || 0;
  const pct = (n: number, digits: number) => `${n.toFixed(digits)}%`;

  const x = useMemo(() => data.map((_, i) => i), [data]);
  const usageY = useMemo(() => data.map(d => d.gpuUsage), [data]);
  const vramY = useMemo(() => data.map(d => d.vram), [data]);
  const tempY = useMemo(() => data.map(d => d.temp), [data]);
  const series = useMemo(() => getGpuSeries(settings.theme), [settings.theme]);
  const axis = useMemo(() => getChartAxisColors(settings.theme), [settings.theme]);
  const xSpike = useMemo(() => getXAxisHoverSpike(settings.theme), [settings.theme]);

  const traces = useMemo(() => {
    const t: Plotly.Data[] = [];
    if (settings.showGpus) {
      t.push({
        x: x,
        y: usageY,
        name: 'Usage',
        type: 'scatter',
        mode: 'lines',
        line: { color: series.usage.line, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: series.usage.fill,
      });
    }
    if (settings.showGpuVram) {
      t.push({
        x: x,
        y: vramY,
        name: 'VRAM',
        type: 'scatter',
        mode: 'lines',
        line: { color: series.vram.line, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: series.vram.fill,
      });
    }
    if (settings.showTemp) {
      t.push({
        x: x,
        y: tempY,
        name: 'Temp',
        type: 'scatter',
        mode: 'lines',
        line: { color: series.temp.line, width: 1.5, shape: 'spline' },
        fill: 'tozeroy',
        fillcolor: series.temp.fill,
      });
    }
    return t;
  }, [
    settings.showGpus,
    settings.showGpuVram,
    settings.showTemp,
    x,
    usageY,
    vramY,
    tempY,
    series,
  ]);

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

  return (
    <div className="chart-container" style={settings.chartHeightMode === 'auto' ? undefined : { height: `${settings.chartHight}px` }}>
      <div className="chart-individual-head">
        <div className="chart-stat-device" title={`GPU ${gpuIndex}: ${gpuData.device}`}>
          GPU {gpuIndex}: {gpuData.device}
        </div>
        <div className="chart-head-stats">
          <div className="chart-stat-col">
            <span className="status-card-label">Usage</span>
            <span className="status-card-value gpu">{pct(usagePct, 0)}</span>
          </div>
          <div className="chart-stat-col">
            <span className="status-card-label">VRAM</span>
            <span className="status-card-value vram-metric">
              {gpuData.memoryUsage}/{gpuData.memoryTotal} GB
            </span>
          </div>
          <div className="chart-stat-col">
            <span className="status-card-label">Temp</span>
            <span className="status-card-value temp">{tempC.toFixed(0)}°C</span>
          </div>
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
