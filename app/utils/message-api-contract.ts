/**
 * Exact Flask messaging wire contracts.
 *
 * These types deliberately preserve the backend's snake_case field names. UI
 * code should consume the camelCase models from `message-types.ts` instead.
 */

export type MessageApiStatus = "success" | "error";
export type WireMessageSenderRole = "writer" | "agent";

export type WireMessageAttachmentStatus =
  | "pending_upload"
  | "ready"
  | "attached"
  | "expired"
  | "failed"
  | "deleted";

export type WireMessageAttachment = {
  attachment_id: string;
  thread_id: string;
  message_id: string | null;
  filename: string;
  content_type: string;
  size_bytes: number;
  status: WireMessageAttachmentStatus;
  created_at: string;
  deleted_at: string | null;
};

export type WireMessageThreadIdentity = {
  user_id: string;
  role: WireMessageSenderRole;
  profile_id?: string;
};

export type WireCreateMessageThreadRequest = {
  user_id: string;
  writer_project_id: string;
  agent_profile_id: string;
  subject: string;
  body: string;
};

export type WireCreateMessageRequest = WireMessageThreadIdentity & {
  body: string;
  attachment_ids?: string[];
};

export type WireAttachmentUploadIntentRequest = WireMessageThreadIdentity & {
  writer_project_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  consent_version: string;
};

export type WireWriterAttachmentRequest = WireMessageThreadIdentity & {
  writer_project_id: string;
};

export type WireAttachmentDeleteRequest = WireWriterAttachmentRequest & {
  reason: string;
};

export type WireAttachmentUploadIntentResponse = {
  status: "success";
  attachment: WireMessageAttachment;
  upload: {
    bucket: string;
    object_path: string;
    resumable_endpoint: string;
    token: string;
    expires_at: string;
    chunk_size_bytes: number;
  };
};

export type WireAttachmentMutationResponse = {
  status: "success";
  attachment: WireMessageAttachment;
};

export type WireAttachmentDownloadResponse = {
  status: "success";
  download: {
    url: string;
    expires_at: string;
    filename: string;
  };
};

export type WireReadStateRequest = WireMessageThreadIdentity & {
  through_message_id: string;
};

export type WireQueryStatusTransitionRequest = WireMessageThreadIdentity & {
  to_status: string;
  expected_version: number;
  idempotency_key: string;
  note?: string | null;
  reason_code?: string | null;
  due_at?: string | null;
  occurred_at?: string | null;
  source_message_id?: string | null;
  metadata?: Record<string, unknown>;
};

export type WireQueryProgress = {
  current_code: string;
  changed_at: string;
  version: number;
  is_terminal: boolean;
  sent_at: string;
  viewed_at: string | null;
  days_since_sent: number;
  days_in_current_status: number;
  next_action: {
    owner: string;
    due_at: string | null;
    overdue: boolean;
  } | null;
  allowed_transitions: string[];
  as_of: string;
};

export type WireQueryStatusEvent = {
  event_id: string;
  thread_id: string;
  status_version: number;
  from_status: string | null;
  to_status: string;
  occurred_at: string;
  recorded_at: string;
  actor_user_id: string | null;
  actor_role: string;
  source: string;
  source_message_id: string | null;
  note: string | null;
  reason_code: string | null;
  due_at: string | null;
  idempotency_key: string | null;
  metadata: Record<string, unknown>;
};

export type WireMessageThread = {
  thread_id: string;
  subject: string;
  writer_project_id: string;
  project_name: string;
  agent_profile_id: string;
  agent_name?: string | null;
  writer_name?: string | null;
  unread_count?: number | null;
  last_message_id?: string | null;
  last_message_sender_role?: string | null;
  last_message_at?: string | null;
  last_message_preview?: string | null;
  last_activity_at?: string | null;
  first_opened_at?: string | null;
  last_read_at?: string | null;
  last_read_message_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  query_progress?: WireQueryProgress | null;
};

export type WireMessage = {
  id?: string | null;
  message_id?: string | null;
  thread_id: string;
  sender_user_id: string;
  sender_role: string;
  body: string;
  created_at: string;
  attachments?: WireMessageAttachment[];
};

