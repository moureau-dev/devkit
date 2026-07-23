import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"
import { runTool } from "../utils/runner"

const baseboxTool = tool(
  "basebox",
  [
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
  {
    resource: z
      .enum(["organization", "project", "deployment", "apikey", "file", "profile", "auth"])
      .describe("Resource type to manage"),
    operation: z
      .string()
      .describe("Operation to perform (e.g. login, set-session, upload-url, deploy, list, get, create, delete)"),
    session_id: z
      .string()
      .optional()
      .describe("User session ID (includes sess: prefix). Required for auth set-session and file operations."),
    filename: z
      .string()
      .optional()
      .describe("Filename for file upload-url operation"),
    content_type: z
      .string()
      .optional()
      .describe("MIME type for file upload-url operation (e.g. text/plain, image/png)"),
    size: z
      .number()
      .optional()
      .describe("File size in bytes for file upload-url operation"),
    provider: z
      .enum(["google", "github", "discord"])
      .optional()
      .describe("OAuth provider for auth login operation"),
    dist: z
      .string()
      .optional()
      .describe("Path to dist folder for deployment deploy operation"),
    domain: z
      .string()
      .optional()
      .describe("Domain for deployment deploy operation"),
    name: z.string().optional().describe("Name for project/API key creation"),
    slug: z.string().optional().describe("URL-friendly slug for project/organization"),
    project: z.string().optional().describe("Project ID for scoped operations"),
    profile_id: z.string().optional().describe("Profile (user) ID within a project"),
    file_id: z.string().optional().describe("File/asset ID for delete operations"),
    key_id: z.string().optional().describe("API key ID for revoke operations"),
    payment_id: z.string().optional().describe("Payment ID for payment operations"),
    public_key: z.string().optional().describe("Basebox public key (bb_anon_...)"),
    secret_key: z.string().optional().describe("Basebox secret key (bb_secret_...)"),
  },
  async (args) => {
    const result = await runTool(args as unknown as Record<string, unknown>)
    return { content: [{ type: "text", text: result }] }
  },
)

export const baseboxServer = createSdkMcpServer({
  name: "basebox",
  version: "1.0.0",
  tools: [baseboxTool],
})
