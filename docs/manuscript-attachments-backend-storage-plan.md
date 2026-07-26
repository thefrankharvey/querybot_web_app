# Manuscript Attachments: Backend and Storage Delivery Plan

## Document status

- Deliverable: storage, persistence, authorization, retention, and canonical messaging API support for manuscript attachments.
- Intended implementer: an AI coding agent working in the WQH Flask/messaging backend repository and the Supabase project it owns.
- Companion plan: [`manuscript-attachments-nextjs-ui-plan.md`](./manuscript-attachments-nextjs-ui-plan.md).
- Contract version: `manuscript-attachments-v1`.
- This document is the source of truth for the cross-deliverable API contract. If implementation constraints require a contract change, update this document first and notify the frontend implementer.

## Objective

Allow a writer to send one PDF or DOCX manuscript file to the literary agent participating in an existing WQH message thread after that agent has requested manuscript material. Store files privately, never expose permanent object URLs, and authorize every upload, attachment, download, and deletion against the canonical message-thread participants.

This is a human-review workflow. It does not require manuscript text extraction, OpenAI Files, embeddings, vector search, or AI analysis.

## Product decisions fixed for v1

Implement against these decisions unless the product owner explicitly changes them:

1. Attachments are thread/message resources, not project profile fields.
2. A writer can upload only when the query status is `manuscript_requested` or `manuscript_under_review`.
3. An agent can download attachments from a thread in which the agent is the participant. Agents cannot upload, replace, or delete writer manuscripts in v1.
4. Supported formats are PDF and DOCX. Reject `.doc`, `.docm`, archives, images, and all other types.
5. Maximum file size is 25 MiB (`26_214_400` bytes).
6. One attachment is allowed per message in the v1 UI. The API uses an array with a maximum length of one so it can evolve without another wire-format change.
7. A message is valid when it contains a nonblank body, one ready attachment, or both.
8. Uploading a manuscript does not automatically transition the query to `manuscript_under_review`. The agent retains control of that existing lifecycle action.
9. Files remain available while the query is active. Delete file bytes 90 days after a terminal query status, immediately during account erasure, or when the writer explicitly deletes the attachment.
10. Deletion removes the storage object but preserves minimal audit metadata. UIs render deleted attachments as unavailable.
11. Signed download URLs expire after 60 seconds and force download rather than inline display.
12. Do not send manuscripts to a third-party malware-scanning service without a separate privacy and legal decision. V1 performs strict format validation and leaves an explicit quarantine/scanning extension point.

## Existing architecture assumptions to verify before editing

The current Next.js repository shows that:

- Next.js authenticates browser users with Clerk and forwards trusted backend user/profile identities to the Flask messaging API.
- The Flask messaging API is protected with the shared `X-WQH-Messaging-Key` credential when configured.
- Message threads, messages, participant authorization, and query lifecycle state are canonical in the Flask backend.
- Supabase is already used by WQH, but the implementer must confirm which Supabase project and database the messaging backend uses before creating tables or a bucket.
- Existing message payloads contain body-only messages and snake_case wire fields.

Do not assume that a caller-supplied `user_id`, `writer_project_id`, `role`, or `profile_id` is sufficient authorization. Reuse the same participant-resolution code used by existing thread/message routes and continue requiring the shared messaging credential.

## Non-goals

- Uploading a manuscript with the first query message.
- Project-wide manuscript libraries or reusing one file across agents.
- Agent annotations, collaborative editing, previews, text extraction, or manuscript search.
- Automatic query-status transitions based on upload or download.
- Supporting legacy Word `.doc` files.
- Public object URLs.
- Storing signed URLs in the database or API response caches.
- Moving `query_letter`, `manuscript`, or `project_manuscript_pages` fields into this workflow.
- Retrofitting attachments onto historical messages.

## Architecture

### Storage

Create one private Supabase Storage file bucket named `manuscripts` unless an environment-specific prefix is already standard. Configure:

- `public = false`.
- File-size limit: 25 MiB.
- Allowed MIME types:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- No client-supplied public ACL.
- No overwrite/upsert behavior.

Use immutable object paths:

```text
threads/{thread_uuid}/{attachment_uuid}.pdf
threads/{thread_uuid}/{attachment_uuid}.docx
```

Never place the original filename, writer name, project name, email address, Clerk ID, or agent name in the object path. Store the original filename only as attachment metadata after stripping directory components, control characters, and unsafe Unicode separators.

