# Manuscript Attachments: Next.js Writer and Agent Experience Plan

## Document status

- Deliverable: Next.js backend-for-frontend adapters, shared TypeScript contracts, direct upload experience, writer/agent conversation rendering, consent copy, and frontend verification.
- Intended implementer: an AI coding agent working in this `querybot_web_app` repository.
- Canonical backend/source-of-truth plan: [`manuscript-attachments-backend-storage-plan.md`](./manuscript-attachments-backend-storage-plan.md).
- Contract version: `manuscript-attachments-v1`.
- The frontend may be built against fixtures while the backend is in progress, but it must not invent or silently diverge from the canonical contract.

## Objective

Let a writer attach one requested PDF or DOCX manuscript to a reply in an existing agent message thread, upload it directly to private Supabase Storage with visible progress, and send it as a normal conversation attachment. Let both the writer and participating literary agent download the file through authorized, short-lived links.

The UI must make sharing deliberate and understandable. It must not extract manuscript text, paste a manuscript into a message body, upload material with the first query, or expose a permanent storage URL.

## Repository context

Relevant existing code:

- `app/(writer-app)/messages/[projectId]/new-message-composer.tsx`
  - Contains a disabled manuscript upload button and code that posts the file to `/api/process-manuscript` and appends extracted text to the query body.
  - V1 must remove this dead upload implementation from the initial-query composer. Keep concise copy explaining that attachments become available in the conversation after a request.
- `app/api/process-manuscript/route.ts`
  - Extracts PDF text and returns placeholder text for Word documents.
  - Do not reuse this route for human-agent attachments. Leave it alone if it serves another workflow; remove it only after proving it has no callers and treating removal as a separate cleanup.
- `app/(writer-app)/messages/[projectId]/threads/[threadId]/thread-reply-form.tsx`
  - Owns writer message state and the rule preventing premature follow-up messages.
  - Add the writer attachment picker and upload state here or in components/hooks extracted from it.
- `app/(agent-app)/literary-agents/messages/[threadId]/thread-reply-form.tsx`
  - Renders the agent-side conversation.
  - Add attachment cards/download behavior; agents do not upload in v1.
- `app/utils/message-api-contract.ts`
  - Owns snake_case Flask wire types. Extend these first.
- `app/utils/message-types.ts`
  - Owns normalized camelCase UI types. Extend `WriterMessage` with `attachments`.
- `app/utils/message-thread-data.ts`
  - Authenticates Clerk users, resolves writer/agent identities, calls the Flask API, and normalizes wire data.
  - Add attachment proxy helpers here, reusing existing authorization/identity resolution rather than recreating it in components.
- `app/api/message-threads/[threadId]/messages/route.ts`
  - Extend writer reply input with `attachmentIds` and allow attachment-only messages.
- `app/api/agent-message-threads/[threadId]/messages/route.ts`
  - No agent attachment mutation is required, but returned messages include attachments.
- Writer and agent thread `page.tsx` files already fetch initial messages as Server Components and pass serializable data into client reply forms. Preserve this pattern.

The working tree may contain unrelated or concurrent lifecycle UI changes in these files. Inspect `git diff` before editing, preserve user changes, and avoid broad rewrites.

## Product decisions fixed for v1

Mirror the backend plan:

1. Only PDF and DOCX, maximum 25 MiB.
2. One attachment per message.
3. Upload appears only when the canonical query status is `manuscript_requested` or `manuscript_under_review`.
4. `canWriterReply` alone is not an upload permission signal because an ordinary agent reply may unlock text replies without requesting manuscript material.
5. A message may contain text, one ready attachment, or both.
6. Uploading/sending does not automatically mark the manuscript under review.
7. Agents see/download attachments but do not upload.
8. Writer explicitly confirms sharing with the named agent before creating the upload intent.
9. Downloads use authorized Next.js endpoints that redirect to short-lived provider URLs. Never render or persist the signed URL.
10. Deleted attachments remain visible as “File no longer available.”

## Non-goals

- First-query uploads.
- Multiple attachments, manuscript libraries, reuse across agents, previews, annotations, or inline PDF rendering.
- Local PDF/DOCX parsing or AI processing.
- Public URLs or direct unauthenticated Supabase reads.
- A new global state framework.
- Replacing the existing messaging route architecture with Server Actions as part of this feature.

## Dependency and independence contract

