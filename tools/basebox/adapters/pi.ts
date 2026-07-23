import type { ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { Type } from "typebox"
import { StringEnum } from "@earendil-works/pi-ai"
import { execSync } from "node:child_process"
import { join } from "node:path"

const DEVKIT = join(process.env.HOME!, ".moureau")
const executable = join(DEVKIT, "tools/basebox/tool.ts")

function execute(args: Record<string, unknown>): string {
  const input = JSON.stringify(args)
  return execSync(`echo '${input}' | bun run "${executable}"`, { encoding: "utf8" }).trim()
}

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "basebox",
    label: "Basebox",
    description: "Manage Basebox resources — organizations, projects, profiles, API keys, deployments, payments, file storage, and auth sessions.",
    promptSnippet: "Manage Basebox resources — organizations, projects, profiles, API keys, deployments, file storage, and auth sessions",
    promptGuidelines: [
      "Use basebox to manage Basebox resources instead of making raw HTTP requests.",
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
      const result = execute(params as unknown as Record<string, unknown>)
      return {
        content: [{ type: "text", text: result }],
        details: {},
      }
    },
  })
}