All bucket administration, signing, object inspection, and deletion must use server-only credentials. Never return or log the Supabase service-role key.

### Upload transport

The browser uploads bytes directly to Supabase using a server-issued signed upload token and the Supabase resumable/TUS endpoint. The manuscript bytes must not pass through the Next.js or Flask request body.

The backend creates the attachment row and signed upload token only after authorization. The browser uploads, then asks the backend to finalize the attachment. Finalization inspects the actual stored object before marking it ready.

The backend response may include the public Supabase project reference, bucket, object path, resumable endpoint, and upload token. These authorize only the single object upload; they are not download credentials.

### Attachment state machine

Use these persisted states:

```text
pending_upload -> ready -> attached -> deleted
       |           |
       +-> expired +-> deleted
       +-> failed
```

Rules:

- `pending_upload`: intent exists, but finalization has not verified a stored object.
- `ready`: object has been verified and can be attached to one message in the same thread.
- `attached`: attachment was associated with a successfully committed message.
- `expired`: the upload intent passed its application expiration or cleanup threshold without becoming ready.
- `failed`: finalization found a missing, mismatched, or invalid object. Delete any stored bytes when possible.
- `deleted`: storage bytes have been deleted or confirmed absent. Metadata remains for conversation/audit rendering.
- Transitions must be compare-and-set or transactionally guarded so concurrent finalize/send/delete requests cannot attach an invalid object.
- An attached record cannot be attached to a second message.

## Persistence model

Create a `message_attachments` table in the same canonical database as message threads and messages. Adapt naming/types to backend conventions, but preserve the semantics below.

| Column | Required | Purpose |
| --- | --- | --- |
| `id` UUID PK | yes | Public opaque attachment identifier. |
| `thread_id` UUID FK | yes | Canonical message thread. |
| `message_id` UUID FK nullable | no until sent | Message that owns the attachment after send. |
| `writer_project_id` UUID FK | yes | Project scope copied from and verified against the thread. |
| `uploader_user_id` UUID/text | yes | Canonical backend writer user ID. |
| `uploader_role` text | yes | Must be `writer` in v1. |
| `bucket_id` text | yes | Normally `manuscripts`; never supplied by the browser. |
| `object_path` text unique | yes | Server-generated immutable storage key. |
| `original_filename` text | yes | Sanitized display/download filename. |
| `extension` text | yes | `pdf` or `docx`. |
| `content_type` text | yes | Canonical server-selected MIME type. |
| `expected_size_bytes` bigint | yes | Size claimed in upload intent, validated again at finalize. |
| `size_bytes` bigint nullable | no until finalized | Actual provider-reported object size. |
| `storage_etag` text nullable | optional | Provider object version/etag for diagnostics. |
| `status` text | yes | State-machine value above. |
| `consent_version` text | yes | Exact consent-copy version accepted by the writer. Start with `manuscript-share-v1`. |
| `consented_at` timestamptz | yes | Server timestamp for explicit sharing consent. |
| `upload_expires_at` timestamptz | yes | Application deadline after which finalize must fail. Recommend 30 minutes. |
| `uploaded_at` timestamptz nullable | no until ready | Successful finalization time. |
| `attached_at` timestamptz nullable | no until sent | Successful message association time. |
| `last_downloaded_at` timestamptz nullable | optional | Most recent authorized signed-download issuance. |
| `download_count` integer | yes | Starts at zero; increment on signed-download issuance. |
| `created_at`/`updated_at` | yes | Standard timestamps. |
| `deleted_at` timestamptz nullable | no until deleted | Byte-deletion time. |
| `deletion_reason` text nullable | no until deleted | `writer_deleted`, `retention`, `account_erasure`, or administrative reason. |

Required indexes/constraints:

- Index `thread_id, created_at`.
- Index `message_id`.
- Index `status, created_at` for cleanup.
- Unique `object_path`.
- Check allowed status values.
- Check `uploader_role = 'writer'` for v1.
- Check nonnegative sizes and `download_count`.
- Enforce at most one nondeleted attachment per message. A partial unique index on `message_id` is appropriate if the database supports it.
- Foreign-key deletion behavior must preserve minimal audit records while preventing orphaned live objects. Do not cascade database deletion without first deleting storage bytes.

Do not use the Supabase `storage.objects` table as the application metadata table and do not mutate that schema directly.

## Canonical API contract: `manuscript-attachments-v1`

All endpoints return JSON except the existing signed-upload byte transfer performed directly against Supabase. Continue the existing shared-secret requirements and identity conventions. Snake_case is canonical on the Flask wire.