The frontend can be implemented concurrently with the backend after `manuscript-attachments-v1` is frozen. Use local fixture objects and mocked fetch/TUS responses until a backend environment is available.

Backend dependencies required only for integration:

- Upload-intent endpoint and signed TUS token.
- Finalize endpoint.
- Extended create-message endpoint.
- Message reads containing `attachments`.
- Participant-authorized download-url endpoint.
- Delete endpoint.
- Stable error codes.

Do not compensate for an unavailable backend by uploading with the browser's general Supabase session or by writing attachment metadata directly from Next.js. That would create a second authorization/data path and defeat deliverable separation.

## TypeScript contract

### Wire types

Add to `app/utils/message-api-contract.ts`:

```ts
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
```

Extend:

```ts
export type WireCreateMessageRequest = WireMessageThreadIdentity & {
  body: string;
  attachment_ids?: string[];
};

export type WireMessage = {
  // existing fields
  attachments?: WireMessageAttachment[];
};
```

Treat an omitted `attachments` field as `[]` during a short compatibility window, even though the deployed v1 backend should always emit it.

Add an optional `code?: string` to the wire/UI error response without breaking existing message-only errors.

### UI types

Add to `app/utils/message-types.ts`:

```ts
export type MessageAttachmentStatus = WireMessageAttachmentStatus;

export type MessageAttachment = {
  attachmentId: string;
  threadId: string;
  messageId: string | null;
  filename: string;
  contentType: string;
  sizeBytes: number;
  status: MessageAttachmentStatus;
  createdAt: string;
  deletedAt: string | null;
};

export type WriterMessage = {
  // existing fields
  attachments: MessageAttachment[];
};
```

Add normalized client response types for upload intent/finalize/delete if normalization occurs server-side. Browser-facing Next.js JSON should use camelCase consistently with existing UI models.

### Normalization

Add one exported/testable `normalizeMessageAttachment` helper in `message-thread-data.ts` or a small adjacent server-only module. It must:

- Trim identifiers and filename.
- Preserve only known status strings; map unknown status to a safe unavailable state or an explicit `unknown` UI status.
- Validate finite nonnegative size; use zero only as a defensive fallback.
- Never pass `object_path`, bucket, upload token, or signed URL into `WriterMessage`.
- Normalize legacy missing arrays to `[]`.

Update `normalizeMessage` so every writer and agent message has a normalized attachment array.

## Next.js backend-for-frontend routes

Use App Router Route Handlers because they adapt the authenticated browser to an external Flask API and because downloads need a browser GET/redirect. Use the default Node.js runtime; do not add Edge runtime.

### Writer routes

Create:

```text
app/api/message-threads/[threadId]/attachments/upload-intents/route.ts
app/api/message-threads/[threadId]/attachments/[attachmentId]/finalize/route.ts
app/api/message-threads/[threadId]/attachments/[attachmentId]/download/route.ts
app/api/message-threads/[threadId]/attachments/[attachmentId]/route.ts
```

Browser contracts:

#### Create intent

```http
POST /api/message-threads/{threadId}/attachments/upload-intents
Content-Type: application/json

{
  "projectId": "route-project-id",
  "filename": "My Novel.docx",
  "contentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "sizeBytes": 482913,
  "consentVersion": "manuscript-share-v1"
}
```

The Route Handler:

- Parses and validates the browser payload defensively.
- Calls a new server helper in `message-thread-data.ts` that resolves the Clerk writer, canonical project/thread, and backend user ID exactly like existing writer message functions.
- Forwards the canonical snake_case request to Flask with the messaging secret.
- Returns normalized camelCase JSON with `Cache-Control: no-store`.
- Never receives file bytes.

#### Finalize

```http
POST /api/message-threads/{threadId}/attachments/{attachmentId}/finalize
Content-Type: application/json

{ "projectId": "route-project-id" }
```

#### Delete

```http
DELETE /api/message-threads/{threadId}/attachments/{attachmentId}
Content-Type: application/json

{ "projectId": "route-project-id", "reason": "writer_deleted" }
```

Deletion is used for cancel/remove and explicit post-send deletion if that control is included in v1.

#### Writer download

```http
GET /api/message-threads/{threadId}/attachments/{attachmentId}/download?projectId={route-project-id}
```

The handler authenticates/resolves the writer, calls the Flask `download-url` endpoint server-to-server, then returns a temporary redirect to the signed URL with `Cache-Control: no-store`. Validate that the backend URL is HTTPS and points to the configured Supabase host before redirecting. Never return the signed URL as browser-readable JSON.

