import { Settings } from '../types';
import { StorageBar } from './StorageBar';
import { DriveData } from '../types';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (partial: Partial<Settings>) => void;
  drives: DriveData[];
}

export const SettingsPopup = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  drives,
}: SettingsPopupProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="popup">
        <div className="popup-header">
          <div className="popup-title">Settings</div>
          <button className="popup-close" onClick={onClose}>&#10005;</button>
        </div>

        <div className="popup-body">
          <div className="popup-section">
            <div className="popup-section-title">Storage</div>
            <StorageBar drives={drives} />
          </div>

          <div className="popup-section">
            <div className="popup-section-title">Graphs</div>
            <div className="popup-grid">
              <ToggleSwitch
                label="CPU & RAM"
                checked={settings.showCpuRamGraph}
                onChange={(v) => onUpdateSettings({ showCpuRamGraph: v })}
              />
              <ToggleSwitch
                label="Total GPU"
                checked={settings.showTotalGpu}
                onChange={(v) => onUpdateSettings({ showTotalGpu: v })}
              />
              <ToggleSwitch
                label="Individual GPU"
                checked={settings.showGpuVramGraph}
                onChange={(v) => onUpdateSettings({ showGpuVramGraph: v })}
              />
            </div>
          </div>

          <div className="popup-section">
            <div className="popup-section-title">Metrics</div>
            <div className="popup-grid">
              <ToggleSwitch
                label="CPU Usage"
                checked={settings.showCpu}
                onChange={(v) => onUpdateSettings({ showCpu: v })}
              />
              <ToggleSwitch
                label="RAM Usage"
                checked={settings.showSystemVram}
                onChange={(v) => onUpdateSettings({ showSystemVram: v })}
              />
              <ToggleSwitch
                label="GPU Usage"
                checked={settings.showGpus}
                onChange={(v) => onUpdateSettings({ showGpus: v })}
              />
              <ToggleSwitch
                label="VRAM Usage"
                checked={settings.showGpuVram}
                onChange={(v) => onUpdateSettings({ showGpuVram: v })}
              />
              <ToggleSwitch
                label="GPU Temp"
                checked={settings.showTemp}
                onChange={(v) => onUpdateSettings({ showTemp: v })}
              />
            </div>
          </div>

          <div className="popup-section">
            <div className="popup-section-title">Configuration</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="number-row">
                <label>GPU Count</label>
                <input
                  className="number-input"
                  type="number"
                  min="0"
                  max="10000"
                  value={settings.gpuNValue}
                  onChange={(e) => onUpdateSettings({ gpuNValue: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="number-row">
                <label>Chart Height</label>
                <select
                  className="number-input"
                  value={settings.chartHeightMode}
                  onChange={(e) => onUpdateSettings({ chartHeightMode: e.target.value as 'auto' | 'custom' })}
                >
                  <option value="auto">Auto</option>
                  <option value="custom">Custom</option>
                </select>
                {settings.chartHeightMode === 'custom' && (
                  <>
                    <input
                      className="number-input"
                      type="number"
                      min="1"
                      max="1000"
                      value={settings.chartHight}
                      onChange={(e) => onUpdateSettings({ chartHight: parseInt(e.target.value) || 200 })}
                    />
                    <span className="number-unit">px</span>
                  </>
                )}
              </div>
              <div className="number-row">
                <label>Time Range</label>
                <input
                  className="number-input"
                  type="number"
                  min="1"
                  max="90"
                  value={settings.time}
                  onChange={(e) => onUpdateSettings({ time: parseInt(e.target.value) || 30 })}
                />
                <span className="number-unit">s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const ToggleSwitch = ({ label, checked, onChange }: ToggleSwitchProps) => {
  return (
    <div className="toggle-row">
      <label>{label}</label>
      <button
        type="button"
        className={`toggle-switch ${checked ? 'active' : ''}`}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-slider" />
      </button>
    </div>
  );
};