### Common attachment representation

```json
{
  "attachment_id": "8bdb690e-c3d0-4a56-a7cc-03a4ece38fcb",
  "thread_id": "9a9de8ba-7e5b-4ec4-b58f-e96a2eef0dc9",
  "message_id": "6ce40799-6de2-477b-b604-4433d59aa8ea",
  "filename": "My Novel.docx",
  "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "size_bytes": 482913,
  "status": "attached",
  "created_at": "2026-07-21T16:00:00Z",
  "deleted_at": null
}
```

Never include `bucket_id`, `object_path`, an upload token, a service key, or a signed download URL in normal message/thread payloads.

### 1. Create writer upload intent

```http
POST /message-threads/{thread_id}/attachments/upload-intents
Content-Type: application/json
X-WQH-Messaging-Key: ...
```

Request:

```json
{
  "user_id": "canonical-writer-user-id",
  "role": "writer",
  "writer_project_id": "canonical-writer-project-id",
  "filename": "My Novel.docx",
  "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "size_bytes": 482913,
  "consent_version": "manuscript-share-v1"
}
```

Success: `201`

```json
{
  "status": "success",
  "attachment": {
    "attachment_id": "8bdb690e-c3d0-4a56-a7cc-03a4ece38fcb",
    "thread_id": "9a9de8ba-7e5b-4ec4-b58f-e96a2eef0dc9",
    "message_id": null,
    "filename": "My Novel.docx",
    "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "size_bytes": 482913,
    "status": "pending_upload",
    "created_at": "2026-07-21T16:00:00Z",
    "deleted_at": null
  },
  "upload": {
    "bucket": "manuscripts",
    "object_path": "threads/9a9de8ba-7e5b-4ec4-b58f-e96a2eef0dc9/8bdb690e-c3d0-4a56-a7cc-03a4ece38fcb.docx",
    "resumable_endpoint": "https://PROJECT_REF.storage.supabase.co/storage/v1/upload/resumable",
    "token": "provider-signed-single-object-token",
    "expires_at": "2026-07-21T16:30:00Z",
    "chunk_size_bytes": 6291456
  }
}
```

Authorization and validation:

- Resolve the thread and writer participant using existing backend helpers.
- Confirm the thread's `writer_project_id` matches the authenticated writer's project.
- Confirm current query status is exactly `manuscript_requested` or `manuscript_under_review`.
- Validate filename extension, claimed MIME type, and `0 < size_bytes <= 26_214_400`.
- Validate `consent_version` against the backend allowlist.
- Generate the UUID, canonical extension/MIME, bucket, and object path server-side.
- Do not use `upsert`.

### 2. Finalize upload

```http
POST /message-threads/{thread_id}/attachments/{attachment_id}/finalize
Content-Type: application/json
X-WQH-Messaging-Key: ...
```

Request:

```json
{
  "user_id": "canonical-writer-user-id",
  "role": "writer",
  "writer_project_id": "canonical-writer-project-id"
}
```

Success: `200`

```json
{
  "status": "success",
  "attachment": {
    "attachment_id": "8bdb690e-c3d0-4a56-a7cc-03a4ece38fcb",
    "thread_id": "9a9de8ba-7e5b-4ec4-b58f-e96a2eef0dc9",
    "message_id": null,
    "filename": "My Novel.docx",
    "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "size_bytes": 482913,
    "status": "ready",
    "created_at": "2026-07-21T16:00:00Z",
    "deleted_at": null
  }
}
```

Finalization requirements:

- Reauthorize the writer, project, and thread.
- Require the row to be `pending_upload`, owned by this writer, and unexpired. Make a repeated finalize idempotently return the already-`ready` record if the same owner calls it.
- Fetch provider metadata for the exact server-generated object path.
- Reject missing, zero-length, oversized, or claimed/actual size-mismatched objects. Allow only a small documented tolerance if the provider reports encoded size differently; ideally require exact bytes.
- Do not trust the browser's MIME header alone.
- For PDF, verify the file starts with a valid PDF signature and is not a polyglot format detectable by the chosen parser.
- For DOCX, verify it is a ZIP package containing `[Content_Types].xml` and `word/document.xml`; reject encrypted packages and macro content such as `vbaProject.bin`.
- Delete invalid bytes, mark `failed`, and return a stable error.
- Set actual size/provider metadata and transition to `ready` atomically.