### Agent download route

Create:

```text
app/api/agent-message-threads/[threadId]/attachments/[attachmentId]/download/route.ts
```

```http
GET /api/agent-message-threads/{threadId}/attachments/{attachmentId}/download
```

Resolve the current Clerk literary-agent profile using the same helper as existing agent message routes, call the canonical backend download-url endpoint, validate the redirect target, and redirect with `no-store`.

### Message route extension

Update writer `POST /api/message-threads/[threadId]/messages`:

```json
{
  "projectId": "route-project-id",
  "body": "Attached is the requested manuscript.",
  "attachmentIds": ["attachment-uuid"]
}
```

- Default missing `attachmentIds` to `[]`.
- Validate it is an array of at most one nonblank string.
- Accept blank body only if one attachment ID is present.
- Forward snake_case `attachment_ids` through `sendWriterThreadReply`.
- Keep existing writer-reply authorization and backend error handling.
- Existing body-only callers must remain unchanged.

## Direct upload client

Add `tus-js-client` as the only required upload dependency unless the repository already contains a compatible TUS client. Do not add the larger Uppy dashboard solely for a single-file button.

Suggested files:

```text
app/hooks/use-manuscript-attachment-upload.ts
app/components/messages/manuscript-attachment-picker.tsx
app/components/messages/message-attachment-card.tsx
app/utils/manuscript-attachments.ts
```

Keep server-only API helpers out of client bundles. The client hook receives only the upload-intent response necessary for the direct transfer.

### Client state machine

Represent upload state explicitly:

```text
idle
  -> confirming
  -> creating_intent
  -> uploading(progress)
  -> finalizing
  -> ready
  -> sending
  -> sent/idle

Any active state -> error(retryable or terminal)
Any pre-send state -> cancelling -> idle
```

The hook/component owns:

- Selected local `File` only while needed; never place file bytes in React Query persistence or `localStorage`.
- TUS upload instance/ref for abort/retry.
- Progress as uploaded bytes and percentage.
- Ready normalized attachment ID/metadata.
- Stable error code/message.
- Cancellation and cleanup of server intent.

### TUS sequence

1. Validate file locally for immediate feedback.
2. Show explicit consent confirmation naming the agent.
3. POST upload intent.
4. Create `tus.Upload(file, ...)` using exactly the backend-provided `resumableEndpoint`, `token`, `bucket`, `objectPath`, and `chunkSizeBytes`.
5. Set required TUS metadata:
   - `bucketName`
   - `objectName`
   - canonical `contentType`
   - conservative cache control such as `no-store` if supported
6. Put the signed token in the header specified by the backend handoff, expected to be `x-signature`.
7. Do not use `x-upsert`.
8. Use retry delays appropriate for transient network failure and surface progress.
9. On successful TUS completion, POST finalize.
10. Only enter `ready` after finalize succeeds.
11. On user cancel, abort the TUS request and call DELETE for the intent. Treat an already-deleted/missing response as successful cleanup.
12. If component unmounts during upload, abort the client upload. Do not send state updates after unmount.

Do not derive Supabase endpoints or object paths in client code; use server-provided values. Do not log upload tokens.

### Local validation

Constants:

```ts
const MAX_MANUSCRIPT_BYTES = 25 * 1024 * 1024;
const MANUSCRIPT_CONSENT_VERSION = "manuscript-share-v1";
const ALLOWED_MANUSCRIPT_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;
```

Validate extension case-insensitively and MIME when the browser supplies one. Client validation improves UX only; backend finalization is authoritative.

User messages:

- Unsupported: “Upload a PDF or DOCX manuscript.”
- Too large: “Manuscripts must be 25 MB or smaller.”
- Wrong lifecycle: use backend message, not a generic upload failure.
- Network failure: “Upload interrupted. Try again.” with retry.
- Expired intent: restart from creating a new intent.

## Writer experience

### Initial query composer

In `new-message-composer.tsx`:

- Remove the disabled file input/button, `FileUp` import, file ref, upload state, upload response types, `handleUpload`, and manuscript-text append helpers that exist only for the dormant feature.
- Keep or tighten the explanatory copy: after the agent requests material, the writer can attach it from that conversation.
- Do not enable manuscript upload on the first query.
- Do not call `/api/process-manuscript`.

### Writer thread page props

Pass these serializable values from the Server Component into `ThreadReplyForm`:

