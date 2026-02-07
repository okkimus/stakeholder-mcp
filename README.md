# Stakeholder MCP Server

An MCP (Model Context Protocol) server that exposes stakeholder personas as tools for iterative product feedback. Each stakeholder represents a distinct role with a unique personality, expertise, and concerns.

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

### List Stakeholders

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

### Consult a Stakeholder

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

### Consult Multiple Stakeholders

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

### Create a Custom Stakeholder

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

## Integration with Claude Desktop

Add to your Claude Desktop MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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
