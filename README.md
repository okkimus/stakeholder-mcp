# Stakeholder MCP Server

An MCP (Model Context Protocol) server that exposes stakeholder personas as tools for iterative product feedback. Each stakeholder represents a distinct role with a unique personality, expertise, and concerns.

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
| `STAKEHOLDER_MCP_API_KEY` | API key for HTTP auth | (optional) |
| `LOG_LEVEL` | Logging level | `info` |

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