- `agentName` from `data.thread.agentName`, with a safe fallback.
- `initialQueryStatus` from resolved `queryProgress.currentCode`.
- Existing version/timeline/message props.

Maintain the current parallel server reads and existing canonical-route redirects.

### Reply composer

Show “Share manuscript” only when:

```ts
queryStatus === "manuscript_requested" ||
queryStatus === "manuscript_under_review"
```

Do not key visibility solely from `canWriterReply`.

Interaction:

1. Writer opens a drag-and-drop dialog or the native file chooser and selects a PDF/DOCX.
2. Show a confirmation dialog before upload intent creation:
   - “Share manuscript with {Agent Name}?”
   - State that WQH will securely store the file and make it available only in this conversation.
   - State retention in concise form and link to the privacy policy.
   - Confirm button records consent version `manuscript-share-v1`.
3. Show filename, formatted size, progress bar/status, Cancel, and Retry.
4. After finalize, show a ready attachment chip/card with Remove.
5. Enable Send when the writer has either a nonblank draft or one ready attachment.
6. Disable file replacement/send while creating intent, uploading, finalizing, cancelling, or sending.
7. On send success, append the returned message with normalized attachments, clear draft/upload state, and refresh existing query progress as today.
8. On send failure, preserve the ready attachment for retry unless the backend says it is expired/deleted/already attached.
9. On navigation with a ready unsent attachment, attempt best-effort cleanup and warn before destructive in-app removal where practical. Do not rely on `beforeunload` network requests for correctness; backend cleanup handles abandoned intents.

The existing “Waiting for the agent” state remains unchanged. If text replies are unlocked by an agent response but the status is not one of the two manuscript statuses, show the normal text composer without an attachment button.

## Shared conversation attachment card

Avoid maintaining two divergent attachment renderers inside the duplicated writer/agent `MessageBubble` implementations. Add a shared presentational `MessageAttachmentCard` with props for attachment, viewer role, thread ID, and writer project ID when required.

Live attachment card displays:

- File icon differentiated for PDF/DOCX if desired.
- Sanitized filename with safe wrapping/truncation and accessible full-name text.
- Human-readable size.
- “Download” action.
- No storage path or provider URL.

Deleted/failed attachment card displays:

- Filename if safe metadata remains.
- “File no longer available.”
- No enabled download action.

Message bubbles:

- Render body `<p>` only when `message.body.trim()` is nonempty.
- Render every normalized attachment below the body with appropriate contrast for sent/received bubble colors.
- Preserve `data-message-id`, anchors, lifecycle-event ordering, pagination merging, and read-state observation.

Download action:

- Use the appropriate same-origin Next.js download endpoint.
- A normal anchor/button navigation is preferred so the route can redirect to the forced-download URL.
- Disable while a request is in flight only if using programmatic navigation; do not fetch the signed URL into persistent application state.
- Surface `410` as “This file is no longer available” and `403/404` as a generic unavailable message.

## Agent experience

- Agent thread reads automatically receive attachment arrays through message normalization.
- Render the same attachment card on writer messages.
- Download route resolves the agent's canonical profile server-side.
- Do not add an upload button to the agent reply composer.
- Do not automatically fire the existing `manuscript_under_review` transition on render or download.
- Existing agent status controls remain the explicit way to mark review progress.

## Consent, privacy policy, and terms

This frontend deliverable owns repository copy changes, but approved legal wording must come from the product owner/legal reviewer.

Update:

- `app/(public)/legal/privacy-policy/page.tsx`
- `app/(public)/legal/terms-of-service/page.tsx`

Required semantic changes:

1. Remove blanket claims that all submitted manuscripts are never stored or distributed to any person.
2. Distinguish:
   - transient content submitted for automated/AI analysis; and
   - manuscript files a writer explicitly chooses to store and share with a named literary agent.
3. State that attachment files are used only to provide the requested sharing/messaging service and are not used for AI training unless the writer separately opts in.
4. State active retention and 90-day post-terminal deletion behavior.
5. State writer deletion/account-erasure behavior.
6. State that deleting from WQH cannot recall a copy an agent already downloaded.
7. In terms, include the narrow license WQH needs to host, secure, transmit, and delete the file for this service while ownership remains with the writer.

Do not silently write final legal claims without product/legal approval. The coding agent may prepare clearly marked proposed copy, but production enablement is a launch gate.

The consent dialog copy shown for `manuscript-share-v1` must be captured verbatim in code or a versioned constant so backend consent records can be interpreted later.