If strict signature validation cannot be performed without downloading the entire object in the backend runtime, document that limitation in the implementation PR and at minimum verify provider metadata, canonical extension, size, and MIME. Do not silently claim malware scanning.

### 3. Extend create-message request

Existing endpoint:

```http
POST /message-threads/{thread_id}/messages
```

Extended request:

```json
{
  "user_id": "canonical-writer-user-id",
  "role": "writer",
  "body": "Attached is the requested full manuscript.",
  "attachment_ids": [
    "8bdb690e-c3d0-4a56-a7cc-03a4ece38fcb"
  ]
}
```

Compatibility requirements:

- `attachment_ids` is optional and defaults to `[]` so current clients keep working.
- Accept a blank body only when exactly one valid attachment ID is supplied.
- Reject more than one ID in v1.
- Before creating the message, lock/verify that every supplied attachment is `ready`, belongs to this writer and thread, and has no `message_id`.
- Create the message, set `message_id`, and transition the attachment to `attached` in one database transaction.
- If the transaction fails, leave the attachment `ready` so the writer can retry.
- A repeated request must not attach the same attachment twice. Preserve any existing message idempotency semantics; do not invent duplicate messages during retries.
- Return the new message with an `attachments` array.

Extend every message-returning response—including pagination and thread creation if applicable—with:

```json
{
  "message_id": "6ce40799-6de2-477b-b604-4433d59aa8ea",
  "thread_id": "9a9de8ba-7e5b-4ec4-b58f-e96a2eef0dc9",
  "sender_user_id": "canonical-writer-user-id",
  "sender_role": "writer",
  "body": "Attached is the requested full manuscript.",
  "created_at": "2026-07-21T16:05:00Z",
  "attachments": [
    {
      "attachment_id": "8bdb690e-c3d0-4a56-a7cc-03a4ece38fcb",
      "thread_id": "9a9de8ba-7e5b-4ec4-b58f-e96a2eef0dc9",
      "message_id": "6ce40799-6de2-477b-b604-4433d59aa8ea",
      "filename": "My Novel.docx",
      "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "size_bytes": 482913,
      "status": "attached",
      "created_at": "2026-07-21T16:00:00Z",
      "deleted_at": null
    }
  ]
}
```

For legacy messages, always emit `attachments: []` rather than omitting the field once v1 is deployed.

### 4. Create a download URL

```http
POST /message-threads/{thread_id}/attachments/{attachment_id}/download-url
Content-Type: application/json
X-WQH-Messaging-Key: ...
```

Writer request:

```json
{
  "user_id": "canonical-writer-user-id",
  "role": "writer"
}
```

Agent request:

```json
{
  "user_id": "canonical-agent-user-id",
  "role": "agent",
  "profile_id": "canonical-agent-profile-id"
}
```

Success: `200`

```json
{
  "status": "success",
  "download": {
    "url": "https://signed-provider-url",
    "expires_at": "2026-07-21T16:07:00Z",
    "filename": "My Novel.docx"
  }
}
```

Requirements:

- Authorize the caller as the writer or agent participant of this exact thread using existing participant resolution.
- Require the attachment to be `attached`, associated with a message in this thread, and not deleted.
- Generate the signed URL server-side for 60 seconds with forced-download disposition and the sanitized original filename.
- Return `Cache-Control: no-store` and ensure upstream proxies do not cache the response.
- Increment download metrics only after successful authorization and URL creation.
- Never log the signed URL.

### 5. Delete an attachment

```http
DELETE /message-threads/{thread_id}/attachments/{attachment_id}
Content-Type: application/json
X-WQH-Messaging-Key: ...
```

Request:

```json
{
  "user_id": "canonical-writer-user-id",
  "role": "writer",
  "writer_project_id": "canonical-writer-project-id",
  "reason": "writer_deleted"
}
```

Requirements:

- Only the authenticated writer participant/uploader may use this endpoint in v1.
- If `pending_upload` or `ready`, delete any object and mark the row deleted; the record will never appear in a message.
- If `attached`, delete the object and mark the record deleted without modifying historical message text or deleting the message.
- Make deletion idempotent.
- A subsequent message response includes the attachment metadata with `status: "deleted"`; download returns `410 Gone`.
- Explain in product copy that deletion prevents future access but cannot recall copies an agent already downloaded.

### Stable error envelope

```json
{
  "status": "error",
  "code": "ATTACHMENT_INVALID_QUERY_STATUS",
  "message": "Manuscript upload is available after the agent requests material."
}
```

