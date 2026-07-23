import { spawn } from "node:child_process"
import { join } from "node:path"
import { homedir } from "node:os"

const DEVKIT = join(homedir(), ".moureau")
const executable = join(DEVKIT, "tools/basebox/tool.ts")

/**
 * Run the basebox tool with the given args via stdin pipe.
 * Works cross-platform (macOS, Linux, Windows).
 *
 * Import this in your adapter instead of duplicating spawn logic.
 */
export function runTool(args: Record<string, unknown>): Promise<string> {
  return new Promise((resolve, reject) => {
    // check whether to use bun, node or deno to run the tool
    const command = (() => {
      if (typeof Bun !== "undefined") return "bun"
      if (typeof Deno !== "undefined") return "deno"
      if (process.env.NODE) return "node"
      return ""
    })()
    if (!command) reject(new Error("No JavaScript environment found."))

    const args = (() => {
      if (command === "bun") return ["run", executable]
      if (command === "deno") return ["run", "--allow-read", "--allow-write", executable]
      if (command === "node") return ["npx tsx", executable]
      return []
    })()
    if (!args.length) reject(new Error("No JavaScript environment found."))

    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    child.stderr!.on("data", (chunk: Buffer) => { stderr += chunk.toString() })
    child.stdout!.on("data", (chunk: Buffer) => { stdout += chunk.toString() })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(`exited with code ${code}`))
      else resolve(stdout.trim())
    })
    child.stdin!.write(JSON.stringify(args))
    child.stdin!.end()
  })
}
