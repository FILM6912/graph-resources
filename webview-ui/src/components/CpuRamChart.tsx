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
import { ChartDataPoint, Settings } from '../types';

interface CpuRamChartProps {
  data: ChartDataPoint[];
  settings: Settings;
}

export const CpuRamChart = ({ data, settings }: CpuRamChartProps) => {
  const processedData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      timeLabel: `${index}s`,
    }));
  }, [data]);

  return (
    <div className="chart-container" style={{ height: settings.chartHeightMode === 'auto' ? 'clamp(150px, 28vh, 280px)' : `${settings.chartHight}px` }}>
      <div className="chart-title">CPU & RAM</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={processedData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#58a6ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#58a6ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d2a8ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#d2a8ff" stopOpacity={0} />
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
            formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
          />
          {settings.showCpu && (
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#58a6ff"
              strokeWidth={1.5}
              fill="url(#cpuGrad)"
              dot={false}
              name="CPU"
              isAnimationActive={false}
            />
          )}
          {settings.showSystemVram && (
            <Area
              type="monotone"
              dataKey="ram"
              stroke="#d2a8ff"
              strokeWidth={1.5}
              fill="url(#ramGrad)"
              dot={false}
              name="RAM"
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};


