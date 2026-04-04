import { DriveData } from '../types';

interface StorageBarProps {
  drives: DriveData[];
}

function getBarClass(usagePercent: number): string {
  if (usagePercent < 50) return 'low';
  if (usagePercent < 75) return 'medium';
  if (usagePercent < 90) return 'high';
  return 'critical';
}

export const StorageBar = ({ drives }: StorageBarProps) => {
  if (drives.length === 0) {
    return (
      <div className="storage-section">
        <div className="storage-empty-hint">No drives detected</div>
      </div>
    );
  }

  return (
    <div className="storage-section">
      {drives.map((drive) => {
        const totalSize = parseFloat(drive.total_Size) || 1;
        const usedSize = parseFloat(drive.use_Size) || 0;
        const usagePercent = (usedSize / totalSize) * 100;
        const availGB = (totalSize - usedSize).toFixed(2);

        return (
          <div key={drive.drive_name} className="storage-item">
            <div className="storage-item-header">
              <span className="storage-drive-name">{drive.drive_name}</span>
              <span className="storage-drive-avail">{availGB} GB free</span>
            </div>
            <div className="storage-bar">
              <div
                className={`storage-fill ${getBarClass(usagePercent)}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              >
                <span className="storage-label">
                  {drive.use_Size}/{drive.total_Size} GB
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
