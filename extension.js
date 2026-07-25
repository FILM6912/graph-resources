const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function activate(context) {
    const provider = new GPUUsageViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(GPUUsageViewProvider.viewType, provider)
    );

    setInterval(() => {
        provider.update();
    }, 1000);
}

class GPUUsageViewProvider {
    static viewType = 'gpuUsageGraph';
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this.currentData = {
            gpu: [
                {
                    device: 'N/A',
                    gpuUsage: '0',
                    memoryUsage: '0',
                    memoryTotal: '0',
                    temperature: '0'
                }
            ],
            cpu: {
                cpuName: 'N/A',
                cpuUsage: '0',
                memoryUsage: '0',
                memoryTotal: '0',
                temperature: '0',
            },
            drive: [{
                drive_name: "N/A",
                total_Size: "0",
                use_Size: "0"

            }
            ]
        };
        // Persistent history ที่อยู่รอดแม้ปิด-เปิด panel
        this.maxHistoryLen = 60;
        this.cpuRamHistory = [];
        this.gpuTotalHistory = [];
        this.gpuIndividualHistory = new Map();
        this.timeCounter = 0;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // ส่ง history ที่สะสมไว้ให้ webview ทันทีเมื่อเปิด panel
        if (this.cpuRamHistory.length > 0) {
            const gpuIndividualObj = {};
            for (const [key, val] of this.gpuIndividualHistory) {
                gpuIndividualObj[key] = val;
            }
            this._view.webview.postMessage({
                command: 'init',
                data: this.currentData,
                history: {
                    cpuRam: this.cpuRamHistory,
                    gpuTotal: this.gpuTotalHistory,
                    gpuIndividual: gpuIndividualObj
                }
            });
        }
    }

    update() {
        if (this._view) {
            const usage = this._getGPUUsage();
            this._accumulateHistory(usage);
            const gpuIndividualObj = {};
            for (const [key, val] of this.gpuIndividualHistory) {
                gpuIndividualObj[key] = val;
            }
            this._view.webview.postMessage({
                command: 'update',
                data: usage,
                history: {
                    cpuRam: this.cpuRamHistory,
                    gpuTotal: this.gpuTotalHistory,
                    gpuIndividual: gpuIndividualObj
                }
            });
        }
    }

    _accumulateHistory(data) {
        const cpu = parseFloat(data.cpu.cpuUsage) || 0;
        const ramTotal = parseFloat(data.cpu.memoryTotal) || 1;
        const ramUsed = parseFloat(data.cpu.memoryUsage) || 0;
        const ramPercent = (ramUsed / ramTotal) * 100;

        this.timeCounter += 1;
        const timeLabel = this.timeCounter;

        // CPU / RAM
        this.cpuRamHistory.push({ time: timeLabel, cpu, ram: ramPercent });
        this.cpuRamHistory = this.cpuRamHistory.slice(-this.maxHistoryLen);

        // GPU totals
        let totalGpuUsage = 0, totalVramUsed = 0, totalVramTotal = 0, totalTemp = 0;
        for (const gpu of data.gpu) {
            totalGpuUsage += parseFloat(gpu.gpuUsage) || 0;
            totalVramUsed += parseFloat(gpu.memoryUsage) || 0;
            totalVramTotal += parseFloat(gpu.memoryTotal) || 1;
            totalTemp += parseFloat(gpu.temperature) || 0;
        }
        const avgGpu = data.gpu.length > 0 ? totalGpuUsage / data.gpu.length : 0;
        const avgTemp = data.gpu.length > 0 ? totalTemp / data.gpu.length : 0;
        const safeTotal = totalVramTotal > 0 ? totalVramTotal : 1;
        const vramPct = totalVramTotal > 0 ? (totalVramUsed / safeTotal) * 100 : 0;

        this.gpuTotalHistory.push({
            time: timeLabel,
            gpu: parseFloat(avgGpu.toFixed(2)),
            vram: parseFloat(vramPct.toFixed(2)),
            avgTemp: parseFloat(avgTemp.toFixed(2)),
        });
        this.gpuTotalHistory = this.gpuTotalHistory.slice(-this.maxHistoryLen);

        // GPU individual
        for (let i = 0; i < data.gpu.length; i++) {
            const g = data.gpu[i];
            const gu = parseFloat(g.gpuUsage) || 0;
            const mt = parseFloat(g.memoryTotal) || 1;
            const mu = parseFloat(g.memoryUsage) || 0;
            const vp = (mu / mt) * 100;
            const tp = parseFloat(g.temperature) || 0;

            const pt = { time: timeLabel, gpuUsage: gu, vram: parseFloat(vp.toFixed(2)), temp: tp };
            const existing = this.gpuIndividualHistory.get(i) || [];
            existing.push(pt);
            this.gpuIndividualHistory.set(i, existing.slice(-this.maxHistoryLen));
        }
    }

    _getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'dist', 'index.js'));
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'dist', 'index.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
    <title>System Monitor</title>
    <link rel="stylesheet" href="${cssUri}">
