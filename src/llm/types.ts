import { z } from "zod";

/**
 * One turn in a conversation (user or assistant).
 * Used to send prior session history so the model sees proper message boundaries.
 */
export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Parameters for generating an LLM response
 */
export interface GenerateParams {
  systemPrompt: string;
  userPrompt: string;
  /** Prior user/assistant turns (e.g. from session history). Sent as separate messages for better context. */
  conversationHistory?: ConversationTurn[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Response from the LLM
 */
export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  model: string;
}

/**
 * LLM client configuration
 */
export interface LLMClientConfig {
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;
  /** Default max tokens per completion when not overridden by request (default: 8192, or STAKEHOLDER_MCP_MAX_TOKENS env) */
  defaultMaxTokens?: number;
  appUrl?: string;
  appTitle?: string;
}

// Zod schema for consultation context
export const ConsultationContextSchema = z.object({
  sessionId: z.string().optional(),
  projectDescription: z.string().optional(),
  previousFeedback: z.array(z.object({
    stakeholderId: z.string(),
    summary: z.string(),
  })).optional(),
  artifacts: z.array(z.object({
    type: z.enum(["code", "design", "spec", "other"]),
    content: z.string(),
    language: z.string().optional(),
  })).optional(),
});

export type ConsultationContext = z.infer<typeof ConsultationContextSchema>;

/**
 * Full consultation request
 */
export interface ConsultationRequest {
  stakeholderId: string;
  prompt: string;
  context?: ConsultationContext;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Consultation response with metadata
 */
export interface ConsultationResponse {
  stakeholderId: string;
  stakeholderName: string;
  stakeholderRole: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  timestamp: string;
}
