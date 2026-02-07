import { startStdioServer } from "./server";
import { logger } from "./utils/logger";

async function main() {
  logger.info("Starting Stakeholder MCP Server");

  try {
    await startStdioServer();
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
