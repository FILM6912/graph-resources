import { useState, useCallback, useRef, useEffect } from 'react';
import { useVSCodeApi } from './hooks/useVSCodeApi';
import { useSettings } from './hooks/useSettings';
import { Header } from './components/Header';
import { CpuRamChart } from './components/CpuRamChart';
import { GpuTotalChart } from './components/GpuTotalChart';
import { GpuIndividualChart } from './components/GpuIndividualChart';
import { SettingsPopup } from './components/SettingsPopup';
import { SystemData, ChartDataPoint, GpuTotalDataPoint, GpuIndividualDataPoint, ChartHistory } from './types';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    const light = settings.theme === 'light';
    document.documentElement.classList.toggle('light', light);
    document.body.classList.toggle('light', light);
  }, [settings.theme]);

  const [systemData, setSystemData] = useState<SystemData>({
    gpu: [{ device: 'N/A', gpuUsage: '0', memoryUsage: '0', memoryTotal: '0', temperature: '0' }],
    cpu: { cpuName: 'N/A', cpuUsage: '0', memoryUsage: '0', memoryTotal: '0', temperature: '0' },
    drive: [{ drive_name: 'N/A', total_Size: '0', use_Size: '0' }],
  });

  const [lastValues, setLastValues] = useState({
    cpu: 0,
    ram: 0,
    gpu: 0,
    temp: 0,
    ramUsed: '0',
    ramTotal: '0',
    vramUsed: '0',
    vramTotal: '0',
  });

  const cpuRamDataRef = useRef<ChartDataPoint[]>([]);
  const gpuTotalDataRef = useRef<GpuTotalDataPoint[]>([]);
  const gpuIndividualDataRef = useRef<Map<number, GpuIndividualDataPoint[]>>(new Map());

  const handleData = useCallback((data: SystemData, history?: ChartHistory) => {
    setSystemData(data);

    // ใช้ history ที่สะสมจาก extension (server-side) แทนการสะสมเอง
    if (history) {
      cpuRamDataRef.current = history.cpuRam;
      gpuTotalDataRef.current = history.gpuTotal;
      const gpuIndMap = new Map<number, GpuIndividualDataPoint[]>();
      for (const key in history.gpuIndividual) {
        gpuIndMap.set(Number(key), history.gpuIndividual[key]);
      }
      gpuIndividualDataRef.current = gpuIndMap;
    }

    const cpu = parseFloat(data.cpu.cpuUsage) || 0;
    const ramTotal = parseFloat(data.cpu.memoryTotal) || 1;
    const ramUsed = parseFloat(data.cpu.memoryUsage) || 0;
    const ramPercent = (ramUsed / ramTotal) * 100;

    let totalGpuUsage = 0;
    let totalVramUsed = 0;
    let totalVramTotal = 0;
    let totalTemp = 0;

    for (const gpu of data.gpu) {
      totalGpuUsage += parseFloat(gpu.gpuUsage) || 0;
      totalVramUsed += parseFloat(gpu.memoryUsage) || 0;
      totalVramTotal += parseFloat(gpu.memoryTotal) || 1;
      totalTemp += parseFloat(gpu.temperature) || 0;
    }

    const avgGpu = data.gpu.length > 0 ? totalGpuUsage / data.gpu.length : 0;
    const avgTemp = data.gpu.length > 0 ? totalTemp / data.gpu.length : 0;

    setLastValues({
      cpu,
      ram: ramPercent,
      gpu: parseFloat(avgGpu.toFixed(0)),
      temp: parseFloat(avgTemp.toFixed(0)),
      ramUsed: data.cpu.memoryUsage,
      ramTotal: data.cpu.memoryTotal,
      vramUsed: totalVramUsed.toFixed(1),
      vramTotal: totalVramTotal.toFixed(0),
    });
  }, []);

  useVSCodeApi(handleData);

  const effectiveGpuN = Math.min(settings.gpuNValue, systemData.gpu.length);

  return (
    <>
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <div className={`charts-scroll${settings.chartHeightMode === 'auto' ? ' charts-auto' : ''}`}>
        {settings.showCpuRamGraph && (
          <CpuRamChart
            data={cpuRamDataRef.current}
            settings={settings}
            cpuName={systemData.cpu.cpuName}
            cpuPercent={lastValues.cpu}
            ramPercent={lastValues.ram}
            ramUsed={lastValues.ramUsed}
            ramTotal={lastValues.ramTotal}
            cpuTemp={systemData.cpu.temperature}
          />
        )}

        {settings.showTotalGpu && (
          <GpuTotalChart
            data={gpuTotalDataRef.current}
            settings={settings}
            gpuCount={systemData.gpu.length}
            gpuAvgPercent={lastValues.gpu}
            vramUsed={lastValues.vramUsed}
            vramTotal={lastValues.vramTotal}
            tempAvg={lastValues.temp}
          />
        )}

        {settings.showGpuVramGraph &&
          Array.from({ length: effectiveGpuN }, (_, i) => (
            <GpuIndividualChart
              key={`gpu-${i}`}
              gpuIndex={i}
              gpuData={systemData.gpu[i] || { device: 'N/A', gpuUsage: '0', memoryUsage: '0', memoryTotal: '0', temperature: '0' }}
              data={gpuIndividualDataRef.current.get(i) || []}
              settings={settings}
            />
          ))}
      </div>

      <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        drives={systemData.drive}
      />
    </>
  );
}