Use appropriate HTTP statuses and stable codes:

| HTTP | Code examples | Meaning |
| --- | --- | --- |
| `400` | `ATTACHMENT_INVALID_REQUEST`, `ATTACHMENT_INVALID_FILENAME` | Malformed input. |
| `401` | existing auth code | No valid participant identity. |
| `403` | `ATTACHMENT_FORBIDDEN` | Authenticated but not this thread's participant/uploader. |
| `404` | `ATTACHMENT_NOT_FOUND`, existing thread not found | Do not leak cross-tenant existence. |
| `409` | `ATTACHMENT_INVALID_QUERY_STATUS`, `ATTACHMENT_INVALID_STATE`, `ATTACHMENT_ALREADY_ATTACHED` | Lifecycle/state conflict. |
| `410` | `ATTACHMENT_DELETED`, `ATTACHMENT_UPLOAD_EXPIRED` | Resource intentionally unavailable. |
| `413` | `ATTACHMENT_TOO_LARGE` | More than 25 MiB. |
| `415` | `ATTACHMENT_UNSUPPORTED_TYPE` | Not PDF/DOCX. |
| `422` | `ATTACHMENT_CONTENT_MISMATCH` | Stored bytes do not match intent/type. |
| `502`/`503` | `ATTACHMENT_STORAGE_UNAVAILABLE` | Supabase operation failed/transient. |

## Authorization matrix

| Operation | Writer participant | Agent participant | Anyone else |
| --- | --- | --- | --- |
| Create upload intent | allowed only in two allowed statuses | denied | denied |
| Finalize own upload | allowed | denied | denied |
| Attach ready upload to message | allowed only for own ready attachment | denied | denied |
| Download attached live file | allowed | allowed | denied/not found |
| Delete | allowed for uploader | denied | denied/not found |
| List bucket or object path | never exposed | never exposed | never exposed |

Authorization must be rechecked on every step. Possession of an attachment UUID, upload token, stale signed URL, or thread UUID is not application authorization.

## Retention and cleanup

Add an idempotent scheduled cleanup operation:

1. `pending_upload` older than 24 hours: delete any object, mark `expired`.
2. `failed` rows with remaining objects: retry deletion.
3. Attachments on threads terminal for at least 90 days: delete object, mark `deleted`, set `deletion_reason = 'retention'`.
4. Account erasure: delete all live objects belonging to the writer before or as part of account removal; mark reason `account_erasure` when audit rows remain legally permissible.
5. Detect `ready` but unattached rows older than 24 hours and expire them.

Use the Storage API for object deletion. Do not delete rows from `storage.objects` directly. Record counts for selected, deleted, already missing, and failed objects. Cleanup must be safe to retry and must not delete an object unless its application row and retention condition were revalidated immediately beforehand.

## Security and privacy requirements

- Keep the bucket private.
- Never log file bytes, upload tokens, object paths together with user PII, or signed download URLs.
- Sanitize filenames for headers and UI; prevent CRLF/header injection.
- Use server-generated paths and canonical MIME types.
- Force download with `Content-Disposition: attachment`.
- Disable caching on upload-intent, finalize, delete, and download-url responses.
- Apply request rate limits to upload intents, finalize, and signed-download creation using existing backend patterns.
- Add a reasonable per-writer live-storage quota or at minimum emit metrics that allow abuse detection. A suggested initial guard is 10 live/unattached upload intents and 100 live attached manuscripts per writer, but confirm this product limit before enforcing it.
- Do not use public URLs or long-lived signed URLs.
- Do not include manuscript bytes in error reporting, traces, analytics, PostHog, or support logs.
- Preserve the existing rule that secrets are server-only.
- Add a documented future `quarantined` state only when malware scanning is actually implemented. Do not label files as scanned when only MIME/signature validation occurred.

## Observability

Emit structured events without filenames or signed URLs:

- `manuscript_upload_intent_created`
- `manuscript_upload_finalized`
- `manuscript_attachment_attached`
- `manuscript_download_authorized`
- `manuscript_attachment_deleted`
- `manuscript_cleanup_completed`
- `manuscript_storage_error`

Useful dimensions: environment, attachment ID, thread ID, role, status transition, canonical error code, size bucket, latency, and storage provider operation. Treat user IDs as sensitive and follow existing logging policy.

Add alerts for elevated finalization failures, storage provider failures, cleanup failures, and authorization-denial spikes.

## Implementation sequence

