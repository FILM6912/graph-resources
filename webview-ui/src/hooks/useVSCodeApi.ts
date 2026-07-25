import { useEffect, useCallback } from 'react';
import { VSCodeMessage, SystemData, ChartHistory } from '../types';

declare function acquireVsCodeApi(): {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

let vscodeApi: VSCodeAPI | null = null;

function getVSCodeApi(): VSCodeAPI | null {
  try {
    if (!vscodeApi) {
      vscodeApi = acquireVsCodeApi();
    }
    return vscodeApi;
  } catch {
    return null;
  }
}

export function useVSCodeApi(
  onData: (data: SystemData, history?: ChartHistory) => void
): void {
  const handleData = useCallback(onData, [onData]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const message = event.data as VSCodeMessage;
      if (message.command === 'update' || message.command === 'init') {
        handleData(message.data, message.history);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleData]);
}

export function postMessageToExtension(message: unknown): void {
  const api = getVSCodeApi();
  api?.postMessage(message);
}

export function isVSCodeContext(): boolean {
  return getVSCodeApi() !== null;
}