</head>
<body>
    <div id="root"></div>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
    _getGPUUsage() {
        const platform = process.platform;
        let gpuCommand, cpuCommand;
        gpuCommand = 'nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits';
        
        if (platform === 'win32') {
            gpuCommand = `powershell -NoProfile -Command "& { $result = & nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>&1; if ($LASTEXITCODE -eq 0 -and $result) { $result } else { $gpus = Get-CimInstance Win32_VideoController | Where-Object { $_.Name -and $_.AdapterRAM -gt 0 }; foreach ($g in $gpus) { $memTotalGb = [math]::Round(([double]$g.AdapterRAM / 1GB), 2); if ($memTotalGb -lt 0) { $memTotalGb = 0 }; Write-Output \\"gpu,$($g.Name),0,0,$memTotalGb,0\\" } } }"`;
            cpuCommand = `powershell -Command "$cpu=Get-CimInstance Win32_Processor; $os=Get-CimInstance Win32_OperatingSystem; $drives=Get-CimInstance Win32_LogicalDisk; $usedMem=[int]$os.TotalVisibleMemorySize - [int]$os.FreePhysicalMemory; try { $temp = Get-CimInstance -Namespace 'root/wmi' -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction Stop | Select-Object -First 1 -ExpandProperty CurrentTemperature; $tempC = [math]::Round(($temp - 2732) / 10, 0) } catch { $tempC = 0 }; Write-Output \\"cpu,$($cpu.Name),$($cpu.LoadPercentage),$tempC\\"; Write-Output \\"ram,$usedMem,$($os.TotalVisibleMemorySize)\\"; $drives | ForEach-Object { if ($_.Size -gt 0) { Write-Output \\"drive,$($_.DeviceID),$($_.FreeSpace),$($_.Size)\\" } }"`;

        } else if (platform === 'linux') {
            gpuCommand = `bash -lc '
if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits
elif command -v lspci >/dev/null 2>&1; then
  lspci | awk -F\": \" "/VGA compatible controller|3D controller|Display controller/ {printf \\"gpu,%s,0,0,0,0\\\\n\\", $2}"
else
  echo "gpu,N/A,0,0,0,0"
fi
'`;
            cpuCommand = `
echo -n "cpu,"; lscpu | awk -F: '/Model name/ {gsub(/^ +| +$/, "", $2); printf "%s,", $2}'; 
top -bn1 | grep "Cpu(s)" | awk '{printf "%d,", int($2)}'; 
(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0) | awk '{printf "%d\\n", int($1/1000)}'
echo -n "ram,"; free -k | awk '/Mem:/ {used=$2-$7; printf "%d,%d\\n", used, $2}'; 
df -k --output=target,used,size | tail -n +2 | awk '{printf "drive,%s,%d,%d\\n", $1, $2*1024, $3*1024}'
`;
            // netCommand = "netstat -e"
        } else {
            console.error('Unsupported OS');
            return;
        }

        exec(gpuCommand, (error, stdout, stderr) => {
            if (error) {
                // console.error(`Error executing GPU command: ${stderr}`);
            } else {
                const lines = stdout.trim().split('\n');
                if (lines.length > 0) {
                    this.currentData.gpu = [];
                    for (let i = 0; i < lines.length; i++) {
                        const cleanedLine = lines[i].replace("\r", "");
                        if (!cleanedLine) {
                            continue;
                        }
                        let [device, usage, memoryUsed, memoryTotal, temperature] = cleanedLine.split(',').map(v => v.trim());
                        if (device === "gpu") {
                            [ , device, usage, memoryUsed, memoryTotal, temperature] = cleanedLine.split(',').map(v => v.trim());
                            this.currentData.gpu.push({
                                device: device || "N/A",
                                gpuUsage: `${parseFloat(usage || "0").toFixed(2)}`,
                                memoryUsage: `${parseFloat(memoryUsed || "0").toFixed(2)}`,
                                memoryTotal: `${parseFloat(memoryTotal || "0").toFixed(2)}`,
                                temperature: `${parseFloat(temperature || "0").toFixed(0)}`
                            });
                            continue;
                        }
                        this.currentData.gpu.push({
                            device: device || "N/A",
                            gpuUsage: `${parseFloat(usage || "0").toFixed(2)}`,
                            memoryUsage: `${(parseFloat(memoryUsed || "0") / 1024).toFixed(2)}`,
                            memoryTotal: `${(parseFloat(memoryTotal || "0") / 1024).toFixed(2)}`,
                            temperature: `${parseFloat(temperature || "0").toFixed(0)}`
                        });
                    }
                }
            }
            if (!this.currentData.gpu || this.currentData.gpu.length === 0) {
                this.currentData.gpu = [{
                    device: 'N/A',
                    gpuUsage: '0',
                    memoryUsage: '0',
                    memoryTotal: '0',
                    temperature: '0'
                }];
            }

        });

        exec(cpuCommand, (error, stdout, stderr) => {

            if (error) {
                // console.error(`Error executing CPU command: ${stderr}`);
            } else {
                const lines = stdout.trim().split('\n');
                console.log(stdout.trim())

                this.currentData.drive = []

                for (let i = 0; i < lines.length; i++) {
                    const [id, value1, value2, value3] = lines[i].replaceAll("\r", "").split(',').map(v => v.trim());
                    if (id === "cpu") {
                        this.currentData.cpu.cpuName = value1;
                        this.currentData.cpu.cpuUsage = value2;
                        if (value3) this.currentData.cpu.temperature = value3;
                    } else if (id === "ram") {
                        this.currentData.cpu.memoryUsage = `${(value1 / (1024 * 1024)).toFixed(2)}`;
                        this.currentData.cpu.memoryTotal = `${(value2 / (1024 * 1024)).toFixed(2)}`;
                    } else if (id === "drive") {
                        const totalBytes = parseFloat(value3) || 0;
                        const freeBytes = parseFloat(value2) || 0;
                        const usedBytes = totalBytes - freeBytes;
                        this.currentData.drive.push({
                            drive_name: value1,
                            total_Size: `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)}`,
                            use_Size: `${(usedBytes / (1024 * 1024 * 1024)).toFixed(2)}`,
                        });
                    }
                }
            }
        });


        // console.log(this.currentData)
        // this.currentData.gpu[0].device="test gpu"
        // this.currentData.gpu[0].memoryTotal="10"
        // this.currentData.gpu[0].memoryUsage="5"
        // this.currentData.gpu[0].gpuUsage="55"
        // this.currentData.drive = []
        // this.currentData.drive.push({
        //     drive_name: "ntest1",
        //     total_Size: `${100}`,
        //     use_Size: `${50}`

        // })

        // this.currentData.gpu[0].temperature="20"
        // this.currentData.gpu[1].temperature="10"
        // console.log(this.currentData.drive)

        return this.currentData;
    }

}

module.exports = {
    activate
};
