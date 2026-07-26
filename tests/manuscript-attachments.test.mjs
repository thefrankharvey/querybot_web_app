import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function compileTypeScriptModule(
  relativePath,
  {
    environment = {},
    fetchImplementation = globalThis.fetch,
    requireModule = require,
    transform,
  } = {},
) {
  const filePath = resolve(repositoryRoot, relativePath);
  const originalSource = readFileSync(filePath, "utf8");
  const source = transform ? transform(originalSource) : originalSource;
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;
  const compiledModule = { exports: {} };
  const context = vm.createContext({
    Buffer,
    Headers,
    Request,
    Response,
    URL,
    URLSearchParams,
    console,
    exports: compiledModule.exports,
    fetch: fetchImplementation,
    module: compiledModule,
    process: { env: { ...environment } },
    require: requireModule,
    setTimeout,
  });

  vm.runInContext(output, context, { filename: filePath });
  return compiledModule.exports;
}

const attachmentUtils = compileTypeScriptModule(
  "app/utils/manuscript-attachments.ts",
);

function loadAttachmentUrlUtils(environment = {}) {
  return compileTypeScriptModule(
    "app/utils/manuscript-attachment-urls.server.ts",
    {
      environment,
      requireModule(specifier) {
        if (specifier === "server-only") return {};
        return require(specifier);
      },
    },
  );
}

function loadWriterMessageData(fetchImplementation) {
  const messageTypes = compileTypeScriptModule("app/utils/message-types.ts");
  const emptyModule = new Proxy(
    {},
    { get: () => () => undefined },
  );

  return compileTypeScriptModule(
    "app/utils/message-thread-data.ts",
    {
      fetchImplementation,
      requireModule(specifier) {
        if (specifier === "server-only") return {};
        if (specifier === "crypto") return require("node:crypto");
        if (specifier === "@clerk/nextjs/server") {
          return {
            auth: async () => ({ userId: "clerk-writer" }),
            currentUser: async () => null,
          };
        }
        if (specifier === "@/lib/config") {
          return {
            getWqhApiUrl: () => "https://api.example.test",
            getWqhMessagingApiSecret: () => "messaging-secret",
          };
        }
        if (specifier === "@/app/utils/project-profile-data") {
          return {
            getProjectProfileRouteData: async () => ({
              source: "writer-project-api",
              profile: {
                projectId: "canonical-route-project",
                projectName: "Novel",
                writerProjectId: "canonical-writer-project",
                userId: "canonical-writer-user",
              },
            }),
          };
        }
        if (specifier === "@/app/utils/manuscript-attachments") {
          return attachmentUtils;
        }
        if (specifier === "@/app/utils/message-types") {
          return messageTypes;
        }
        if (specifier === "@/app/constants") {
          return {
            AGENT_MATCHES_TABLE: "agent_matches",
            DEFAULT_PROJECT_NAME: "Untitled",
          };
        }
        return emptyModule;
      },
    },
  );
}

function writerThreadDetailResponse() {
  return Response.json({
    status: "success",
    thread: {
      thread_id: "thread-1",
      writer_project_id: "canonical-writer-project",
    },
    query_progress: { current_code: "manuscript_requested" },
  });
}

function wireAttachment(status, messageId = null) {
  return {
    attachment_id: "attachment-1",
    thread_id: "thread-1",
    message_id: messageId,
    filename: "Novel.pdf",
    content_type: "application/pdf",
    size_bytes: 2048,
    status,
    created_at: "2026-07-21T16:00:00+00:00",
    deleted_at:
      status === "deleted" ? "2026-07-21T16:10:00+00:00" : null,
  };
}

test("normalizes attachment fixtures without exposing storage details", () => {
  const attachment = attachmentUtils.normalizeMessageAttachment({
    attachment_id: " attachment-1 ",
    thread_id: " thread-1 ",
    message_id: null,
    filename: " My Novel.docx ",
    content_type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size_bytes: 482_913,
    status: "ready",
    created_at: "2026-07-21T16:00:00+00:00",
    deleted_at: null,
    object_path: "must-not-leak",
    token: "must-not-leak",
  });

  assert.equal(attachment.attachmentId, "attachment-1");
  assert.equal(attachment.filename, "My Novel.docx");
  assert.equal(attachment.status, "ready");
  assert.equal(attachment.sizeBytes, 482_913);
  assert.equal("objectPath" in attachment, false);
  assert.equal("token" in attachment, false);
});

