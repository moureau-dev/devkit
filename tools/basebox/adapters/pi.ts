import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { Type } from "typebox"
import { StringEnum } from "@earendil-works/pi-ai"
import { runTool } from "../utils/runner"

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "basebox",
    label: "Basebox",
    description: [
      "Manage Basebox resources — organizations, projects, profiles, API keys, deployments, payments, file storage, and auth sessions.",
      "",
      "AUTH FLOW (user must sign in via browser):",
      "  1. Call resource='auth' operation='login' → returns a URL",
      "  2. Tell user to open that URL in a browser, sign in with Google, and copy the session ID (includes 'sess:' prefix)",
      "  3. WAIT for user to paste the session ID",
      "  4. Call resource='auth' operation='set-session' session_id='sess:...' to store it",
      "  5. Validate with resource='auth' operation='check'",
      "",
      "FILE UPLOAD FLOW:",
      "  1. First ensure auth is done (see AUTH FLOW above)",
      "  2. Call resource='file' operation='upload-url' with filename, content_type (MIME), and size (bytes)",
      "  3. Tool returns { asset: { publicUrl }, uploadUrl }",
      "  4. Upload bytes: curl -X PUT -T /path/to/file '<uploadUrl>'",
      "  5. Report the publicUrl",
    ].join('\n'),
    promptSnippet: "Manage Basebox resources — auth, file upload, deployments, etc.",
    promptGuidelines: [
      "Use basebox to manage Basebox resources instead of making raw HTTP requests.",
      "For file uploads: call auth login → user pastes session ID → auth set-session → file upload-url → curl PUT → report publicUrl.",
      "For auth: session_id includes the 'sess:' prefix — keep it.",
      "Always validate required arguments (resource and operation) before calling basebox.",
    ],
    parameters: Type.Object({
      resource: StringEnum(["organization", "project", "deployment", "apikey", "file", "profile", "auth"] as const),
      operation: Type.String({ description: "Operation to perform" }),
      name: Type.Optional(Type.String({ description: "Name for the resource" })),
      slug: Type.Optional(Type.String({ description: "URL-friendly slug" })),
      project: Type.Optional(Type.String({ description: "Project ID" })),
      profile_id: Type.Optional(Type.String({ description: "Profile ID" })),
      file_id: Type.Optional(Type.String({ description: "File/asset ID" })),
      key_id: Type.Optional(Type.String({ description: "API key ID" })),
      payment_id: Type.Optional(Type.String({ description: "Payment ID" })),
      level: Type.Optional(StringEnum(["organization", "project"] as const)),
      expiration: Type.Optional(Type.String({ description: "ISO 8601 expiration" })),
      dist: Type.Optional(Type.String({ description: "Dist folder path to deploy" })),
      domain: Type.Optional(Type.String({ description: "Domain to deploy to" })),
      organization_id: Type.Optional(Type.String()),
      project_id: Type.Optional(Type.String()),
      public_key: Type.Optional(Type.String({ description: "Basebox public key (bb_anon_...)" })),
      secret_key: Type.Optional(Type.String({ description: "Basebox secret key (bb_secret_...)" })),
      session_id: Type.Optional(Type.String({ description: "User session ID" })),
      provider: Type.Optional(StringEnum(["google", "github", "discord"] as const)),
      amount_cents: Type.Optional(Type.Number()),
      currency: Type.Optional(Type.String()),
      destination_type: Type.Optional(StringEnum(["pix", "iban"] as const)),
      destination: Type.Optional(Type.String()),
      pix_key_type: Type.Optional(StringEnum(["CPF", "CNPJ", "PHONE", "EMAIL", "RANDOM"] as const)),
      role: Type.Optional(StringEnum(["user", "admin", "superuser", "owner"] as const)),
      status: Type.Optional(Type.String()),
      search: Type.Optional(Type.String()),
      reason: Type.Optional(Type.String()),
      expires_at: Type.Optional(Type.String()),
      page: Type.Optional(Type.Number()),
      page_size: Type.Optional(Type.Number()),
      filename: Type.Optional(Type.String()),
      content_type: Type.Optional(Type.String()),
      size: Type.Optional(Type.Number()),
      type: Type.Optional(Type.String()),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const result = await runTool(params as unknown as Record<string, unknown>)
      return {
        content: [{ type: "text", text: result }],
        details: {},
      }
    },
  })
}
