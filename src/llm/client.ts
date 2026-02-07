import OpenAI from "openai";
import type { GenerateParams, LLMResponse, LLMClientConfig } from "./types";

const DEFAULT_MODEL = "anthropic/claude-3-haiku";
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";
/** High default so models can reason about requirements and implementation; override via STAKEHOLDER_MCP_MAX_TOKENS or config.defaultMaxTokens */
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_TEMPERATURE = 0.7;

function getDefaultMaxTokens(configValue?: number): number {
  const envValue = process.env.STAKEHOLDER_MCP_MAX_TOKENS;
  if (configValue != null) return configValue;
  if (envValue !== undefined && envValue !== "") {
    const n = parseInt(envValue, 10);
    if (!Number.isNaN(n) && n >= 1) return Math.min(n, 128_000);
  }
  return DEFAULT_MAX_TOKENS;
}

/**
 * OpenRouter LLM client using OpenAI SDK
 */
export class LLMClient {
  private client: OpenAI;
  private defaultModel: string;
  private defaultMaxTokens: number;

  constructor(config: LLMClientConfig = {}) {
    const apiKey = config.apiKey ?? process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable or pass apiKey in config."
      );
    }

    this.defaultModel =
      config.defaultModel ?? process.env.DEFAULT_MODEL ?? DEFAULT_MODEL;
    this.defaultMaxTokens = getDefaultMaxTokens(config.defaultMaxTokens);

    const defaultHeaders: Record<string, string> = {
      "X-Title": config.appTitle ?? "Stakeholder MCP Server",
    };

    const appUrl = config.appUrl ?? process.env.APP_URL;
    if (appUrl) {
      defaultHeaders["HTTP-Referer"] = appUrl;
    }

    this.client = new OpenAI({
      baseURL: config.baseURL ?? DEFAULT_BASE_URL,
      apiKey,
      defaultHeaders,
    });
  }

  /**
   * Generate a response from the LLM
   */
  async generate(params: GenerateParams): Promise<LLMResponse> {
    const model = params.model ?? this.defaultModel;

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: params.systemPrompt },
        ...(params.conversationHistory ?? []).map((t) => ({
          role: t.role as "user" | "assistant",
          content: t.content,
        })),
        { role: "user", content: params.userPrompt },
      ];
      const completion = await this.client.chat.completions.create({
        model,
        messages,
        temperature: params.temperature ?? DEFAULT_TEMPERATURE,
        max_tokens: params.maxTokens ?? this.defaultMaxTokens,
      });

      const content = completion.choices[0]?.message?.content ?? "";

      return {
        content,
        usage: {
          promptTokens: completion.usage?.prompt_tokens ?? 0,
          completionTokens: completion.usage?.completion_tokens ?? 0,
        },
        model: completion.model ?? model,
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(
          `OpenRouter API error (${error.status}): ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Get the default model being used
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }

  /**
   * Set a new default model
   */
  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }
}

// Singleton instance
let defaultClient: LLMClient | null = null;

/**
 * Get the default LLM client instance
 */
export function getLLMClient(config?: LLMClientConfig): LLMClient {
  if (!defaultClient) {
    defaultClient = new LLMClient(config);
  }
  return defaultClient;
}

/**
 * Reset the default client (useful for testing)
 */
export function resetLLMClient(): void {
  defaultClient = null;
}

/**
 * Helper function to build context string for the prompt
 */
export function buildContextString(context?: {
  sessionId?: string;
  projectDescription?: string;
  previousFeedback?: Array<{ stakeholderId: string; summary: string }>;
  artifacts?: Array<{ type: string; content: string; language?: string }>;
}): string {
  if (!context) return "";

  const parts: string[] = [];

  if (context.projectDescription) {
    parts.push(`## Project Context\n${context.projectDescription}`);
  }

  if (context.previousFeedback?.length) {
    const feedbackText = context.previousFeedback
      .map((f) => `- ${f.stakeholderId}: ${f.summary}`)
      .join("\n");
    parts.push(`## Previous Stakeholder Feedback\n${feedbackText}`);
  }

  if (context.artifacts?.length) {
    const artifactText = context.artifacts
      .map((a) => {
        const lang = a.language ? ` (${a.language})` : "";
        return `### ${a.type}${lang}\n\`\`\`\n${a.content}\n\`\`\``;
      })
      .join("\n\n");
    parts.push(`## Artifacts for Review\n${artifactText}`);
  }

  return parts.length > 0 ? `\n\n${parts.join("\n\n")}` : "";
}