export type WireMessageThreadsResponse =
  | {
      status: "success";
      threads: WireMessageThread[];
    }
  | WireMessageErrorResponse;

export type WireThreadDetailResponse =
  | {
      status: "success";
      thread: WireMessageThread;
      query_progress: WireQueryProgress;
    }
  | WireMessageErrorResponse;

export type WireThreadMessagesResponse =
  | {
      status: "success";
      thread_id: string;
      messages: WireMessage[];
      next_before: string | null;
      query_progress: WireQueryProgress;
    }
  | WireMessageErrorResponse;

export type WireMessageMutationResponse =
  | {
      status: "success";
      message: WireMessage;
      event: WireQueryStatusEvent | null;
      query_progress: WireQueryProgress;
    }
  | WireMessageErrorResponse;

export type WireCreateThreadResponse =
  | {
      status: "success";
      thread_id: string;
      message: WireMessage;
      event: WireQueryStatusEvent;
      query_progress: WireQueryProgress;
    }
  | (WireMessageErrorResponse & { thread_id?: string | null });

export type WireMessageReadState = {
  thread_id: string;
  user_id: string;
  participant_role: string;
  first_opened_at: string | null;
  last_read_at: string | null;
  last_read_message_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type WireReadStateResponse =
  | {
      status: "success";
      read_state: WireMessageReadState;
      event: WireQueryStatusEvent | null;
      query_progress: WireQueryProgress;
    }
  | WireMessageErrorResponse;

export type WireQueryStatusTransitionResponse =
  | {
      status: "success";
      event: WireQueryStatusEvent;
      query_progress: WireQueryProgress;
    }
  | WireMessageErrorResponse;

export type WireQueryTimelineResponse =
  | {
      status: "success";
      thread_id: string;
      query_progress: WireQueryProgress;
      events: WireQueryStatusEvent[];
    }
  | WireMessageErrorResponse;

export type WireAgentActivityWindow = "30" | "90" | "180" | "all";

export type WireAgentActivityViewerEvent = {
  status_version: number;
  from_status: string | null;
  to_status: string;
  occurred_at: string;
  recorded_at: string;
  actor_role: string;
  source: string;
  due_at: string | null;
};

export type WireAgentActivityBenchmark = {
  sample_size: number;
  median: number | null;
  p25: number | null;
  p75: number | null;
};

export type WireQueryStatusCounts = {
  query_sent: number;
  query_viewed: number;
  manuscript_requested: number;
  manuscript_under_review: number;
  rejected: number;
  closed_no_response: number;
  offer_of_representation: number;
};

export type WireAgentActivityLaneEvent = {
  status: string;
  occurred_on: string;
  elapsed_days: number | null;
};

export type WireAgentActivityLane = {
  lane_id: string;
  sent_on: string;
  current_status: string;
  is_terminal: boolean;
  last_status_on: string;
  events: WireAgentActivityLaneEvent[];
};

export type WireAgentActivityResponse =
  | {
      status: "success";
      thread_id: string;
      as_of: string;
      scope: {
        source: string;
        agent_profile_id: string;
        window: WireAgentActivityWindow;
        window_days: number | null;
        from: string | null;
        to: string;
      };
      privacy: {
        minimum_sample_size: number;
        cohort_size: number | null;
        details_available: boolean;
        suppression_reason: "minimum_sample_size" | null;
      };
      viewer_query: {
        query_progress: WireQueryProgress;
        events: WireAgentActivityViewerEvent[];
      };
      summary: {
        total_queries: number;
        active_queries: number;
        terminal_queries: number;
        status_counts: WireQueryStatusCounts;
        prior_sent_still_active: number;
        durations: {
          time_to_first_view_days: WireAgentActivityBenchmark | null;
          time_to_terminal_days: WireAgentActivityBenchmark | null;
        };
      } | null;
      lanes: WireAgentActivityLane[];
    }
  | WireMessageErrorResponse;

export type WireMessageErrorResponse = {
  status: "error";
  message: string;
  code?: string;
  thread_id?: string;
};