test("unknown attachment states and invalid sizes normalize unavailable", () => {
  const attachment = attachmentUtils.normalizeMessageAttachment({
    filename: " manuscript.pdf ",
    size_bytes: Number.NaN,
    status: "future_state",
  });

  assert.equal(attachment.status, "deleted");
  assert.equal(attachment.sizeBytes, 0);
  assert.equal(
    attachmentUtils.isAttachmentDownloadable(attachment),
    false,
  );
});

test("validates PDF and DOCX extensions, MIME, and the exact size boundary", () => {
  assert.equal(
    attachmentUtils.validateManuscriptFile({
      name: "NOVEL.PDF",
      size: attachmentUtils.MAX_MANUSCRIPT_BYTES,
      type: "application/pdf",
    }).ok,
    true,
  );
  assert.equal(
    attachmentUtils.validateManuscriptFile({
      name: "novel.docx",
      size: 1024,
      type: "",
    }).ok,
    true,
  );
  assert.equal(
    attachmentUtils.validateManuscriptFile({
      name: "novel.docx",
      size: attachmentUtils.MAX_MANUSCRIPT_BYTES + 1,
      type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }).code,
    "ATTACHMENT_TOO_LARGE",
  );
  assert.equal(
    attachmentUtils.validateManuscriptFile({
      name: "novel.pdf",
      size: 0,
      type: "application/pdf",
    }).code,
    "ATTACHMENT_INVALID_REQUEST",
  );
  assert.equal(
    attachmentUtils.validateManuscriptFile({
      name: "novel.doc",
      size: 1024,
      type: "application/msword",
    }).code,
    "ATTACHMENT_UNSUPPORTED_TYPE",
  );
  assert.equal(
    attachmentUtils.validateManuscriptFile({
      name: "novel.pdf",
      size: 1024,
      type:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }).code,
    "ATTACHMENT_UNSUPPORTED_TYPE",
  );
});

test("builds the exact signed TUS handoff without enabling upsert", () => {
  const options = attachmentUtils.buildManuscriptTusOptions({
    status: "success",
    attachment: {
      attachmentId: "attachment-1",
      threadId: "thread-1",
      messageId: null,
      filename: "Novel.pdf",
      contentType: "application/pdf",
      sizeBytes: 2048,
      status: "pending_upload",
      createdAt: "2026-07-21T16:00:00+00:00",
      deletedAt: null,
    },
    upload: {
      bucket: "manuscripts",
      objectPath: "threads/thread-1/attachment-1.pdf",
      resumableEndpoint:
        "https://project-ref.storage.supabase.co/storage/v1/upload/resumable",
      token: "signed-token",
      expiresAt: "2026-07-21T16:30:00+00:00",
      chunkSizeBytes: attachmentUtils.MANUSCRIPT_TUS_CHUNK_SIZE_BYTES,
    },
  });

  assert.equal(
    options.endpoint,
    "https://project-ref.storage.supabase.co/storage/v1/upload/resumable",
  );
  assert.equal(options.chunkSize, 6 * 1024 * 1024);
  assert.deepEqual({ ...options.headers }, { "x-signature": "signed-token" });
  assert.equal("x-upsert" in options.headers, false);
  assert.deepEqual(
    { ...options.metadata },
    {
      bucketName: "manuscripts",
      objectName: "threads/thread-1/attachment-1.pdf",
      contentType: "application/pdf",
      cacheControl: "0",
    },
  );
});

test("formats sizes and allows body-only, attachment-only, or combined sends", () => {
  assert.equal(attachmentUtils.formatFileSize(0), "0 B");
  assert.equal(attachmentUtils.formatFileSize(1536), "1.5 KB");
  assert.equal(attachmentUtils.formatFileSize(1.5 * 1024 * 1024), "1.5 MB");

  const canSend = (body, attachmentReady, overrides = {}) =>
    attachmentUtils.canSendMessage({
      body,
      attachmentReady,
      canReply: true,
      isBusy: false,
      ...overrides,
    });

  assert.equal(canSend("A note", false), true);
  assert.equal(canSend("", true), true);
  assert.equal(canSend("A note", true), true);
  assert.equal(canSend("", false), false);
  assert.equal(canSend("A note", true, { isBusy: true }), false);
  assert.equal(canSend("A note", true, { canReply: false }), false);
});

