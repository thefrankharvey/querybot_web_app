import {
  type AgentExportApiResponse,
  getAgentExportDownloadUrl,
  getAgentExportErrorMessage,
} from "./agent-export-contract";

interface WorkerMessage {
  type: "START_POLLING" | "STOP_POLLING";
  taskId?: string;
}

let isPolling = false;
let currentTaskId: string | null = null;
let pollCount = 0;
let pollingGeneration = 0;
const MAX_POLLS = 20; // Poll up to 20 times
const POLL_INTERVAL = 4000; // 4 seconds between polls

async function checkSheetStatus(
  taskId: string,
): Promise<AgentExportApiResponse | null> {
  try {
    const response = await fetch(`/api/sheet-status/${taskId}`);

    if (!response.ok) {
      console.error("Sheet status check failed:", response.status);
      return null;
    }

    return (await response.json()) as AgentExportApiResponse;
  } catch (error) {
    console.error("Error checking sheet status:", error);
    return null;
  }
}

function resetPollingState() {
  isPolling = false;
  currentTaskId = null;
  pollCount = 0;
}

async function pollSheetStatus(taskId: string, generation: number) {
  if (
    !isPolling ||
    currentTaskId !== taskId ||
    pollingGeneration !== generation
  ) {
    return;
  }

  pollCount++;

  const result = await checkSheetStatus(taskId);

  if (
    !isPolling ||
    currentTaskId !== taskId ||
    pollingGeneration !== generation
  ) {
    return;
  }

  if (result?.status === "failed") {
    self.postMessage({
      type: "SPREADSHEET_FAILED",
      errorMessage:
        getAgentExportErrorMessage(result) ??
        "The Excel export could not be created.",
      taskId,
    });
    resetPollingState();
    return;
  }

  if (result?.status === "ready") {
    const downloadUrl = getAgentExportDownloadUrl(result);

    if (downloadUrl) {
      self.postMessage({
        type: "SPREADSHEET_READY",
        downloadUrl,
        taskId,
      });
    } else {
      self.postMessage({
        type: "SPREADSHEET_FAILED",
        errorMessage: "The Excel export finished without a download URL.",
        taskId,
      });
    }

    resetPollingState();
    return;
  }

  if (pollCount >= MAX_POLLS) {
    self.postMessage({
      type: "POLLING_TIMEOUT",
      taskId,
    });
    resetPollingState();
    return;
  }

  setTimeout(
    () => void pollSheetStatus(taskId, generation),
    POLL_INTERVAL,
  );
}

self.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
  const { type, taskId } = event.data;

  if (type === "START_POLLING" && taskId) {
    pollingGeneration++;
    isPolling = true;
    currentTaskId = taskId;
    pollCount = 0;

    void pollSheetStatus(taskId, pollingGeneration);
  } else if (type === "STOP_POLLING") {
    pollingGeneration++;
    resetPollingState();
  }
});

export {};
