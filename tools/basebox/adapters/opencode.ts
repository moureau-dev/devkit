import { tool } from "@opencode-ai/plugin"
import { execSync } from "child_process"
import { join } from "path"

const DEVKIT = join(process.env.HOME!, ".moureau")
const executable = join(DEVKIT, "tools/basebox/tool.ts")

export default tool({
  description: "Manage Basebox resources — organizations, projects, profiles, API keys, deployments, payments, file storage, and auth sessions.",
  args: {
    resource: tool.schema
      .enum(["organization", "project", "deployment", "apikey", "file", "profile", "auth"] as const)
      .describe("Resource type to manage"),
    operation: tool.schema
      .string()
      .describe("Operation to perform on the resource"),
  },
  async execute(args) {
    const input = JSON.stringify(args)
    const result = execSync(`echo '${input}' | bun run "${executable}"`, { encoding: "utf8" }).trim()
    return {
      output: result,
      title: `basebox ${args.resource} ${args.operation}`,
    }
  },
})
