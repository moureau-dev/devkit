import { tool } from "@opencode-ai/plugin"
import { runTool } from "../utils/runner"

export default tool({
  description: [
    "Manage Basebox resources. ONLY pass JSON via this tool. Never tell users to run CLI commands.",
    "",
    "AUTH FLOW:",
    "  1. Call resource='auth' operation='login' → returns a URL",
    "  2. Tell user: 'Open this URL, sign in with Google, and paste the session ID here'",
    "  3. WAIT for user to paste the session ID string (includes 'sess:' prefix)",
    "  4. Call resource='auth' operation='set-session' with session_id='sess:...'",
    "  5. Validate with resource='auth' operation='check'",
    "  IMPORTANT: Ask the user to PASTE THE SESSION ID, not to run a command.",
    "",
    "FILE UPLOAD FLOW (after auth):",
    "  1. Get file size with a stat command first",
    "  2. Call resource='file' operation='upload-url' with filename, content_type (MIME), and size (bytes)",
    "  3. The tool returns { asset: { publicUrl }, uploadUrl }",
    "  4. Upload bytes: curl -X PUT -T /path/to/file '<uploadUrl>'",
    "  5. Report the publicUrl to the user",
    "  IMPORTANT: There is NO 'upload' operation. Use 'upload-url'.",
    "",
    "Available resources: auth (login/set-session/check), file (upload-url/list/delete/storage), profile (current), project, deployment, organization, apikey.",
  ].join("\n"),
  args: {
    resource: tool.schema
      .enum(["organization", "project", "deployment", "apikey", "file", "profile", "auth"] as const)
      .describe("Resource type to manage"),
    operation: tool.schema
      .string()
      .describe("Operation to perform on the resource (e.g. login, set-session, upload-url, deploy)"),
    session_id: tool.schema
      .string()
      .optional()
      .describe("User session ID (includes sess: prefix). Required for auth set-session and file operations."),
    filename: tool.schema
      .string()
      .optional()
      .describe("Filename for file upload-url operation"),
    content_type: tool.schema
      .string()
      .optional()
      .describe("MIME type for file upload-url operation (e.g. text/plain, image/png)"),
    size: tool.schema
      .number()
      .optional()
      .describe("File size in bytes for file upload-url operation"),
    provider: tool.schema
      .enum(["google", "github", "discord"] as const)
      .optional()
      .describe("OAuth provider for auth login operation"),
    dist: tool.schema
      .string()
      .optional()
      .describe("Path to dist folder for deployment deploy operation"),
    domain: tool.schema
      .string()
      .optional()
      .describe("Domain for deployment deploy operation"),
    name: tool.schema
      .string()
      .optional()
      .describe("Name for project/API key creation"),
    slug: tool.schema
      .string()
      .optional()
      .describe("URL-friendly slug for project/organization"),
    project: tool.schema
      .string()
      .optional()
      .describe("Project ID for scoped operations"),
    profile_id: tool.schema
      .string()
      .optional()
      .describe("Profile (user) ID within a project"),
    file_id: tool.schema
      .string()
      .optional()
      .describe("File/asset ID for delete operations"),
    key_id: tool.schema
      .string()
      .optional()
      .describe("API key ID for revoke operations"),
    payment_id: tool.schema
      .string()
      .optional()
      .describe("Payment ID for payment operations"),
    public_key: tool.schema
      .string()
      .optional()
      .describe("Basebox public key (bb_anon_...)"),
    secret_key: tool.schema
      .string()
      .optional()
      .describe("Basebox secret key (bb_secret_...) for managed API operations"),
  },
  async execute(args) {
    const result = await runTool(args as unknown as Record<string, unknown>)

    // Try to parse JSON result for structured output
    try {
      const parsed = JSON.parse(result)
      return {
        output: result,
        title: `basebox ${args.resource} ${args.operation}`,
      }
    } catch {
      return {
        output: result,
        title: `basebox ${args.resource} ${args.operation}`,
      }
    }
  },
})