## Error handling

Extend the existing route-error mapping without discarding backend error codes. UI behavior:

| Backend code | UI action |
| --- | --- |
| `ATTACHMENT_INVALID_QUERY_STATUS` | Remove/hide uploader after refresh and show backend message. |
| `ATTACHMENT_TOO_LARGE` | Terminal local file error; choose another file. |
| `ATTACHMENT_UNSUPPORTED_TYPE` | Terminal local file error; choose PDF/DOCX. |
| `ATTACHMENT_UPLOAD_EXPIRED` | Delete local intent state and offer restart. |
| `ATTACHMENT_CONTENT_MISMATCH` | Terminal error explaining the file could not be verified. |
| `ATTACHMENT_INVALID_STATE` | Refresh messages; preserve draft; clear stale ready ID if unavailable. |
| `ATTACHMENT_ALREADY_ATTACHED` | Refresh thread before deciding whether send succeeded elsewhere. |
| `ATTACHMENT_DELETED` | Render unavailable state. |
| `ATTACHMENT_STORAGE_UNAVAILABLE` | Retryable with backoff; do not lose selected file while the component remains mounted. |

All upload/finalize/download/delete Route Handlers must use `Cache-Control: no-store`. Do not include tokens or signed URLs in error telemetry.

## Accessibility and responsive behavior

- File input has an associated visible label/button and supported-format/size help text.
- Consent dialog traps focus, has a descriptive title, and returns focus on close using the repository's existing dialog primitive.
- Progress uses both visual indication and an `aria-live="polite"` text update; do not announce every byte/chunk.
- Error text uses `role="alert"` where immediate action is required.
- Buttons have distinct labels for uploading, cancelling, retrying, removing, and downloading.
- Attachment filename does not overflow narrow mobile bubbles.
- All actions are keyboard accessible.
- Color is not the only signal for ready/error/deleted states.

## Analytics and privacy-safe instrumentation

If product analytics are added, record only event name and coarse metadata—never filename, file bytes, object path, token, signed URL, manuscript title, or message body.

Suggested events:

- `manuscript_attach_opened`
- `manuscript_consent_confirmed`
- `manuscript_upload_started`
- `manuscript_upload_completed`
- `manuscript_upload_failed` with stable error code
- `manuscript_message_sent`
- `manuscript_download_clicked` with viewer role

Analytics must not be required for functional success.

## Implementation sequence

1. Confirm/freeze v1 fixtures from the backend plan.
2. Add `tus-js-client` and lockfile change.
3. Add wire/UI attachment types and pure normalization/format helpers.
4. Extend server message normalization and writer reply request with attachment IDs.
5. Add server helpers for upload intent, finalize, delete, and participant downloads.
6. Add Next.js Route Handlers for writer and agent operations.
7. Build direct-upload hook/state machine against fixture responses.
8. Build shared picker, consent dialog, progress UI, and attachment card.
9. Integrate writer thread composer with canonical lifecycle-status gating.
10. Integrate attachment rendering/downloads into writer and agent message bubbles.
11. Remove dormant upload/extract behavior from the initial-query composer.
12. Prepare approved privacy/terms/consent copy.
13. Add tests, run type/build checks, and perform two-account integration testing.
14. Keep an explicit frontend kill switch for rollback.

## Suggested feature flag

Use a server-readable kill switch such as:

```text
MANUSCRIPT_ATTACHMENTS_ENABLED=false
```

Do not rely solely on a `NEXT_PUBLIC_` flag for authorization. The backend separately enforces its flag and lifecycle/participant rules. The frontend flag controls visibility and beta rollout.

The writer UI is enabled when this value is unset and hidden only when it is
explicitly `false`. Lifecycle status remains the primary UI gate.

The Next.js redirect validator must also receive the canonical backend
`SUPABASE_URL` (and optional `SUPABASE_DIRECT_STORAGE_URL`). Do not fall back to
the app's `NEXT_PUBLIC_SUPABASE_URL`: it may identify a different frontend
project and is not interchangeable with the canonical messaging database and
storage project.

When off:

- No upload controls appear.
- Existing attachment messages, if any, should still render and remain downloadable/deletable so rollback does not strand files.
- Initial-query copy can remain accurate but should not promise immediate availability.

## Test plan

### Pure/unit tests

Use the repository's existing Node test style for pure utilities/contracts unless a component test framework already exists when implementation begins.

