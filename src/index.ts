import { resolve } from "node:path";
import { startStdioServer } from "./server";
import { logger } from "./utils/logger";

/** Build server config from environment (for project-specific MCP setup). */
function getServerConfigFromEnv(): {
  configPath?: string;
  dbPath?: string;
  runtimeStakeholdersPath?: string;
} {
  const cwd = process.cwd();
  const configPath = process.env.STAKEHOLDER_MCP_CONFIG_PATH;
  const dbPath =
    process.env.STAKEHOLDER_MCP_DB_PATH ?? process.env.DB_PATH;
  const runtimePath = process.env.STAKEHOLDER_MCP_RUNTIME_STORE_PATH;

  return {
    configPath: configPath
      ? configPath.startsWith("/")
        ? configPath
        : resolve(cwd, configPath)
      : undefined,
    dbPath: dbPath
      ? dbPath.startsWith("/")
        ? dbPath
        : resolve(cwd, dbPath)
      : undefined,
    runtimeStakeholdersPath: runtimePath
      ? runtimePath.startsWith("/")
        ? runtimePath
        : resolve(cwd, runtimePath)
      : undefined,
  };
}

async function main() {
  logger.info("Starting Stakeholder MCP Server");

  const envConfig = getServerConfigFromEnv();
  const config = {
    ...(envConfig.configPath && { configPath: envConfig.configPath }),
    ...(envConfig.dbPath && { dbPath: envConfig.dbPath }),
    ...(envConfig.runtimeStakeholdersPath && {
      runtimeStakeholdersPath: envConfig.runtimeStakeholdersPath,
    }),
  };

  try {
    await startStdioServer(Object.keys(config).length > 0 ? config : {});
  } catch (error) {
    logger.error("Failed to start server", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

main();

// Export for programmatic use
export { createServer, startStdioServer } from "./server";
export { PersonaManager, getPersonaManager } from "./personas";
export { LLMClient, getLLMClient } from "./llm";
export { ConsultationDatabase, getConsultationDatabase } from "./db";
export type { Stakeholder, StakeholderConfig, CreateStakeholderInput, UpdateStakeholderInput } from "./personas";
export type { ConsultationContext, ConsultationResponse } from "./llm";
export type { ConsultationLog, ConsultationLogFilter } from "./db";