test("upload visibility is keyed only to the two manuscript statuses", () => {
  assert.equal(
    attachmentUtils.isManuscriptUploadVisible("manuscript_requested", true),
    true,
  );
  assert.equal(
    attachmentUtils.isManuscriptUploadVisible(
      "manuscript_under_review",
      true,
    ),
    true,
  );
  assert.equal(
    attachmentUtils.isManuscriptUploadVisible(
      "offer_of_representation",
      true,
    ),
    false,
  );
  assert.equal(
    attachmentUtils.isManuscriptUploadVisible("manuscript_requested", false),
    false,
  );
});

test("attachment rollout is enabled unless the kill switch is explicitly false", () => {
  assert.equal(
    loadAttachmentUrlUtils().isManuscriptAttachmentsEnabled(),
    true,
  );
  assert.equal(
    loadAttachmentUrlUtils({
      MANUSCRIPT_ATTACHMENTS_ENABLED: " true ",
    }).isManuscriptAttachmentsEnabled(),
    true,
  );
  assert.equal(
    loadAttachmentUrlUtils({
      MANUSCRIPT_ATTACHMENTS_ENABLED: "FALSE",
    }).isManuscriptAttachmentsEnabled(),
    false,
  );
});

test("maps stable backend error codes to deterministic UI actions", () => {
  assert.equal(
    attachmentUtils.getAttachmentErrorAction("ATTACHMENT_INVALID_FILENAME"),
    "choose_file",
  );
  assert.equal(
    attachmentUtils.getAttachmentErrorAction("ATTACHMENT_UPLOAD_EXPIRED"),
    "restart",
  );
  assert.equal(
    attachmentUtils.getAttachmentErrorAction("ATTACHMENT_INVALID_STATE"),
    "refresh",
  );
  assert.equal(
    attachmentUtils.getAttachmentErrorAction("ATTACHMENT_CONTENT_MISMATCH"),
    "choose_file",
  );
  assert.equal(
    attachmentUtils.getAttachmentErrorAction(
      "ATTACHMENT_STORAGE_UNAVAILABLE",
    ),
    "retry",
  );
  assert.equal(
    attachmentUtils.getAttachmentErrorAction("ATTACHMENT_DELETED"),
    "unavailable",
  );
});

test("message normalization treats legacy missing arrays as empty", () => {
  const emptyModule = new Proxy(
    {},
    { get: () => () => undefined },
  );
  const messageData = compileTypeScriptModule(
    "app/utils/message-thread-data.ts",
    {
      requireModule(specifier) {
        if (specifier === "server-only") return {};
        if (specifier === "crypto") return require("node:crypto");
        if (specifier === "@/app/utils/manuscript-attachments") {
          return attachmentUtils;
        }
        return emptyModule;
      },
    },
  );

  const legacy = messageData.normalizeMessage({
    message_id: "message-1",
    thread_id: "thread-1",
    sender_user_id: "writer-1",
    sender_role: "writer",
    body: "Hello",
    created_at: "2026-07-21T16:00:00+00:00",
  });
  const withAttachment = messageData.normalizeMessage({
    message_id: "message-2",
    thread_id: "thread-1",
    sender_user_id: "writer-1",
    sender_role: "writer",
    body: "",
    created_at: "2026-07-21T16:01:00+00:00",
    attachments: [
      {
        attachment_id: "attachment-1",
        thread_id: "thread-1",
        message_id: "message-2",
        filename: "Novel.pdf",
        content_type: "application/pdf",
        size_bytes: 2048,
        status: "attached",
        created_at: "2026-07-21T16:00:00+00:00",
        deleted_at: null,
      },
    ],
  });

  assert.deepEqual(Array.from(legacy.attachments), []);
  assert.equal(withAttachment.attachments[0].status, "attached");
});

