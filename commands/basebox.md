---
description: Manage Basebox resources — profiles, auth, files, deploy
argument-hint: "<resource> <operation> [--key value...]"
---

# Basebox CLI

Interact with Basebox resources via the devkit tool at `tools/basebox/tool.ts`. The tool accepts JSON via stdin with `resource`, `operation`, and parameters.

## auth

### `/basebox auth login [provider]`

Generate an OAuth sign-in URL. Default provider is `google`. Also supports `github`, `discord`.

```
echo '{"resource":"auth","operation":"login","provider":"google"}' | bun run tools/basebox/tool.ts
```

### `/basebox auth set-session --session-id <id>`

Store and validate a session ID obtained from the browser.

```
echo '{"resource":"auth","operation":"set-session","session_id":"sess:xxx"}' | bun run tools/basebox/tool.ts
```

### `/basebox auth check`

Check if the stored session is still valid.

### `/basebox auth clear-session`

Remove the stored session.

### `/basebox auth get-session`

Show the raw session ID.

## profile

### `/basebox profile list`

List all saved credential profiles.

### `/basebox profile add --name <name> --public-key <key> --secret-key <key>`

Add a new profile. `organization_id` and `project_id` are decoded from the public key automatically.

```
echo '{"resource":"profile","operation":"add","name":"prod","public_key":"bb_anon_...","secret_key":"bb_secret_..."}' | bun run tools/basebox/tool.ts
```

### `/basebox profile remove --name <name>`

Delete a profile.

### `/basebox profile select [name]`

Select a profile. If no name given, selects the first available.

### `/basebox profile current`

Show the currently selected profile.

## organization

### `/basebox organization get`

Get organization details.

### `/basebox organization update --name <name> [--slug <slug>] [--platform-fees {...}] [--payout-fees-bps {...}]`

Update organization settings.

### `/basebox organization delete`

Delete the organization.

### `/basebox organization create-api-key --name <name> [--level <level>] [--expiration <iso>] [--project-id <id>]`

Create a new API key.

### `/basebox organization list-keys`

List all API keys.

### `/basebox organization revoke-key --key-id <id>`

Revoke an API key.

## project

### `/basebox project list`

List all projects.

### `/basebox project get --project <id>`

Get project details.

### `/basebox project create --name <name> [--slug <slug>]`

Create a new project.

### `/basebox project update --project <id> [--name <name>] [--slug <slug>]`

Update a project.

### `/basebox project delete --project <id>`

Delete a project.

### `/basebox project list-profiles --project <id>`

List user profiles in a project.

### `/basebox project list-payments --project <id>`

List payments in a project.

### `/basebox project create-payment --project <id> --profile-id <id> --amount-cents <cents>`

Create a PIX payment for a user.

### `/basebox project set-payout-account --project <id> --currency <BRL|EUR|USD> --destination-type <pix|iban> --destination <value> [--pix-key-type <type>]`

Set a payout account for a project.

## file

Requires a valid session (see `auth`).

### `/basebox file list-own`

List the current user's files.

### `/basebox file upload --filename <name> --content-type <mime> --path <local-path>`

Upload a local file. Gets a presigned URL then PUTs the file bytes.

```bash
# Step 1: Get presigned URL
UPLOAD=$(echo '{"resource":"file","operation":"upload-url","filename":"<name>","content_type":"<mime>","size":<bytes>}' | bun run tools/basebox/tool.ts)
URL=$(echo "$UPLOAD" | bun -e "console.log(JSON.parse(await Bun.stdin.text()).uploadUrl)")

# Step 2: PUT file bytes
curl -X PUT "$URL" --data-binary "@<local-path>"
```

### `/basebox file delete-own --file-id <id>`

Delete one of the current user's files.

## deployment

### `/basebox deploy --domain <domain> --dist <path>`

Deploy a static site to Basebox.

```
echo '{"resource":"deployment","operation":"deploy","domain":"example.com","dist":"./dist"}' | bun run tools/basebox/tool.ts
```
