export interface GPUData {
  device: string;
  gpuUsage: string;
  memoryUsage: string;
  memoryTotal: string;
  temperature: string;
}

export interface CPUData {
  cpuName: string;
  cpuUsage: string;
  memoryUsage: string;
  memoryTotal: string;
  temperature: string;
}

export interface DriveData {
  drive_name: string;
  total_Size: string;
  use_Size: string;
}

export interface SystemData {
  gpu: GPUData[];
  cpu: CPUData;
  drive: DriveData[];
}

export interface ChartDataPoint {
  time: number;
  cpu: number;
  ram: number;
}

export interface GpuTotalDataPoint {
  time: number;
  gpu: number;
  vram: number;
  avgTemp: number;
}

export interface GpuIndividualDataPoint {
  time: number;
  gpuUsage: number;
  vram: number;
  temp: number;
}

export interface Settings {
  showTemp: boolean;
  showCpu: boolean;
  showSystemVram: boolean;
  showGpus: boolean;
  showGpuVram: boolean;
  showCpuRamGraph: boolean;
  showGpuVramGraph: boolean;
  showTotalGpu: boolean;
  gpuNValue: number;
  time: number;
  chartHight: number;
  chartHeightMode: 'auto' | 'custom';
  theme: 'dark' | 'light';
}

export const DEFAULT_SETTINGS: Settings = {
  showTemp: false,
  showCpu: true,
  showSystemVram: true,
  showGpus: true,
  showGpuVram: true,
  showCpuRamGraph: true,
  showGpuVramGraph: true,
  showTotalGpu: true,
  gpuNValue: 0,
  time: 30,
  chartHight: 200,
  chartHeightMode: 'custom',
  theme: 'dark',
};

export const SETTINGS_KEY = 'systemMonitorSettings';

export interface VSCodeMessage {
  command: string;
  data: SystemData;
}

