#!/usr/bin/env bun

import { organization } from "./resources/organization"
import { project } from "./resources/project"
import { deployment } from "./resources/deployment"
import { apikey } from "./resources/apikey"
import { file } from "./resources/file"

const input = JSON.parse(await Bun.stdin.text())

const resources = {
  organization,
  project,
  deployment,
  apikey,
  file,
}

const handler = resources[input.resource as keyof typeof resources]

if (!handler) {
  throw new Error(`Unknown resource: ${input.resource}`)
}

const result = await handler(input.operation, input)

console.log(JSON.stringify(result, null, 2))
