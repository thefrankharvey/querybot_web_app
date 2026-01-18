// Global worker instance - lives outside React component lifecycle
let workerInstance: Worker | null = null;
let currentCallback: ((url: string) => void) | null = null;
let timeoutCallback: (() => void) | null = null;

// Initialize worker on module load (browser only)
if (typeof window !== "undefined") {
  workerInstance = new Worker(
    new URL("./sheet-polling.worker.ts", import.meta.url),
    { type: "module" }
  );

  // Set up message handler
  workerInstance.onmessage = (event) => {
    const { type, spreadsheetUrl } = event.data;
    
    if (type === "SPREADSHEET_READY" && spreadsheetUrl) {
      currentCallback?.(spreadsheetUrl);
    } else if (type === "POLLING_TIMEOUT") {
      timeoutCallback?.();
    }
  };

  workerInstance.onerror = (error) => {
    console.error("[Worker Manager] Worker error:", error);
  };

  // Clean up on page unload
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      workerInstance?.terminate();
    });
  }
}

// Public API - export these functions
export function startSheetPolling(
  taskId: string,
  onReady: (url: string) => void,
  onTimeout?: () => void
) {
  if (!workerInstance) {
    console.error("[Worker Manager] Worker not initialized");
    return;
  }

  currentCallback = onReady;
  timeoutCallback = onTimeout || null;

  workerInstance.postMessage({
    type: "START_POLLING",
    taskId,
  });
}

export function stopSheetPolling() {
  if (!workerInstance) return;
  
  workerInstance.postMessage({ type: "STOP_POLLING" });
  currentCallback = null;
  timeoutCallback = null;
}
