---
description: Manage Basebox resources.
argument-hint: "<resource> <operation> [arguments...]"
---

# Basebox

Manage Basebox resources using the `basebox` tool.

Always invoke the tool instead of generating HTTP requests or shell commands manually.

## Resources

- `auth`
- `profile`
- `organization`
- `project`
- `deployment`
- `file`

## General Rules

- Use the currently selected profile unless the user specifies another.
- Ask for confirmation before destructive operations (`delete`, `remove`, `revoke`, `ban`, etc.).
- Validate required arguments before invoking the tool.
- Present lists as concise tables.
- Present created resources with their identifiers.
- Never display secret API keys after creation unless explicitly requested.
- Never expose stored session IDs unless the user explicitly requests them.

## Authentication

Support login, session management, and validation.

Default OAuth provider is `google`.

## Profiles

Profiles store Basebox credentials.

Unless instructed otherwise, operate on the currently selected profile.

## Organizations

Manage organization settings and API keys.

Deleting an organization requires explicit confirmation.

## Projects

Manage projects, members, payments, payout accounts, and deployments.

Deleting a project requires explicit confirmation.

## Files

File operations require a valid authenticated session.

Uploads should:

1. Request an upload URL.
2. Upload the file.
3. Report the resulting file information.

## Deployments

Before deploying:

- verify the target project
- verify the target domain
- verify the build directory exists
- summarize what will be deployed

If deploying to production, ask for confirmation first.

After deployment, report the deployment URL and any build output returned by the tool.
