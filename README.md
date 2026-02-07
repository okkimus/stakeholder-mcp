# Stakeholder MCP Server

An MCP (Model Context Protocol) server that exposes stakeholder personas as tools for iterative product feedback. Each stakeholder represents a distinct role with a unique personality, expertise, and concerns.

> **Cost-sensitive?** The server uses a high default token limit so models can reason about requirements and implementation. To control cost, set **`STAKEHOLDER_MCP_MAX_TOKENS`** (see [Configuration](#configuration)).

> **Disclaimer** — This project was fully AI-generated with Cursor. There is no warranty or liability; use it at your own responsibility.

## Features

- **7 Pre-configured Stakeholders**: Tech Lead, Product Manager, UX Designer, Security Engineer, DevOps Engineer, and two End User personas
- **Runtime Persona Management**: Create, update, and delete stakeholders at runtime
- **Multi-Provider LLM Support**: Uses OpenRouter for access to 100+ models (GPT-4, Claude, Gemini, Llama, etc.)
- **Flexible Consultation**: Query stakeholders individually or in groups (parallel or sequential mode)
- **Multiple Transports**: stdio (default) and HTTP/SSE support

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your OpenRouter API key
```

Get an OpenRouter API key at: https://openrouter.ai/keys

### 3. Run the Server

```bash
bun start
```

The server uses stdio transport, which is the standard for MCP clients like Claude Desktop.

## MCP Tools

| Tool | Description |
|------|-------------|
| `list_stakeholders` | List all available personas with optional filtering |
| `get_stakeholder` | Get detailed info about a specific stakeholder |
| `consult_stakeholder` | Query a stakeholder for feedback |
| `consult_group` | Query multiple stakeholders (parallel or sequential) |
| `create_stakeholder` | Create a new runtime stakeholder |
| `update_stakeholder` | Update an existing stakeholder |
| `delete_stakeholder` | Delete a runtime stakeholder |

## Usage Examples

### Example Prompts for AI Models

When using the MCP with Claude, Cursor, or another AI assistant, you can prompt the model to use the stakeholder tools. The model will then call the MCP (e.g. `list_stakeholders`, `consult_stakeholder`, `consult_group`) on your behalf.

**Full example: language learning app**

The [examples/full-example-language-app/](examples/full-example-language-app/) directory contains a full run of the MCP in action: an AI agent (in Cursor) acts as a product manager, consults multiple stakeholders (end users, tech lead, UX designer) to refine gamified vocabulary features for a language app, records the conversations, and produces PDRs (Prompt Requirements Documents). Useful to see the end-to-end workflow and the kind of outputs you can get from a single prompt.

**Planning a new feature**

- *"I'm planning to add a dark mode toggle to our app. Consult the relevant stakeholders (UX, product, maybe tech) and summarize their feedback before we lock the design."*
- *"We're considering moving our auth from email/password to OAuth-only. Get feedback from the security engineer, product manager, and one end-user persona, then give me a recommendation."*

**Reviewing a design or spec**

- *"I've drafted a spec for the new checkout flow (see below). Run it by the product manager, UX designer, and the senior end-user persona. Use sequential mode so each can see the previous feedback."*
- *"Review this API design with the tech lead and DevOps engineer. Ask them about scalability and deployment concerns."*

**Before implementing**

- *"Before I implement this feature, list stakeholders whose expertise is relevant to [security / UX / infra], then consult them on [specific question]."*
- *"I want to ship a beta of our mobile app. Consult the product manager and both end-user personas on what we should include in the first release."*

**Custom stakeholders**

- *"We need accessibility input. Create a stakeholder who's an accessibility consultant, then ask them to review our button and form design."*

---

### List Stakeholders (tool call)

```json
{
  "tool": "list_stakeholders",
  "arguments": {
    "filter": {
      "expertise": "security"
    }
  }
}
```

### Consult a Stakeholder (tool call)

```json
{
  "tool": "consult_stakeholder",
  "arguments": {
    "id": "tech-lead",
    "prompt": "What do you think about using microservices for a simple blog?",
    "context": {
      "projectDescription": "A personal blog with ~1000 monthly visitors"
    }
  }
}
```

**Stakeholders remember the discussion (session memory)**  
If your agent asks a question and then a follow-up, the stakeholder does not see the first message unless you pass a **session ID**. Set `context.sessionId` to a stable value for the conversation (e.g. a task id or thread id). The server will load prior consultations for that session from the database and inject them into the prompt, so the stakeholder sees the previous Q&A and can answer follow-ups in context. Use the same `sessionId` for the initial question and all follow-ups with that stakeholder.

### Consult Multiple Stakeholders (tool call)

```json
{
  "tool": "consult_group",
  "arguments": {
    "ids": ["tech-lead", "product-manager", "ux-designer"],
    "prompt": "Review this feature proposal for user authentication",
    "mode": "sequential",
    "context": {
      "artifacts": [{
        "type": "spec",
        "content": "Users should be able to sign in with email/password or OAuth..."
      }]
    }
  }
}
```

### Create a Custom Stakeholder (tool call)

```json
{
  "tool": "create_stakeholder",
  "arguments": {
    "stakeholder": {
      "id": "accessibility-expert",
      "name": "Sam",
      "role": "Accessibility Consultant",
      "personality": {
        "traits": ["detail-oriented", "empathetic", "standards-focused"],
        "communication_style": "educational and supportive"
      },
      "expertise": ["WCAG compliance", "screen readers", "keyboard navigation"],
      "concerns": ["inclusive design", "legal compliance", "user independence"]
    }
  }
}
```

## Default Stakeholders

| ID | Name | Role |
|----|------|------|
| `tech-lead` | Alex Chen | Technical Lead |
| `product-manager` | Sarah Miller | Product Manager |
| `ux-designer` | Marcus Rivera | UX Designer |
| `security-engineer` | Priya Sharma | Security Engineer |
| `devops-engineer` | Kenji Tanaka | DevOps Engineer |
| `end-user-millennial` | Jordan | End User (28, urban professional) |
| `end-user-senior` | Margaret | End User (67, retired teacher) |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | (required for LLM calls) |
| `DEFAULT_MODEL` | Default LLM model | `anthropic/claude-3-haiku` |
| `STAKEHOLDER_MCP_MAX_TOKENS` | Max tokens per consultation response; lower to reduce cost | `8192` |
| `DB_PATH` | SQLite path for consultation logs | `data/consultations.db` |
| `STAKEHOLDER_MCP_CONFIG_PATH` | Path to stakeholders YAML (project-specific config) | (see [Project-specific config](#project-specific-configuration)) |
| `STAKEHOLDER_MCP_DB_PATH` | Override DB path (e.g. per-project consultation logs) | same as `DB_PATH` default |
| `STAKEHOLDER_MCP_RUNTIME_STORE_PATH` | Path for runtime stakeholders JSON (per-project) | derived from DB path |
| `STAKEHOLDER_MCP_API_KEY` | API key for HTTP auth | (optional) |
| `LOG_LEVEL` | Logging level | `info` |

### Controlling token usage (max tokens)

Consultations call the LLM with a **default maximum of 8192 tokens** per response so stakeholders can give detailed, thoughtful feedback. You can override this in two ways:

1. **Environment variable** — Set `STAKEHOLDER_MCP_MAX_TOKENS` to the desired cap (e.g. `2048` or `1024`). The value is clamped to 128,000. Example in `.env`:
   ```bash
   STAKEHOLDER_MCP_MAX_TOKENS=2048
   ```
2. **Per-request** — The `consult_stakeholder` and `consult_group` tools accept an optional `maxTokens` argument; when provided, it overrides the default for that call only.

Runtime stakeholders (created via `create_stakeholder` or overrides from `update_stakeholder`) are persisted to a JSON file so they survive server restarts. By default the file is `data/runtime-stakeholders.json` (same directory as `DB_PATH`). You can override the path when creating the server via `runtimeStakeholdersPath` in `ServerConfig`.

### Customizing Stakeholders

Edit `config/stakeholders.yaml` to customize or add stakeholders:

```yaml
stakeholders:
  - id: "my-stakeholder"
    name: "Custom Name"
    role: "Custom Role"
    model: "openai/gpt-4-turbo"  # Optional: per-stakeholder model
    personality:
      traits: ["trait1", "trait2"]
      communication_style: "description of how they communicate"
    expertise:
      - "area 1"
      - "area 2"
    concerns:
      - "priority 1"
      - "priority 2"
```

### Project-specific configuration

You can use **different stakeholder personas per project** by pointing the MCP at a project-local config file. That way each repo gets its own set of stakeholders (e.g. domain experts, product roles) when you use the MCP from Cursor or another tool.

**Option 1: Convention (no env vars)**  
If the MCP server is started with the project as the current working directory (typical when using Cursor’s project-level MCP), it will look for a config file in this order:

1. `./.cursor/stakeholders.yaml` (project root)
2. `./config/stakeholders.yaml`
3. `./stakeholders.yaml`

So you can add **`.cursor/stakeholders.yaml`** in your project with project-specific personas; that file will be used automatically when the MCP runs in that project.

**Option 2: Explicit path via env**  
Set **`STAKEHOLDER_MCP_CONFIG_PATH`** in the MCP’s `env` to the path of your project’s config file. Relative paths are resolved from the process working directory (usually the project root when using Cursor’s project-level MCP).

**Example: project-level Cursor MCP**

1. In your project, create `.cursor/stakeholders.yaml` with the personas for that project (or put `stakeholders.yaml` in the project root).

2. In the same project, create **`.cursor/mcp.json`** so this project uses the stakeholder MCP with that config:

```json
{
  "mcpServers": {
    "stakeholder-mcp": {
      "command": "bun",
      "args": ["run", "/path/to/stakeholder-mcp/src/index.ts"],
      "env": {
        "OPENROUTER_API_KEY": "your-key-here",
        "STAKEHOLDER_MCP_CONFIG_PATH": ".cursor/stakeholders.yaml",
        "STAKEHOLDER_MCP_DB_PATH": ".cursor/data/consultations.db",
        "STAKEHOLDER_MCP_RUNTIME_STORE_PATH": ".cursor/data/runtime-stakeholders.json"
      }
    }
  }
}
```

Replace `/path/to/stakeholder-mcp` with the real path to the stakeholder-mcp repo. If you use the convention above, you can omit `STAKEHOLDER_MCP_CONFIG_PATH` and only set the paths if you want consultation logs and runtime stakeholders stored under `.cursor/data/` for this project.

**Generating a project config**  
Copy the format from `config/stakeholders.yaml` in this repo, or start from a minimal file:

```yaml
stakeholders:
  - id: "domain-expert"
    name: "Jamie"
    role: "Domain Expert"
    personality:
      traits: ["pragmatic", "user-focused"]
      communication_style: "clear and concise"
    expertise:
      - "your domain"
    concerns:
      - "accuracy"
      - "usability"
```

Then add or edit entries to match the roles and expertise that matter for the project.

## Setting up with MCP-compatible tools

### Claude Desktop

Add to your Claude Desktop MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "stakeholder-mcp": {
      "command": "bun",
      "args": ["run", "/path/to/stakeholder-mcp/src/index.ts"],
      "env": {
        "OPENROUTER_API_KEY": "your-key-here"
      }
    }
  }
}
```

### Cursor

Add the server to your MCP config. User-level: **Cursor Settings → MCP → Edit config** (or `~/.cursor/mcp.json`). Project-level: `.cursor/mcp.json` in the repo root.

```json
{
  "mcpServers": {
    "stakeholder-mcp": {
      "command": "bun",
      "args": ["run", "/path/to/stakeholder-mcp/src/index.ts"],
      "env": {
        "OPENROUTER_API_KEY": "your-key-here"
      }
    }
  }
}
```

Replace `/path/to/stakeholder-mcp` with the actual path to this project.

### Codex CLI

Codex CLI (and the Codex VSCode extension) use a **shared TOML config** at `~/.codex/config.toml`. MCP servers run as local subprocesses over STDIO.

1. **Create the config directory** (if it doesn’t exist):
   ```bash
   mkdir -p ~/.codex
   ```

2. **Add the stakeholder MCP** to `~/.codex/config.toml`:
   ```toml
   [mcp_servers.stakeholder_mcp]
   command = "bun"
   args = ["run", "/path/to/stakeholder-mcp/src/index.ts"]
   env = { "OPENROUTER_API_KEY" = "your-key-here" }
   ```
   Replace `/path/to/stakeholder-mcp` with the actual path to this repo (e.g. `/Users/you/repos/stakeholder-mcp`). Use an absolute path so it works from any working directory.

3. **Restart Codex** (CLI session or VSCode extension) so it reloads the config.

Then in Codex you can ask things like: *"List the stakeholders and consult the tech lead on using microservices for a simple blog."*

## Development

```bash
# Run with watch mode
bun dev

# Run tests
bun test

# Type check
bun typecheck

# Test client (basic functionality)
bun run examples/test-client.ts
```

## License

MIT