test("writer attachment helper forwards canonical identity and project IDs", async () => {
  const requests = [];
  const fetchImplementation = async (url, init = {}) => {
    requests.push({ url: String(url), init });

    if (requests.length === 1) {
      return writerThreadDetailResponse();
    }

    return Response.json(
      {
        status: "success",
        attachment: wireAttachment("pending_upload"),
        upload: {
          bucket: "manuscripts",
          object_path: "threads/thread-1/attachment-1.pdf",
          resumable_endpoint:
            "https://project-ref.storage.supabase.co/storage/v1/upload/resumable",
          token: "signed-token",
          expires_at: "2026-07-21T16:30:00+00:00",
          chunk_size_bytes: 6_291_456,
        },
      },
      { status: 201 },
    );
  };
  const messageData = loadWriterMessageData(fetchImplementation);

  await messageData.createWriterAttachmentUploadIntent({
    contentType: "application/pdf",
    consentVersion: "manuscript-share-v1",
    filename: "Novel.pdf",
    routeProjectId: "browser-route-project",
    sizeBytes: 2048,
    threadId: "thread-1",
  });

  assert.match(
    requests[0].url,
    /user_id=canonical-writer-user.*role=writer/,
  );
  const forwarded = JSON.parse(requests[1].init.body);
  assert.equal(forwarded.user_id, "canonical-writer-user");
  assert.equal(forwarded.writer_project_id, "canonical-writer-project");
  assert.equal(forwarded.role, "writer");
  assert.equal("projectId" in forwarded, false);
  assert.equal(requests[1].init.headers["X-WQH-Messaging-Key"], undefined);
  assert.equal(
    new Headers(requests[1].init.headers).get("X-WQH-Messaging-Key"),
    "messaging-secret",
  );
});

test("writer finalize, delete, and download helpers match the backend contract", async () => {
  const requests = [];
  const fetchImplementation = async (url, init = {}) => {
    const request = { url: String(url), init };
    requests.push(request);

    if (!init.method) return writerThreadDetailResponse();
    if (request.url.endsWith("/finalize")) {
      return Response.json({
        status: "success",
        attachment: wireAttachment("ready"),
      });
    }
    if (init.method === "DELETE") {
      return Response.json({
        status: "success",
        attachment: wireAttachment("deleted"),
      });
    }
    if (request.url.endsWith("/download-url")) {
      return Response.json({
        status: "success",
        download: {
          url: "https://project-ref.supabase.co/storage/v1/object/sign/manuscripts/file?token=secret",
          expires_at: "2026-07-21T16:11:00+00:00",
          filename: "Novel.pdf",
        },
      });
    }
    throw new Error(`Unexpected request: ${request.url}`);
  };
  const messageData = loadWriterMessageData(fetchImplementation);
  const input = {
    attachmentId: "attachment-1",
    routeProjectId: "browser-route-project",
    threadId: "thread-1",
  };

  await messageData.finalizeWriterAttachment(input);
  await messageData.deleteWriterAttachment(input);
  await messageData.getWriterAttachmentDownload(input);

  const mutationRequests = requests.filter(({ init }) => init.method);
  const finalizeBody = JSON.parse(mutationRequests[0].init.body);
  const deleteBody = JSON.parse(mutationRequests[1].init.body);
  const downloadBody = JSON.parse(mutationRequests[2].init.body);

  assert.deepEqual(
    { ...finalizeBody },
    {
      user_id: "canonical-writer-user",
      role: "writer",
      writer_project_id: "canonical-writer-project",
    },
  );
  assert.equal(mutationRequests[1].init.method, "DELETE");
  assert.equal(deleteBody.reason, "writer_deleted");
  assert.equal(deleteBody.writer_project_id, "canonical-writer-project");
  assert.deepEqual(
    { ...downloadBody },
    { user_id: "canonical-writer-user", role: "writer" },
  );
});

test("malformed successful attachment responses fail closed as 502", async () => {
  let requestCount = 0;
  const messageData = loadWriterMessageData(async () => {
    requestCount += 1;
    if (requestCount === 1) return writerThreadDetailResponse();
    return Response.json({}, { status: 201 });
  });

  await assert.rejects(
    messageData.createWriterAttachmentUploadIntent({
      contentType: "application/pdf",
      consentVersion: "manuscript-share-v1",
      filename: "Novel.pdf",
      routeProjectId: "browser-route-project",
      sizeBytes: 2048,
      threadId: "thread-1",
    }),
    (error) => error?.status === 502,
  );
});

