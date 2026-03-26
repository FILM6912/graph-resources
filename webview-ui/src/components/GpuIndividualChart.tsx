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
import { GpuIndividualDataPoint, Settings, GPUData } from '../types';

interface GpuIndividualChartProps {
  gpuIndex: number;
  gpuData: GPUData;
  data: GpuIndividualDataPoint[];
  settings: Settings;
}

const GPU_COLORS = {
  usage: '#d29922',
  vram: '#3fb950',
  temp: '#f85149',
};

export const GpuIndividualChart = ({
  gpuIndex,
  gpuData,
  data,
  settings,
}: GpuIndividualChartProps) => {
  const processedData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      timeLabel: `${index}s`,
    }));
  }, [data]);

  return (
    <div className="chart-container" style={{ height: settings.chartHeightMode === 'auto' ? 'clamp(150px, 28vh, 280px)' : `${settings.chartHight}px` }}>
      <div className="chart-title">
        GPU {gpuIndex}: {gpuData.device}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`igpuGrad${gpuIndex}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GPU_COLORS.usage} stopOpacity={0.3} />
              <stop offset="100%" stopColor={GPU_COLORS.usage} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`ivramGrad${gpuIndex}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GPU_COLORS.vram} stopOpacity={0.3} />
              <stop offset="100%" stopColor={GPU_COLORS.vram} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`itempGrad${gpuIndex}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GPU_COLORS.temp} stopOpacity={0.3} />
              <stop offset="100%" stopColor={GPU_COLORS.temp} stopOpacity={0} />
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
              name === 'Temp' ? `${value.toFixed(0)}°C` : `${value.toFixed(1)}%`,
              name,
            ]}
          />
          {settings.showGpus && (
            <Area
              type="monotone"
              dataKey="gpuUsage"
              stroke={GPU_COLORS.usage}
              strokeWidth={1.5}
              fill={`url(#igpuGrad${gpuIndex})`}
              dot={false}
              name="Usage"
              isAnimationActive={false}
            />
          )}
          {settings.showGpuVram && (
            <Area
              type="monotone"
              dataKey="vram"
              stroke={GPU_COLORS.vram}
              strokeWidth={1.5}
              fill={`url(#ivramGrad${gpuIndex})`}
              dot={false}
              name="VRAM"
              isAnimationActive={false}
            />
          )}
          {settings.showTemp && (
            <Area
              type="monotone"
              dataKey="temp"
              stroke={GPU_COLORS.temp}
              strokeWidth={1.5}
              fill={`url(#itempGrad${gpuIndex})`}
              dot={false}
              name="Temp"
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


