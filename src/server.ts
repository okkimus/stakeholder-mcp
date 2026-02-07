import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PersonaManager } from "./personas/manager";
import { LLMClient } from "./llm/client";
import { ConsultationDatabase } from "./db/database";
import { registerTools } from "./tools";
import { logger } from "./utils/logger";

export interface ServerConfig {
  name?: string;
  version?: string;
  configPath?: string;
  dbPath?: string;
}

/**
 * Create and configure the MCP server
 */
export function createServer(config: ServerConfig = {}): {
  server: McpServer;
  manager: PersonaManager;
  llmClient: LLMClient;
  db: ConsultationDatabase;
} {
  const name = config.name ?? "stakeholder-mcp";
  const version = config.version ?? "1.0.0";

  // Initialize persona manager
  const manager = new PersonaManager(config.configPath);

  // Initialize LLM client
  const llmClient = new LLMClient();

  // Initialize consultation database
  const db = new ConsultationDatabase(config.dbPath);

  // Create MCP server
  const server = new McpServer({
    name,
    version,
  });

  // Register all tools (with database for logging)
  registerTools(server, manager, llmClient, db);

  logger.info("MCP server created", {
    name,
    version,
    stakeholderCount: manager.getAll().length,
  });

  return { server, manager, llmClient, db };
}

/**
 * Start the server with stdio transport
 */
export async function startStdioServer(config: ServerConfig = {}): Promise<void> {
  const { server } = createServer(config);
  const transport = new StdioServerTransport();

  logger.info("Starting stdio transport");

  await server.connect(transport);

  logger.info("Server connected via stdio");
}
