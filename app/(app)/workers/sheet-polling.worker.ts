// Web Worker for polling sheet status
// This runs outside the React render cycle for more reliable polling

interface WorkerMessage {
  type: "START_POLLING" | "STOP_POLLING";
  taskId?: string;
}

interface StatusResponse {
  status: "creating" | "ready";
  spreadsheet_url?: string;
}

let isPolling = false;
let currentTaskId: string | null = null;
let pollCount = 0;
const MAX_POLLS = 20; // Poll up to 20 times
const POLL_INTERVAL = 4000; // 4 seconds between polls

async function checkSheetStatus(taskId: string): Promise<StatusResponse | null> {
  try {
    const response = await fetch(`/api/sheet-status/${taskId}`);
    
    if (!response.ok) {
      console.error("Sheet status check failed:", response.status);
      return null;
    }


    
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error checking sheet status:", error);
    return null;
  }
}

async function pollSheetStatus() {
  if (!isPolling || !currentTaskId) {
    return;
  }

  pollCount++;

  const result = await checkSheetStatus(currentTaskId);

  if (result && result.spreadsheet_url) {
      // Success! Send the URL back to main thread
      self.postMessage({
        type: "SPREADSHEET_READY",
        spreadsheetUrl: result.spreadsheet_url,
        taskId: currentTaskId,
      });
      
      // Stop polling
      isPolling = false;
      pollCount = 0;
      currentTaskId = null;
      return;
  }

  // Continue polling if we haven't exceeded max attempts
  if (pollCount < MAX_POLLS && isPolling) {
    setTimeout(() => pollSheetStatus(), POLL_INTERVAL);
  } else if (pollCount >= MAX_POLLS) {
    // Max attempts reached
    self.postMessage({
      type: "POLLING_TIMEOUT",
      taskId: currentTaskId,
    });
    
    isPolling = false;
    pollCount = 0;
    currentTaskId = null;
  }
}

// Listen for messages from main thread
self.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
  const { type, taskId } = event.data;

  if (type === "START_POLLING" && taskId) {
    isPolling = true;
    currentTaskId = taskId;
    pollCount = 0;
    
    // Start polling after 2 seconds
    setTimeout(() => pollSheetStatus(), 2000);
  } else if (type === "STOP_POLLING") {
    isPolling = false;
    currentTaskId = null;
    pollCount = 0;
  }
});

// Export empty object to make TypeScript happy with worker modules
export {};
