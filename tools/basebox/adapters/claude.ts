import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk"
import { z } from "zod"
import { execSync } from "child_process"
import { join } from "path"

const DEVKIT = join(process.env.HOME!, ".moureau")
const executable = join(DEVKIT, "tools/basebox/tool.ts")

const baseboxTool = tool(
  "basebox",
  "Manage Basebox resources — organizations, projects, profiles, API keys, deployments, payments, file storage, and auth sessions.",
  {
    resource: z
      .enum(["organization", "project", "deployment", "apikey", "file", "profile", "auth"])
      .describe("Resource type to manage"),
    operation: z.string().describe("Operation to perform on the resource"),
    project: z.string().optional().describe("Project ID"),
    profile_id: z.string().optional().describe("Profile ID"),
    file_id: z.string().optional().describe("File/asset ID"),
    key_id: z.string().optional().describe("API key ID"),
    payment_id: z.string().optional().describe("Payment ID"),
    name: z.string().optional().describe("Name for the resource"),
    slug: z.string().optional().describe("URL-friendly slug"),
    dist: z.string().optional().describe("Dist folder path to deploy"),
    domain: z.string().optional().describe("Domain to deploy to"),
    session_id: z.string().optional().describe("User session ID"),
  },
  (args) => {
    const input = JSON.stringify(args)
    const result = execSync(`echo '${input}' | bun run "${executable}"`, { encoding: "utf8" }).trim()
    return { content: [{ type: "text", text: result }] }
  },
)

export const baseboxServer = createSdkMcpServer({
  name: "basebox",
  version: "1.0.0",
  tools: [baseboxTool],
})
