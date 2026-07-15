# Basebox Tool

Manage Basebox resources from the Moureau DevKit.

## Purpose

This tool provides programmatic access to Basebox.

Supported resources include:

- Authentication
- Profiles
- Organizations
- Projects
- Deployments
- Files

The tool communicates via JSON on stdin and JSON on stdout.

## Invocation

The tool is executed according to `tool.json`.

Equivalent command:

```bash
echo '{"resource":"project","operation":"list"}' | bun run ./tool.ts
```

## Input

The input schema is defined in `tool.json`.

Example:

```json
{
  "resource": "project",
  "operation": "create",
  "name": "website"
}
```

## Output

Successful operations return JSON.

Example:

```json
{
  "success": true,
  "data": {
    ...
  }
}
```

Failures return a non-zero exit code and a descriptive error.

## Development

Run manually:

```bash
echo '{"resource":"project","operation":"list"}' | bun run ./tool.ts
```

## Design

This tool should:

- validate all inputs
- return structured JSON
- never print human-readable output to stdout
- use stderr for logs and diagnostics
- exit non-zero on failure
