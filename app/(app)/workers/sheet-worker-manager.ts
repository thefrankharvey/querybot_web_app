// Global worker instance - lives outside React component lifecycle
let workerInstance: Worker | null = null;
let currentCallback: ((url: string) => void) | null = null;
let failureCallback: ((message: string) => void) | null = null;
let timeoutCallback: (() => void) | null = null;

function clearCallbacks() {
  currentCallback = null;
  failureCallback = null;
  timeoutCallback = null;
}

// Initialize worker on module load (browser only)
if (typeof window !== "undefined") {
  workerInstance = new Worker(
    new URL("./sheet-polling.worker.ts", import.meta.url),
    { type: "module" }
  );

  // Set up message handler
  workerInstance.onmessage = (event) => {
    const { downloadUrl, errorMessage, type } = event.data;

    if (type === "SPREADSHEET_READY" && downloadUrl) {
      const callback = currentCallback;
      clearCallbacks();
      callback?.(downloadUrl);
    } else if (type === "SPREADSHEET_FAILED") {
      const callback = failureCallback;
      clearCallbacks();
      callback?.(
        errorMessage || "The Excel export could not be created.",
      );
    } else if (type === "POLLING_TIMEOUT") {
      const callback = timeoutCallback;
      clearCallbacks();
      callback?.();
    }
  };

  workerInstance.onerror = (error) => {
    console.error("[Worker Manager] Worker error:", error);
    const callback = failureCallback;
    clearCallbacks();
    callback?.("The Excel export status could not be checked.");
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
  onFailure?: (message: string) => void,
  onTimeout?: () => void,
) {
  if (!workerInstance) {
    console.error("[Worker Manager] Worker not initialized");
    onFailure?.("The Excel export status could not be checked.");
    return;
  }

  currentCallback = onReady;
  failureCallback = onFailure || null;
  timeoutCallback = onTimeout || null;

  workerInstance.postMessage({
    type: "START_POLLING",
    taskId,
  });
}

export function stopSheetPolling() {
  workerInstance?.postMessage({ type: "STOP_POLLING" });
  clearCallbacks();
}