test("pagination merging preserves attachment-bearing messages", () => {
  const conversation = compileTypeScriptModule(
    "app/components/messages/conversation-items.ts",
  );
  const attachment = attachmentUtils.normalizeMessageAttachment({
    attachment_id: "attachment-1",
    thread_id: "thread-1",
    message_id: "message-1",
    filename: "Novel.pdf",
    content_type: "application/pdf",
    size_bytes: 2048,
    status: "attached",
    created_at: "2026-07-21T16:00:00+00:00",
    deleted_at: null,
  });
  const message = (messageId, attachments = []) => ({
    messageId,
    threadId: "thread-1",
    senderUserId: "writer-1",
    senderRole: "writer",
    body: "",
    createdAt: "2026-07-21T16:00:00+00:00",
    attachments,
  });
  const merged = conversation.mergeMessagePages(
    [message("message-1", [attachment]), message("message-2")],
    [message("message-2"), message("message-3")],
  );

  assert.deepEqual(
    Array.from(merged, (item) => item.messageId),
    ["message-1", "message-2", "message-3"],
  );
  assert.equal(merged[0].attachments[0].attachmentId, "attachment-1");
});

test("download and upload URLs require HTTPS and the configured Supabase host", () => {
  const urlUtils = compileTypeScriptModule(
    "app/utils/manuscript-attachment-urls.server.ts",
    {
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: "https://unrelated-frontend.supabase.co",
        SUPABASE_DIRECT_STORAGE_URL: "project-ref.storage.supabase.co",
        SUPABASE_URL: "https://project-ref.supabase.co",
      },
      requireModule(specifier) {
        if (specifier === "server-only") return {};
        return require(specifier);
      },
    },
  );

  assert.ok(
    urlUtils.getValidatedSupabaseStorageUrl(
      "https://project-ref.supabase.co/storage/v1/object/sign/manuscripts/file?token=secret",
    ),
  );
  assert.ok(
    urlUtils.getValidatedSupabaseStorageUrl(
      "https://project-ref.storage.supabase.co/storage/v1/upload/resumable",
      "/storage/v1/upload/resumable",
    ),
  );
  assert.equal(
    urlUtils.getValidatedSupabaseStorageUrl(
      "http://project-ref.supabase.co/storage/v1/object/sign/file",
    ),
    null,
  );
  assert.equal(
    urlUtils.getValidatedSupabaseStorageUrl(
      "https://project-ref.supabase.co.evil.test/storage/v1/object/sign/file",
    ),
    null,
  );
  assert.equal(
    urlUtils.getValidatedSupabaseStorageUrl(
      "https://unrelated-frontend.supabase.co/storage/v1/object/sign/file",
    ),
    null,
  );
  assert.equal(
    urlUtils.getValidatedSupabaseStorageUrl(
      "https://project-ref.supabase.co:8443/storage/v1/object/sign/file",
    ),
    null,
  );
  assert.equal(
    urlUtils.getValidatedSupabaseStorageUrl(
      "https://user:password@project-ref.supabase.co/storage/v1/object/sign/file",
    ),
    null,
  );
});

class WriterMessageApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const nextServerStub = {
  NextResponse: {
    json(body, init) {
      return Response.json(body, init);
    },
  },
};

function loadWriterMessageRoute(sendWriterThreadReply) {
  return compileTypeScriptModule(
    "app/api/message-threads/[threadId]/messages/route.ts",
    {
      requireModule(specifier) {
        if (specifier === "next/server") return nextServerStub;
        if (specifier === "@/app/utils/message-thread-data") {
          return {
            WriterMessageApiError,
            getWriterThreadMessagesData: async () => null,
            sendWriterThreadReply,
          };
        }
        return require(specifier);
      },
    },
  );
}