- Normalize valid attachment and missing legacy array.
- Unknown/deleted status becomes non-downloadable.
- Human-readable file sizes.
- Extension/MIME and exact size-boundary validation.
- `canSend`: body only, attachment only, both, neither, upload in progress.
- Upload visibility uses exact status, not only `canWriterReply`.
- Error-code-to-UI action mapping.
- Message pagination merge preserves attachments.

### Route/helper tests

- Writer BFF forwards canonical identity/project/thread, not browser-supplied backend IDs.
- Agent BFF forwards canonical profile identity.
- Invalid JSON/attachment IDs receive `400`.
- Blank body plus attachment is accepted; blank body without attachment is rejected.
- Legacy body-only POST remains unchanged.
- Download redirect rejects non-HTTPS or unexpected hosts.
- `Cache-Control: no-store` is present.
- Backend status/code/message propagate safely.

### Component/manual tests

- PDF and DOCX selection.
- Unsupported type and >25 MiB rejection before network request.
- Consent cancel creates no intent.
- Consent confirmation names the correct agent.
- Progress, retry, cancel, remove, and successful finalize.
- Interrupted upload and expired intent.
- Writer sends attachment-only message.
- Writer sends body plus attachment.
- Send failure preserves retryable ready attachment.
- Agent and writer can each download.
- Wrong account cannot download even with copied same-origin URL.
- Deleted attachment renders unavailable.
- Text replies remain available after ordinary agent reply, but upload remains hidden without manuscript status.
- Responsive mobile layout, keyboard flow, screen-reader labels.
- Historical body-only messages still render.

### Required verification commands

Run the narrowest relevant checks first, then:

```bash
node --test tests/<new-manuscript-attachment-tests>.test.mjs
npx tsc --noEmit
npm run build
```

If the repository's existing unrelated changes cause a global failure, record the exact pre-existing failure and still demonstrate targeted feature tests. Do not modify unrelated lifecycle work merely to make the tree clean.

## Two-account end-to-end acceptance flow

1. Agent transitions a writer's query to `manuscript_requested`.
2. Writer refreshes/opens the thread and sees “Share manuscript.”
3. Writer selects a valid DOCX, sees named-agent consent, confirms, observes progress, and reaches ready state.
4. Writer sends with an optional note.
5. Writer message appears immediately with attachment card.
6. Agent sees the same message and downloads successfully.
7. Agent explicitly marks the query `manuscript_under_review`; upload did not do it automatically.
8. Writer can download their own file.
9. A different writer and different agent cannot use a copied attachment URL/ID.
10. Writer deletes the file; both views show unavailable and all later download attempts return `410`.
11. Body-only messaging, pagination, read state, timeline links, and status actions still work.

## Rollout and rollback

- Merge/deploy types and read rendering before exposing upload controls if desired; legacy messages normalize to `[]`.
- Backend must be deployed dark before frontend upload flag is enabled.
- Enable for internal writer/agent accounts, then a small beta cohort.
- Monitor upload-intent, finalization, send, and download failures by stable code.
- Rollback by hiding new upload controls. Preserve render/download/delete support for attachments already sent.
- Do not roll back by making existing files inaccessible without communicating and applying retention/deletion policy.

## Definition of done

- Initial query no longer contains dormant manuscript extraction/upload code.
- Writer attachment UI appears only in the two allowed query statuses.
- Direct TUS upload never proxies bytes through Next.js/Flask.
- Consent is explicit, versioned, and names the recipient.
- Message send supports attachment-only and body-plus-attachment requests.
- Both writer and agent conversations render live and deleted attachment cards.
- Downloads pass through participant-authorized same-origin endpoints and short-lived redirects.
- Existing messaging/lifecycle/pagination/read-state behavior is preserved.
- Privacy policy, terms, and consent copy are approved and consistent with backend retention.
- Targeted tests, TypeScript, and production build pass or have precisely documented unrelated failures.
- Feature is deployed behind a flag and passes the two-account acceptance flow.

## Handoff back to the backend implementer

During integration, report:

1. Any fixture/production response mismatch.
2. Exact TUS header/metadata behavior observed.
3. Any backend code that the UI cannot map to a defined state.
4. Whether finalize is idempotent under browser retries.
5. Whether download redirects force the intended sanitized filename.
6. Any lifecycle race where status changes between intent creation and send.

Contract changes must be made in the backend source-of-truth plan first, then reflected in frontend types and fixtures.
