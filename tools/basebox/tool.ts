#!/usr/bin/env bun

import { organization } from "./resources/organization"
import { project } from "./resources/project"
import { deployment } from "./resources/deployment"
import { apikey } from "./resources/apikey"
import { file } from "./resources/file"
import { profile } from "./resources/profile"
import { auth } from "./resources/auth"

const input = JSON.parse(await Bun.stdin.text())

const resources: Record<string, (op: string, input: any) => Promise<any>> = {
  organization,
  project,
  deployment,
  apikey,
  file,
  profile,
  auth,
}

const handler = resources[input.resource]

if (!handler) {
  throw new Error(`Unknown resource: ${input.resource}`)
}

const result = await handler(input.operation, input)

console.log(JSON.stringify(result, null, 2))