test("writer reply route accepts attachment-only and legacy body-only requests", async () => {
  const captured = [];
  const route = loadWriterMessageRoute(async (input) => {
    captured.push(input);
    return { status: "success" };
  });

  const attachmentOnly = await route.POST(
    new Request("https://app.example.test/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "project-1",
        body: "",
        attachmentIds: ["attachment-1"],
      }),
    }),
    { params: Promise.resolve({ threadId: "thread-1" }) },
  );
  const bodyOnly = await route.POST(
    new Request("https://app.example.test/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: "project-1", body: "Hello" }),
    }),
    { params: Promise.resolve({ threadId: "thread-1" }) },
  );

  assert.equal(attachmentOnly.status, 200);
  assert.equal(bodyOnly.status, 200);
  assert.deepEqual(Array.from(captured[0].attachmentIds), ["attachment-1"]);
  assert.deepEqual(Array.from(captured[1].attachmentIds), []);
});

test("writer reply route rejects malformed attachment IDs and an empty message", async () => {
  const route = loadWriterMessageRoute(async () => ({ status: "success" }));
  const post = (body) =>
    route.POST(
      new Request("https://app.example.test/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ threadId: "thread-1" }) },
    );

  assert.equal(
    (await post({ projectId: "project-1", body: "", attachmentIds: "bad" }))
      .status,
    400,
  );
  assert.equal(
    (
      await post({
        projectId: "project-1",
        body: "",
        attachmentIds: ["one", "two"],
      })
    ).status,
    400,
  );
  assert.equal(
    (await post({ projectId: "project-1", body: "" })).status,
    400,
  );
});

test("upload intent route emits no-store and forwards the canonical browser contract", async () => {
  let capturedInput;
  const attachmentRouteUtils = compileTypeScriptModule(
    "app/api/message-threads/_attachment-route-utils.ts",
    {
      requireModule(specifier) {
        if (specifier === "next/server") return nextServerStub;
        if (specifier === "@/app/utils/message-thread-data") {
          return { AgentMessageApiError: class {}, WriterMessageApiError };
        }
        return require(specifier);
      },
    },
  );
  const route = compileTypeScriptModule(
    "app/api/message-threads/[threadId]/attachments/upload-intents/route.ts",
    {
      requireModule(specifier) {
        if (specifier === "next/server") return nextServerStub;
        if (specifier === "@/app/api/message-threads/_attachment-route-utils") {
          return attachmentRouteUtils;
        }
        if (specifier === "@/app/utils/manuscript-attachments") {
          return attachmentUtils;
        }
        if (specifier === "@/app/utils/manuscript-attachment-urls.server") {
          return {
            isManuscriptAttachmentsEnabled: () => true,
            getValidatedSupabaseStorageUrl: (value) => new URL(value),
          };
        }
        if (specifier === "@/app/utils/message-thread-data") {
          return {
            WriterMessageApiError,
            createWriterAttachmentUploadIntent: async (input) => {
              capturedInput = input;
              return {
                status: "success",
                attachment: {
                  attachmentId: "attachment-1",
                  threadId: "thread-1",
                  messageId: null,
                  filename: "Novel.pdf",
                  contentType: "application/pdf",
                  sizeBytes: 2048,
                  status: "pending_upload",
                  createdAt: "2026-07-21T16:00:00+00:00",
                  deletedAt: null,
                },
                upload: {
                  bucket: "manuscripts",
                  objectPath: "threads/thread-1/attachment-1.pdf",
                  resumableEndpoint:
                    "https://project-ref.storage.supabase.co/storage/v1/upload/resumable",
                  token: "signed-token",
                  expiresAt: "2026-07-21T16:30:00+00:00",
                  chunkSizeBytes: 6_291_456,
                },
              };
            },
          };
        }
        return require(specifier);
      },
    },
  );

  const response = await route.POST(
    new Request("https://app.example.test/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "project-1",
        filename: "Novel.pdf",
        contentType: "application/pdf",
        sizeBytes: 2048,
        consentVersion: attachmentUtils.MANUSCRIPT_CONSENT_VERSION,
      }),
    }),
    { params: Promise.resolve({ threadId: "thread-1" }) },
  );

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(capturedInput.contentType, "application/pdf");
  assert.equal(capturedInput.consentVersion, "manuscript-share-v1");
  assert.equal("file" in capturedInput, false);
});
