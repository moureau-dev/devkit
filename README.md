# Moureau DevKit

The Moureau DevKit is a portable collection of AI capabilities for the Moureau ecosystem.

It provides:

- **Skills** — project rules and guidance.
- **Commands** — reusable AI workflows.
- **Tools** — executable capabilities for compatible AI clients.

The DevKit is installed and managed by the `moureau` CLI.

```bash
curl -fsSL https://moureau.dev/install.sh | bash
```

Once installed, it lives in:

```text
~/.moureau/
├── skills/
├── commands/
├── tools/
└── package.json
```

The CLI automatically integrates the DevKit with supported AI coding assistants (such as Claude Code, Codex, OpenCode, and Zed), using each client's native capabilities where available.
