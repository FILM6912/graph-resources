import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { GpuTotalDataPoint, Settings } from '../types';

interface GpuTotalChartProps {
  data: GpuTotalDataPoint[];
  settings: Settings;
  gpuCount: number;
}

export const GpuTotalChart = ({ data, settings, gpuCount }: GpuTotalChartProps) => {
  const processedData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      timeLabel: `${index}s`,
    }));
  }, [data]);

  return (
    <div className="chart-container" style={{ height: settings.chartHeightMode === 'auto' ? 'clamp(150px, 28vh, 280px)' : `${settings.chartHight}px` }}>
      <div className="chart-title">GPU Total ({gpuCount} GPU)</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d29922" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#d29922" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vramGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3fb950" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3fb950" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f85149" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f85149" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
          <XAxis
            dataKey="timeLabel"
            tick={{ fill: '#484f58', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#484f58', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '6px',
              color: '#e6edf3',
              fontSize: '11px',
              padding: '6px 10px',
            }}
            labelStyle={{ color: '#8b949e', marginBottom: '2px' }}
            formatter={(value: number, name: string) => [
              name === 'Avg Temp' ? `${value.toFixed(0)}°C` : `${value.toFixed(1)}%`,
              name,
            ]}
          />
          {settings.showGpus && (
            <Area
              type="monotone"
              dataKey="gpu"
              stroke="#d29922"
              strokeWidth={1.5}
              fill="url(#gpuGrad)"
              dot={false}
              name="GPU Avg"
              isAnimationActive={false}
            />
          )}
          {settings.showGpuVram && (
            <Area
              type="monotone"
              dataKey="vram"
              stroke="#3fb950"
              strokeWidth={1.5}
              fill="url(#vramGrad)"
              dot={false}
              name="VRAM"
              isAnimationActive={false}
            />
          )}
          {settings.showTemp && (
            <Area
              type="monotone"
              dataKey="avgTemp"
              stroke="#f85149"
              strokeWidth={1.5}
              fill="url(#tempGrad)"
              dot={false}
              name="Avg Temp"
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


