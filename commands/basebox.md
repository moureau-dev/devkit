---
description: Manage Basebox resources.
argument-hint: "see resource operations below"
---

# Basebox

Manage Basebox resources using the basebox CLI.

## Invocation

Pipe JSON to `bun run ~/.moureau/tools/basebox/tool.ts`:

```bash
echo '{"resource":"<resource>","operation":"<op>","param1":"val1",...}' | bun run ~/.moureau/tools/basebox/tool.ts
```

**Read `~/.moureau/tools/basebox/tool.json` to see all available parameters for each operation.** The tool only requires `resource` and `operation` as mandatory — everything else is optional and depends on the operation.

Do NOT generate HTTP requests or shell commands manually — always invoke the tool.

## Standard Flows

### Authentication

1. Call `auth login` to get a sign-in URL (default provider: `google`).
2. User opens the URL in browser, signs in, and gets a session ID (includes the `sess:` prefix).
3. Call `auth set-session` with `session_id` (keep the `sess:` prefix).
4. Validate with `auth check`.

### File Upload

1. Ensure an authenticated session is stored (see Authentication flow).
2. Call `file upload-url` with `filename`, `content_type`, and `size` (in bytes).
3. It returns `uploadUrl` (presigned S3 URL) and `publicUrl`.
4. Upload the file: `curl -X PUT -T <path> "<uploadUrl>"`
5. Report the `publicUrl`.

### Deployment

Before deploying:

1. Verify the target project exists.
2. Verify the target domain.
3. Verify the build directory exists.
4. Summarize what will be deployed.
5. If deploying to production, ask for confirmation first.

Then call `deployment deploy` with `dist` and `domain`.

After deployment, report the deployment URL and any build output returned.

## Resources & Operations

| Resource | Operations |
|----------|-----------|
| `auth` | `login`, `set-session`, `check`, `clear-session`, `get-session` |
| `profile` | `current`, `get`, `list`, `ban-profile`, `unban-profile`, `update-role`, `delete-profile` |
| `project` | `list`, `get`, `create`, `update`, `delete`, `add` member, `remove` member, `list-payments`, `get-payment`, `payment-summary`, `create-payment`, `list-payout-accounts`, `set-payout-account`, `delete-payout-account` |
| `deployment` | `deploy`, `list`, `get` |
| `file` | `upload-url`, `list`, `list-own`, `delete`, `delete-own`, `storage` |
| `organization` | `get`, `update`, `create-api-key`, `list-keys`, `revoke-key` |
| `apikey` | `create`, `list`, `revoke` |

## General Rules

- Use the currently selected profile unless the user specifies another.
- Ask for confirmation before destructive operations (`delete`, `remove`, `revoke`, `ban`, etc.).
- Validate required arguments before invoking the tool.
- Present lists as concise tables.
- Present created resources with their identifiers.
- Never display secret API keys after creation unless explicitly requested.
- Never expose stored session IDs unless the user explicitly requests them.