1. Confirm the canonical messaging database and Supabase project.
2. Add migration for `message_attachments` and constraints/indexes.
3. Create/configure the private bucket through the approved Supabase administration path.
4. Add attachment domain model, serializers, error codes, and state-transition helpers.
5. Add signed upload-intent route and provider adapter.
6. Add finalize validation and object inspection.
7. Extend message creation transaction and all message serializers with `attachments`.
8. Add signed download route.
9. Add idempotent writer deletion.
10. Add cleanup/retention job.
11. Add tests and publish contract fixtures for frontend work.
12. Deploy with endpoint availability but keep the frontend feature flag off.

## Test plan

### Unit tests

- Filename sanitization and canonical extension/MIME mapping.
- Size boundaries: zero, one byte, exact 25 MiB, and 25 MiB plus one.
- Allowed and rejected lifecycle statuses.
- Attachment state transitions and idempotency.
- PDF/DOCX signature validation and malformed/polyglot/macro-enabled rejection.
- Error-code mapping.
- Retention eligibility calculations.

### API/integration tests

- Writer participant can create intent only for their thread/project and allowed status.
- Agent and unrelated writer cannot create/finalize/delete.
- Cross-thread/project attachment IDs return nonleaking authorization errors.
- Missing, expired, oversized, type-mismatched, and corrupt uploads fail finalization and clean bytes.
- Successful finalize returns `ready`.
- Body-only legacy message still succeeds and returns `attachments: []`.
- Attachment-only message succeeds.
- Blank body with no attachment fails.
- More than one attachment fails in v1.
- Ready attachment becomes attached in the same message transaction.
- Simulated message transaction failure leaves attachment ready and retryable.
- Reuse of attached attachment fails.
- Both correct participants can obtain a 60-second download; unrelated users cannot.
- Deleted attachment returns `410` and cannot be signed.
- Cleanup handles already-missing objects and repeated runs.

### Contract fixtures to hand to frontend

Provide checked-in JSON fixtures or test factory output for:

- Upload-intent success.
- Finalize success.
- Writer message with one attached DOCX.
- Writer message with one deleted attachment.
- Every stable error code the UI handles specially.

The fixture shapes must exactly match this v1 contract.

## Rollout and rollback

- Add a backend environment flag such as `MANUSCRIPT_ATTACHMENTS_ENABLED`; when off, new attachment endpoints return a stable unavailable response while legacy messaging remains untouched.
- Apply additive schema/API changes first. Do not make `attachments` required on inbound legacy requests.
- Deploy backend before enabling the frontend flag.
- Run a private test with nonproduction PDF and DOCX files and both writer/agent accounts.
- Enable for internal accounts, then a small beta cohort, then all eligible threads.
- Rollback by disabling new intents. Existing attached files must remain downloadable/deletable until retention removes them; do not strand already-shared attachments.

## Product/legal launch gate

The current public privacy policy and terms promise that submitted manuscripts are never stored or distributed to any person. The frontend companion deliverable owns the repository copy changes, but production enablement is blocked until approved copy:

- distinguishes transient AI analysis from writer-directed agent sharing;
- grants WQH the limited right to host and transmit the attachment to the chosen agent;
- states retention and deletion behavior;
- states that deleting a file cannot recall an agent's prior download;
- continues to state that manuscript attachments are not used for AI training unless a separate opt-in exists.

Record `consent_version = 'manuscript-share-v1'` and `consented_at` with each upload intent so the stored consent matches the approved copy.

## Definition of done

- Private bucket exists with type/size restrictions.
- Migration is applied and rollback implications documented.
- All five contract operations work with canonical participant authorization.
- Existing body-only messaging remains compatible.
- Message reads always include `attachments`.
- Direct-to-Supabase upload works without proxying bytes through application servers.
- No permanent URL, object path, token, or secret appears in normal message payloads/logs.
- Retention/deletion is implemented and tested, not merely documented.
- Frontend fixtures are available and match production serializers.
- Feature is deployed dark and ready for companion UI integration.

## Handoff to the frontend implementer

Provide:

1. Base backend deployment/environment where attachment endpoints are available.
2. Confirmation of exact `manuscript-attachments-v1` request/response fixtures.
3. Supabase resumable endpoint behavior and the exact header containing the signed upload token.
4. Confirmed application upload-intent expiration.
5. Canonical error-code table.
6. Confirmation that both writer and agent download authorization paths pass integration tests.
7. Feature-flag coordination and beta accounts.

