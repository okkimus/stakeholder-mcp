import { PersonaManager } from "../personas/manager";
import { LLMClient, buildContextString } from "../llm/client";
import type { ConsultationResponse, ConsultationContext } from "../llm/types";
import type { Stakeholder } from "../personas/types";
import type { ConsultationDatabase, ConsultationLog } from "../db/database";

/** Max length of each past response included in conversation history (to avoid token explosion) */
const CONVERSATION_HISTORY_RESPONSE_MAX_LENGTH = 2000;

/**
 * Build a "previous conversation" string from consultation logs (chronological order).
 */
function buildConversationHistoryString(logs: ConsultationLog[]): string {
  if (logs.length === 0) return "";
  const lines = logs.map((log) => {
    const response =
      log.response.length > CONVERSATION_HISTORY_RESPONSE_MAX_LENGTH
        ? log.response.slice(0, CONVERSATION_HISTORY_RESPONSE_MAX_LENGTH) + "..."
        : log.response;
    return `User: ${log.prompt}\n\n${log.stakeholder_name}: ${response}`;
  });
  return `\n\n## Previous conversation in this session\n\n${lines.join("\n\n---\n\n")}`;
}

/**
 * Consult a single stakeholder.
 * When context.sessionId is set and the consultation DB is available, prior consultations
 * with this stakeholder in the same session are injected so the stakeholder can "remember" the discussion.
 */
export async function consultStakeholder(
  manager: PersonaManager,
  llmClient: LLMClient,
  params: {
    id: string;
    prompt: string;
    context?: ConsultationContext;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  },
  db?: ConsultationDatabase
): Promise<ConsultationResponse> {
  const stakeholder = manager.get(params.id);

  if (!stakeholder) {
    throw new Error(`Stakeholder with ID "${params.id}" not found`);
  }

  // Build the system prompt from the persona
  const systemPrompt = manager.buildSystemPrompt(stakeholder);

  // Build the user prompt with context
  let contextString = buildContextString(params.context);

  // Inject prior conversation in this session so the stakeholder "remembers" the discussion
  if (db && params.context?.sessionId) {
    const priorLogs = db.getConsultations({
      sessionId: params.context.sessionId,
      stakeholderId: params.id,
      limit: 15,
    });
    const chronological = [...priorLogs].reverse();
    const historySection = buildConversationHistoryString(chronological);
    if (historySection) contextString += historySection;
  }

  const userPrompt = params.prompt + contextString;

  // Determine model (params override > stakeholder default > client default)
  const model = params.model ?? stakeholder.model;

  // Generate response
  const response = await llmClient.generate({
    systemPrompt,
    userPrompt,
    model,
    temperature: params.temperature,
    maxTokens: params.maxTokens,
  });

  const consultation: ConsultationResponse = {
    stakeholderId: stakeholder.id,
    stakeholderName: stakeholder.name,
    stakeholderRole: stakeholder.role,
    content: response.content,
    model: response.model,
    usage: response.usage,
    timestamp: new Date().toISOString(),
  };

  // Log to database if available
  if (db) {
    try {
      db.logConsultation(params.prompt, consultation, params.context);
    } catch (error) {
      // Don't fail the consultation if logging fails
      const { logger } = await import("../utils/logger");
      logger.warn("Failed to log consultation to database", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return consultation;
}

/**
 * Consult multiple stakeholders
 */
export async function consultGroup(
  manager: PersonaManager,
  llmClient: LLMClient,
  params: {
    ids: string[];
    prompt: string;
    context?: ConsultationContext;
    mode: "parallel" | "sequential";
    model?: string;
    temperature?: number;
    maxTokens?: number;
  },
  db?: ConsultationDatabase
): Promise<{
  responses: ConsultationResponse[];
  errors: Array<{ id: string; error: string }>;
}> {
  const { ids, mode, ...consultParams } = params;

  // Validate all stakeholders exist first
  const stakeholders: Stakeholder[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const id of ids) {
    const stakeholder = manager.get(id);
    if (!stakeholder) {
      errors.push({ id, error: `Stakeholder with ID "${id}" not found` });
    } else {
      stakeholders.push(stakeholder);
    }
  }

  if (stakeholders.length === 0) {
    return { responses: [], errors };
  }

  const responses: ConsultationResponse[] = [];

  if (mode === "parallel") {
    // Execute all consultations in parallel
    const results = await Promise.allSettled(
      stakeholders.map((stakeholder) =>
        consultStakeholder(manager, llmClient, {
          ...consultParams,
          id: stakeholder.id,
        }, db)
      )
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i]!;
      const stakeholder = stakeholders[i]!;

      if (result.status === "fulfilled") {
        responses.push(result.value);
      } else {
        errors.push({
          id: stakeholder.id,
          error: (result as PromiseRejectedResult).reason?.message ?? "Unknown error",
        });
      }
    }
  } else {
    // Execute sequentially, accumulating previous feedback
    const updatedContext: ConsultationContext = { ...consultParams.context };

    for (const stakeholder of stakeholders) {
      try {
        const response = await consultStakeholder(manager, llmClient, {
          ...consultParams,
          id: stakeholder.id,
          context: updatedContext,
        }, db);

        responses.push(response);

        // Add this response to context for next stakeholder
        if (!updatedContext.previousFeedback) {
          updatedContext.previousFeedback = [];
        }
        updatedContext.previousFeedback.push({
          stakeholderId: response.stakeholderId,
          summary: response.content.slice(0, 500), // Truncate for context
        });
      } catch (error) {
        errors.push({
          id: stakeholder.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  return { responses, errors };
}
